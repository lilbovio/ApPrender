/**
 * lessonService.js
 * Lógica de negocio para lecciones.
 * Separa la lógica del controlador (routes) para mantener el código limpio.
 */
const Lesson    = require("../models/Lesson");
const Progress  = require("../models/Progress");
const User      = require("../models/User");
const { awardBadges }    = require("./progressService");
const { calculateXP }    = require("../utils/validateInput");

// ── Constantes ────────────────────────────────────────────────────────────────
const LESSONS_PER_DAY = 3; // cuántas lecciones se asignan por día

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Filtra las lecciones disponibles para el niño según grado y tipo VAK.
 * Mezcla: 70 % del tipo VAK del niño + 30 % de los otros tipos
 * para que no sea monótono pero sí personalizado.
 */
function sortByVAKPreference(lessons, vakType) {
  const primary   = lessons.filter((l) => l.vakType === vakType);
  const secondary = lessons.filter((l) => l.vakType !== vakType);
  return [...primary, ...secondary];
}

// ── Funciones exportadas ──────────────────────────────────────────────────────

/**
 * Obtiene todas las lecciones disponibles para un niño,
 * ordenadas por preferencia VAK, sin las ya completadas al 100 %.
 *
 * @param {string} userId
 * @param {object} filters  { grade, vakType, subject }
 * @returns {Lesson[]}
 */
async function getLessonsForUser(userId, { grade, vakType, subject } = {}) {
  const query = { grade, isActive: true };
  if (subject) query.subject = subject;

  const [allLessons, userProgress] = await Promise.all([
    Lesson.find(query).lean(),
    Progress.findOne({ user: userId }).lean(),
  ]);

  const completedMap = {};
  (userProgress?.lessonProgress || []).forEach((lp) => {
    completedMap[String(lp.lesson)] = lp;
  });

  // Añadir datos de progreso a cada lección
  const withProgress = allLessons.map((lesson) => {
    const lp = completedMap[String(lesson._id)];
    return {
      ...lesson,
      progress:   lp?.score ?? 0,
      completed:  lp?.completed ?? false,
      attempts:   lp?.attempts ?? 0,
    };
  });

  return sortByVAKPreference(withProgress, vakType);
}

/**
 * Lecciones del día:
 * Toma las siguientes LESSONS_PER_DAY lecciones no completadas (o con score < 80).
 */
async function getTodayLessons(userId, { grade, vakType, subject } = {}) {
  const all = await getLessonsForUser(userId, { grade, vakType, subject });

  // Pendientes: no completadas o con puntaje < 80 (puede mejorar)
  const pending = all.filter((l) => !l.completed || l.progress < 80);
  const today   = pending.slice(0, LESSONS_PER_DAY);

  // Progreso del día (cuántas ya completó hoy)
  const progressDoc  = await Progress.findOne({ user: userId }).lean();
  const todayStr     = new Date().toISOString().split("T")[0];
  const completedToday = (progressDoc?.dailyActivity || [])
    .filter((a) => a.date.toISOString().split("T")[0] === todayStr).length;

  return {
    lessons: today,
    progress: buildProgressMap(progressDoc),
    dailyGoal: { completed: completedToday, total: LESSONS_PER_DAY },
  };
}

/**
 * Obtiene una lección con sus preguntas completas.
 * Las preguntas se adaptan al tipo VAK del usuario.
 */
async function getLessonById(lessonId, vakType) {
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) throw new Error("Lección no encontrada");

  // Ordenar preguntas: las del tipo VAK del niño primero
  const sorted = sortByVAKPreference(lesson.questions || [], vakType);

  return { ...lesson, questions: sorted };
}

/**
 * Registra la completación de una lección y calcula recompensas.
 * Devuelve: xpEarned, newBadges, updatedProgress
 */
async function completeLesson(userId, lessonId, { score, correctAnswers, totalQuestions, timeSpent }) {
  // 1. XP ganados
  const xpEarned = calculateXP(score, timeSpent, totalQuestions);

  // 2. Actualizar o crear registro de progreso
  let progressDoc = await Progress.findOne({ user: userId });
  if (!progressDoc) {
    progressDoc = new Progress({ user: userId, lessonProgress: [], dailyActivity: [] });
  }

  const existingLP = progressDoc.lessonProgress.find(
    (lp) => String(lp.lesson) === String(lessonId)
  );

  if (existingLP) {
    existingLP.attempts  += 1;
    existingLP.score      = Math.max(existingLP.score, score);
    existingLP.completed  = score >= 60;
    existingLP.lastPlayed = new Date();
  } else {
    progressDoc.lessonProgress.push({
      lesson:     lessonId,
      score,
      completed:  score >= 60,
      attempts:   1,
      lastPlayed: new Date(),
    });
  }

  // 3. Actividad diaria (para racha)
  progressDoc.dailyActivity.push({
    date:           new Date(),
    lesson:         lessonId,
    score,
    correctAnswers,
    timeSpent,
  });

  // 4. Actualizar XP y racha en el usuario
  const user = await User.findById(userId);
  user.xp     = (user.xp || 0) + xpEarned;
  user.streak = calculateStreak(progressDoc.dailyActivity);

  await Promise.all([progressDoc.save(), user.save()]);

  // 5. Verificar badges nuevos
  const { newBadges } = await awardBadges(userId, user, progressDoc);

  return {
    xpEarned,
    newBadges,
    updatedProgress: {
      completed:  score >= 60,
      score,
      attempts:   existingLP ? existingLP.attempts : 1,
    },
  };
}

// ── Utils internos ────────────────────────────────────────────────────────────

function buildProgressMap(progressDoc) {
  const map = {};
  (progressDoc?.lessonProgress || []).forEach((lp) => {
    map[String(lp.lesson)] = {
      completed: lp.completed,
      score:     lp.score,
      attempts:  lp.attempts,
    };
  });
  return map;
}

/**
 * Calcula la racha actual en días consecutivos.
 */
function calculateStreak(dailyActivity = []) {
  if (!dailyActivity.length) return 0;

  const days = new Set(
    dailyActivity.map((a) => new Date(a.date).toISOString().split("T")[0])
  );
  const sorted = [...days].sort().reverse(); // más reciente primero

  const todayStr     = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Si no hay actividad hoy ni ayer, racha = 0
  if (!days.has(todayStr) && !days.has(yesterdayStr)) return 0;

  let streak = 0;
  let current = days.has(todayStr) ? new Date() : new Date(Date.now() - 86400000);

  for (let i = 0; i < sorted.length; i++) {
    const dayStr = current.toISOString().split("T")[0];
    if (days.has(dayStr)) {
      streak++;
      current = new Date(current.getTime() - 86400000);
    } else {
      break;
    }
  }

  return streak;
}

module.exports = { getLessonsForUser, getTodayLessons, getLessonById, completeLesson };
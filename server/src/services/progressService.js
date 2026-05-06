/**
 * progressService.js
 * Lógica de progreso del alumno:
 * XP, nivel, racha, badges/logros, actividad semanal.
 */
const User     = require("../models/User");
const Progress = require("../models/Progress");
const { sendBadgeEmail } = require("./emailService");

// ── Definición de badges ──────────────────────────────────────────────────────
// Cada badge tiene: id, emoji, name, description, condition(user, progress) → bool
const BADGE_DEFINITIONS = [
  // Primeras lecciones
  {
    id: "first_lesson",
    emoji: "🌱",
    name: "Primer Paso",
    description: "Completa tu primera lección",
    condition: (u, p) => (p.lessonProgress || []).filter((lp) => lp.completed).length >= 1,
  },
  {
    id: "five_lessons",
    emoji: "📖",
    name: "Estudioso",
    description: "Completa 5 lecciones",
    condition: (u, p) => (p.lessonProgress || []).filter((lp) => lp.completed).length >= 5,
  },
  {
    id: "twenty_lessons",
    emoji: "🎓",
    name: "Graduado",
    description: "Completa 20 lecciones",
    condition: (u, p) => (p.lessonProgress || []).filter((lp) => lp.completed).length >= 20,
  },
  // Puntaje perfecto
  {
    id: "perfect_score",
    emoji: "💯",
    name: "¡Perfecto!",
    description: "Obtén 100% en cualquier lección",
    condition: (u, p) => (p.lessonProgress || []).some((lp) => lp.score === 100),
  },
  // Racha
  {
    id: "streak_3",
    emoji: "🔥",
    name: "En Racha",
    description: "Estudia 3 días seguidos",
    condition: (u) => (u.streak || 0) >= 3,
  },
  {
    id: "streak_7",
    emoji: "⚡",
    name: "Semana Completa",
    description: "Estudia 7 días seguidos",
    condition: (u) => (u.streak || 0) >= 7,
  },
  {
    id: "streak_30",
    emoji: "🌟",
    name: "Imparable",
    description: "Estudia 30 días seguidos",
    condition: (u) => (u.streak || 0) >= 30,
  },
  // XP
  {
    id: "xp_100",
    emoji: "⭐",
    name: "Principiante",
    description: "Alcanza 100 XP",
    condition: (u) => (u.xp || 0) >= 100,
  },
  {
    id: "xp_500",
    emoji: "🌠",
    name: "Aventurero",
    description: "Alcanza 500 XP",
    condition: (u) => (u.xp || 0) >= 500,
  },
  {
    id: "xp_1000",
    emoji: "🏆",
    name: "Campeón",
    description: "Alcanza 1000 XP",
    condition: (u) => (u.xp || 0) >= 1000,
  },
  // Materias
  {
    id: "math_master",
    emoji: "🔢",
    name: "Matemático",
    description: "Completa 10 lecciones de Matemáticas",
    condition: (u, p, lessons) =>
      (lessons || []).filter((l) => l.subject === "math" &&
        (p.lessonProgress || []).some((lp) => String(lp.lesson) === String(l._id) && lp.completed)
      ).length >= 10,
  },
  {
    id: "english_master",
    emoji: "🔤",
    name: "Lingüista",
    description: "Completa 10 lecciones de Inglés",
    condition: (u, p, lessons) =>
      (lessons || []).filter((l) => l.subject === "english" &&
        (p.lessonProgress || []).some((lp) => String(lp.lesson) === String(l._id) && lp.completed)
      ).length >= 10,
  },
];

// ── Funciones exportadas ──────────────────────────────────────────────────────

/**
 * Revisa qué badges nuevos ganó el alumno y los guarda.
 * Envía correo por cada badge nuevo.
 *
 * @returns {{ newBadges: Array }}
 */
async function awardBadges(userId, user, progressDoc, lessons = []) {
  const earned    = new Set((progressDoc.badges || []).map((b) => b.badgeId));
  const newBadges = [];

  for (const def of BADGE_DEFINITIONS) {
    if (earned.has(def.id)) continue;
    try {
      if (def.condition(user, progressDoc, lessons)) {
        progressDoc.badges = progressDoc.badges || [];
        progressDoc.badges.push({ badgeId: def.id, earnedAt: new Date() });
        newBadges.push({ id: def.id, emoji: def.emoji, name: def.name, description: def.description });

        // Email en background (no bloquea)
        sendBadgeEmail(user.email, user.name, def).catch(() => {});
      }
    } catch (_) { /* condición falló, ignorar */ }
  }

  if (newBadges.length) await progressDoc.save();

  return { newBadges };
}

/**
 * Devuelve el progreso completo del alumno para la pantalla de Home/Perfil.
 */
async function getFullProgress(userId) {
  const [user, progressDoc] = await Promise.all([
    User.findById(userId).lean(),
    Progress.findOne({ user: userId }).lean(),
  ]);

  if (!user) throw new Error("Usuario no encontrado");

  const xp      = user.xp || 0;
  const streak  = user.streak || 0;

  // Actividad últimos 7 días (L-D)
  const lastWeek = buildLastWeekActivity(progressDoc?.dailyActivity || []);

  // Badges: mezclar definiciones con los ganados
  const earnedMap = {};
  (progressDoc?.badges || []).forEach((b) => { earnedMap[b.badgeId] = b.earnedAt; });

  const badges = BADGE_DEFINITIONS.map((def) => ({
    id:          def.id,
    emoji:       def.emoji,
    name:        def.name,
    description: def.description,
    earned:      !!earnedMap[def.id],
    earnedAt:    earnedMap[def.id] || null,
  }));

  // Meta del día
  const todayStr      = new Date().toISOString().split("T")[0];
  const completedToday = (progressDoc?.dailyActivity || [])
    .filter((a) => new Date(a.date).toISOString().split("T")[0] === todayStr).length;

  return {
    xp,
    streak,
    lastWeek,
    badges,
    dailyGoal: { completed: Math.min(completedToday, 3), total: 3 },
  };
}

// ── Utils internos ────────────────────────────────────────────────────────────

/**
 * Devuelve array de 7 bools (L=0 … D=6) indicando si hubo actividad ese día.
 */
function buildLastWeekActivity(dailyActivity = []) {
  const result = Array(7).fill(false);
  const today  = new Date();

  for (let i = 0; i < 7; i++) {
    const d    = new Date(today);
    d.setDate(today.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];

    const hasActivity = dailyActivity.some(
      (a) => new Date(a.date).toISOString().split("T")[0] === dayStr
    );

    // Convertir de JS (0=dom) a semana L-D (0=lun)
    const jsDay  = d.getDay();                  // 0=dom
    const lmDay  = (jsDay + 6) % 7;             // 0=lun
    result[lmDay] = hasActivity;
  }

  return result;
}

module.exports = { awardBadges, getFullProgress, BADGE_DEFINITIONS };
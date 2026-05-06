/**
 * vakService.js
 * Lógica del test VAK (Visual – Auditivo – Kinestésico).
 * Calcula el tipo de aprendizaje dominante del niño
 * y guarda el resultado en su perfil.
 */
const User = require("../models/User");

// ── Preguntas del test ────────────────────────────────────────────────────────
// Cada pregunta tiene 3 opciones, cada una mapea a un tipo VAK.
// El niño elige la que más lo describe → sumamos puntos por tipo.

const VAK_QUESTIONS = [
  {
    id: 1,
    question: "Cuando aprendes algo nuevo, ¿qué prefieres?",
    emoji: "🤔",
    options: [
      { text: "Ver imágenes, dibujos o videos", type: "visual",      emoji: "👀" },
      { text: "Escuchar una explicación o canción", type: "auditory", emoji: "👂" },
      { text: "Hacerlo yo mismo, tocarlo o moverme", type: "kinesthetic", emoji: "🙌" },
    ],
  },
  {
    id: 2,
    question: "Cuando tienes que recordar algo, ¿cómo lo haces?",
    emoji: "🧠",
    options: [
      { text: "Me imagino una imagen o un color", type: "visual",    emoji: "🎨" },
      { text: "Lo repito en mi cabeza o en voz alta", type: "auditory", emoji: "🔊" },
      { text: "Lo practico varias veces con mis manos", type: "kinesthetic", emoji: "✍️" },
    ],
  },
  {
    id: 3,
    question: "En clase, ¿qué te gusta más?",
    emoji: "🏫",
    options: [
      { text: "Que el maestro escriba en el pizarrón", type: "visual",   emoji: "📝" },
      { text: "Que el maestro explique en voz alta",   type: "auditory", emoji: "🎤" },
      { text: "Hacer experimentos o actividades",      type: "kinesthetic", emoji: "🔬" },
    ],
  },
  {
    id: 4,
    question: "Cuando juegas o haces algo por primera vez, ¿cómo aprendes?",
    emoji: "🎮",
    options: [
      { text: "Veo cómo lo hace alguien más primero", type: "visual",   emoji: "👁️" },
      { text: "Alguien me explica paso a paso",        type: "auditory", emoji: "💬" },
      { text: "Lo intento yo solo sin leer instrucciones", type: "kinesthetic", emoji: "🚀" },
    ],
  },
  {
    id: 5,
    question: "¿Cuál de estas actividades te divierte más?",
    emoji: "⭐",
    options: [
      { text: "Dibujar, colorear o ver películas",       type: "visual",   emoji: "🎨" },
      { text: "Escuchar música o contar historias",      type: "auditory", emoji: "🎵" },
      { text: "Bailar, correr o armar cosas con mis manos", type: "kinesthetic", emoji: "🤸" },
    ],
  },
  {
    id: 6,
    question: "Cuando algo no lo entiendes, ¿qué haces?",
    emoji: "🤷",
    options: [
      { text: "Busco un video o un libro con fotos",   type: "visual",   emoji: "📚" },
      { text: "Le pido a alguien que me lo explique",  type: "auditory", emoji: "🗣️" },
      { text: "Lo intento hasta que me salga bien",    type: "kinesthetic", emoji: "💪" },
    ],
  },
  {
    id: 7,
    question: "¿Cómo prefieres que sean tus tareas?",
    emoji: "📋",
    options: [
      { text: "Con muchos dibujos y esquemas",          type: "visual",   emoji: "🗺️" },
      { text: "Que pueda explicar algo en voz alta",   type: "auditory", emoji: "🎙️" },
      { text: "Que pueda recortar, pegar o construir", type: "kinesthetic", emoji: "✂️" },
    ],
  },
  {
    id: 8,
    question: "Si tuvieras que aprender los colores del arcoíris, ¿cómo lo harías mejor?",
    emoji: "🌈",
    options: [
      { text: "Viendo el arcoíris o pintando uno",           type: "visual",   emoji: "🎨" },
      { text: "Cantando una canción con los colores",         type: "auditory", emoji: "🎶" },
      { text: "Usando pinturas y tocando cada color",         type: "kinesthetic", emoji: "🖌️" },
    ],
  },
  {
    id: 9,
    question: "Cuando terminas de aprender algo nuevo, ¿cómo sabes que ya lo sabes?",
    emoji: "✅",
    options: [
      { text: "Puedo visualizarlo claramente en mi cabeza",  type: "visual",   emoji: "🧩" },
      { text: "Puedo explicárselo a alguien",                type: "auditory", emoji: "💬" },
      { text: "Puedo hacerlo solo sin ayuda",                type: "kinesthetic", emoji: "🏆" },
    ],
  },
  {
    id: 10,
    question: "¿Qué tipo de juego te gusta más?",
    emoji: "🎲",
    options: [
      { text: "Puzzles, memorama o encontrar diferencias", type: "visual",   emoji: "🧩" },
      { text: "Adivinanzas, trabalenguas o historias",     type: "auditory", emoji: "🎤" },
      { text: "Deportes, construir o experimentos",        type: "kinesthetic", emoji: "⚽" },
    ],
  },
];

// ── Funciones exportadas ──────────────────────────────────────────────────────

/**
 * Devuelve las preguntas del test VAK (sin las respuestas correctas).
 */
function getVAKQuestions() {
  return VAK_QUESTIONS.map((q) => ({
    id:       q.id,
    question: q.question,
    emoji:    q.emoji,
    options:  q.options.map((o, idx) => ({
      index: idx,
      text:  o.text,
      emoji: o.emoji,
      // NO enviamos el tipo al cliente para evitar trampa
    })),
  }));
}

/**
 * Calcula el tipo VAK dominante a partir de las respuestas del niño.
 *
 * @param {Array<{ questionId: number, selectedIndex: number }>} answers
 * @returns {{ vakType: string, scores: object, breakdown: object }}
 */
function calculateVAKType(answers = []) {
  const scores = { visual: 0, auditory: 0, kinesthetic: 0 };

  for (const answer of answers) {
    const question = VAK_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const option = question.options[answer.selectedIndex];
    if (!option) continue;

    scores[option.type] = (scores[option.type] || 0) + 1;
  }

  // Tipo dominante
  const vakType = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)[0][0];

  // Porcentajes
  const total = Object.values(scores).reduce((s, v) => s + v, 0) || 1;
  const breakdown = {
    visual:      Math.round((scores.visual      / total) * 100),
    auditory:    Math.round((scores.auditory    / total) * 100),
    kinesthetic: Math.round((scores.kinesthetic / total) * 100),
  };

  return { vakType, scores, breakdown };
}

/**
 * Guarda el tipo VAK en el perfil del usuario.
 *
 * @param {string} userId
 * @param {string} vakType  "visual" | "auditory" | "kinesthetic"
 * @returns {User}
 */
async function saveVAKType(userId, vakType) {
  const validTypes = ["visual", "auditory", "kinesthetic"];
  if (!validTypes.includes(vakType)) throw new Error("Tipo VAK no válido");

  const user = await User.findByIdAndUpdate(
    userId,
    { vakType, vakTestCompletedAt: new Date() },
    { new: true }
  ).select("-password");

  if (!user) throw new Error("Usuario no encontrado");
  return user;
}

module.exports = { getVAKQuestions, calculateVAKType, saveVAKType, VAK_QUESTIONS };
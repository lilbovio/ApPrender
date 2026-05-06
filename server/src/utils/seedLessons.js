/**
 * seedLessons.js
 * Puebla la base de datos con lecciones para todos los grados (1-6),
 * ambas materias (math / english) y los tres tipos VAK.
 *
 * Uso:
 *   node server/utils/seedLessons.js
 *   o importar y llamar seedLessons() desde app.js en desarrollo.
 */
const mongoose = require("mongoose");
const Lesson   = require("../models/Lesson");
require("dotenv").config();

// ── Datos de semilla ──────────────────────────────────────────────────────────

const LESSONS_SEED = [
  // ══════════ MATEMÁTICAS ══════════

  // Grado 1 – Sumas básicas
  {
    title: "Sumas con deditos 🖐️",
    subject: "math", grade: 1, vakType: "kinesthetic",
    emoji: "➕", duration: "8 min", isActive: true,
    description: "Aprende a sumar usando tus dedos.",
    questions: [
      {
        text: "¿Cuánto es 2 + 3?", emoji: "🖐️", vakType: "kinesthetic",
        options: ["4", "5", "6", "7"], correctIndex: 1,
      },
      {
        text: "¿Cuánto es 1 + 4?", emoji: "✋", vakType: "kinesthetic",
        options: ["3", "4", "5", "6"], correctIndex: 2,
      },
      {
        text: "¿Cuánto es 3 + 3?", emoji: "🤲", vakType: "kinesthetic",
        options: ["5", "6", "7", "8"], correctIndex: 1,
      },
    ],
  },
  {
    title: "Sumando con imágenes 🍎",
    subject: "math", grade: 1, vakType: "visual",
    emoji: "🍎", duration: "10 min", isActive: true,
    description: "Cuenta manzanas y suma.",
    questions: [
      {
        text: "🍎🍎 + 🍎 = ?", emoji: "🍎", vakType: "visual",
        options: ["2", "3", "4", "5"], correctIndex: 1,
      },
      {
        text: "🍊🍊🍊 + 🍊🍊 = ?", emoji: "🍊", vakType: "visual",
        options: ["4", "5", "6", "7"], correctIndex: 1,
      },
    ],
  },
  {
    title: "Canción de la suma ➕",
    subject: "math", grade: 1, vakType: "auditory",
    emoji: "🎵", duration: "7 min", isActive: true,
    description: "Escucha y aprende a sumar cantando.",
    questions: [
      {
        text: "Si tengo 4 y le agrego 2, ¿cuántos tengo?", emoji: "🎵", vakType: "auditory",
        options: ["5", "6", "7", "8"], correctIndex: 1,
      },
      {
        text: "Si tengo 5 y le agrego 5, ¿cuántos tengo?", emoji: "🎶", vakType: "auditory",
        options: ["8", "9", "10", "11"], correctIndex: 2,
      },
    ],
  },

  // Grado 1 – Números
  {
    title: "¿Qué número es? 🔢",
    subject: "math", grade: 1, vakType: "visual",
    emoji: "🔢", duration: "8 min", isActive: true,
    description: "Identifica los números del 1 al 10.",
    questions: [
      {
        text: "¿Qué número ves aquí? ⑦", emoji: "🔢", vakType: "visual",
        options: ["5", "6", "7", "8"], correctIndex: 2,
      },
      {
        text: "¿Cuántas estrellas hay? ⭐⭐⭐⭐", emoji: "⭐", vakType: "visual",
        options: ["3", "4", "5", "6"], correctIndex: 1,
      },
    ],
  },

  // Grado 2 – Restas
  {
    title: "Restar es fácil ➖",
    subject: "math", grade: 2, vakType: "visual",
    emoji: "➖", duration: "10 min", isActive: true,
    description: "Aprende a restar con imágenes.",
    questions: [
      {
        text: "🍭🍭🍭🍭🍭 – 🍭🍭 = ?", emoji: "🍭", vakType: "visual",
        options: ["2", "3", "4", "5"], correctIndex: 1,
      },
      {
        text: "¿Cuánto es 8 – 3?", emoji: "➖", vakType: "visual",
        options: ["4", "5", "6", "7"], correctIndex: 1,
      },
    ],
  },

  // Grado 3 – Multiplicación
  {
    title: "Tablas con saltos 🐸",
    subject: "math", grade: 3, vakType: "kinesthetic",
    emoji: "🐸", duration: "12 min", isActive: true,
    description: "Aprende la tabla del 2 saltando.",
    questions: [
      {
        text: "2 × 3 = ?", emoji: "🐸", vakType: "kinesthetic",
        options: ["4", "5", "6", "7"], correctIndex: 2,
      },
      {
        text: "2 × 5 = ?", emoji: "🦘", vakType: "kinesthetic",
        options: ["8", "9", "10", "11"], correctIndex: 2,
      },
    ],
  },

  // Grado 4 – División
  {
    title: "¿Cómo repartir? 🍕",
    subject: "math", grade: 4, vakType: "visual",
    emoji: "🍕", duration: "12 min", isActive: true,
    description: "Aprende divisiones repartiendo pizza.",
    questions: [
      {
        text: "8 ÷ 2 = ?", emoji: "🍕", vakType: "visual",
        options: ["2", "3", "4", "5"], correctIndex: 2,
      },
      {
        text: "12 ÷ 3 = ?", emoji: "🍰", vakType: "visual",
        options: ["3", "4", "5", "6"], correctIndex: 1,
      },
    ],
  },

  // Grado 5 – Fracciones
  {
    title: "Mitades y cuartos 🍫",
    subject: "math", grade: 5, vakType: "visual",
    emoji: "🍫", duration: "14 min", isActive: true,
    description: "Entiende las fracciones con chocolate.",
    questions: [
      {
        text: "Si parto una barra en 2 partes iguales, ¿qué fracción es cada parte?",
        emoji: "🍫", vakType: "visual",
        options: ["1/3", "1/2", "1/4", "2/3"], correctIndex: 1,
      },
    ],
  },

  // Grado 6 – Porcentajes
  {
    title: "¿Qué es el porcentaje? 💯",
    subject: "math", grade: 6, vakType: "auditory",
    emoji: "💯", duration: "15 min", isActive: true,
    description: "Escucha y aprende qué es el %.",
    questions: [
      {
        text: "¿Cuánto es el 50% de 100?", emoji: "💯", vakType: "auditory",
        options: ["25", "40", "50", "75"], correctIndex: 2,
      },
      {
        text: "¿Cuánto es el 25% de 200?", emoji: "📊", vakType: "auditory",
        options: ["25", "50", "75", "100"], correctIndex: 1,
      },
    ],
  },

  // ══════════ INGLÉS ══════════

  // Grado 1 – Colores
  {
    title: "Colors 🎨",
    subject: "english", grade: 1, vakType: "visual",
    emoji: "🎨", duration: "8 min", isActive: true,
    description: "Learn the colors in English.",
    questions: [
      {
        text: "What color is the sky? 🌤️", emoji: "☁️", vakType: "visual",
        options: ["Red", "Green", "Blue", "Yellow"], correctIndex: 2,
      },
      {
        text: "What color is the sun? ☀️", emoji: "☀️", vakType: "visual",
        options: ["Blue", "Yellow", "Red", "Purple"], correctIndex: 1,
      },
      {
        text: "What color is grass? 🌿", emoji: "🌿", vakType: "visual",
        options: ["Orange", "Pink", "Green", "Brown"], correctIndex: 2,
      },
    ],
  },
  {
    title: "Color Song 🎵",
    subject: "english", grade: 1, vakType: "auditory",
    emoji: "🎵", duration: "7 min", isActive: true,
    description: "Sing and learn the colors!",
    questions: [
      {
        text: "Listen: 'The apple is ___.' What color?", emoji: "🍎", vakType: "auditory",
        options: ["Blue", "Red", "Green", "Purple"], correctIndex: 1,
      },
    ],
  },

  // Grado 1 – Animals
  {
    title: "Animals 🐾",
    subject: "english", grade: 1, vakType: "visual",
    emoji: "🐾", duration: "10 min", isActive: true,
    description: "Learn animal names in English.",
    questions: [
      {
        text: "What is this? 🐶", emoji: "🐶", vakType: "visual",
        options: ["Cat", "Dog", "Bird", "Fish"], correctIndex: 1,
      },
      {
        text: "What is this? 🐱", emoji: "🐱", vakType: "visual",
        options: ["Dog", "Rabbit", "Cat", "Cow"], correctIndex: 2,
      },
      {
        text: "What is this? 🐦", emoji: "🐦", vakType: "visual",
        options: ["Fish", "Bird", "Frog", "Duck"], correctIndex: 1,
      },
    ],
  },

  // Grado 2 – Numbers
  {
    title: "Numbers in English 🔢",
    subject: "english", grade: 2, vakType: "auditory",
    emoji: "🔢", duration: "9 min", isActive: true,
    description: "Count in English!",
    questions: [
      {
        text: "How do you say '5' in English?", emoji: "5️⃣", vakType: "auditory",
        options: ["Four", "Six", "Five", "Three"], correctIndex: 2,
      },
      {
        text: "How do you say '10' in English?", emoji: "🔟", vakType: "auditory",
        options: ["Eight", "Nine", "Eleven", "Ten"], correctIndex: 3,
      },
    ],
  },

  // Grado 3 – Family
  {
    title: "My Family 👨‍👩‍👧",
    subject: "english", grade: 3, vakType: "visual",
    emoji: "👨‍👩‍👧", duration: "10 min", isActive: true,
    description: "Learn family words in English.",
    questions: [
      {
        text: "What do you call your mom in English?", emoji: "👩", vakType: "visual",
        options: ["Father", "Sister", "Mother", "Brother"], correctIndex: 2,
      },
      {
        text: "What do you call your dad in English?", emoji: "👨", vakType: "visual",
        options: ["Mother", "Father", "Sister", "Cousin"], correctIndex: 1,
      },
    ],
  },

  // Grado 4 – Verbs
  {
    title: "Action Verbs ⚡",
    subject: "english", grade: 4, vakType: "kinesthetic",
    emoji: "⚡", duration: "12 min", isActive: true,
    description: "Do the action and learn the verb!",
    questions: [
      {
        text: "What action is 🏃?", emoji: "🏃", vakType: "kinesthetic",
        options: ["Sleep", "Eat", "Run", "Jump"], correctIndex: 2,
      },
      {
        text: "What action is 🍽️?", emoji: "🍽️", vakType: "kinesthetic",
        options: ["Drink", "Eat", "Cook", "Sleep"], correctIndex: 1,
      },
    ],
  },

  // Grado 5 – Adjectives
  {
    title: "Describing things 📝",
    subject: "english", grade: 5, vakType: "visual",
    emoji: "📝", duration: "13 min", isActive: true,
    description: "Learn adjectives in English.",
    questions: [
      {
        text: "How do you say 'grande' in English?", emoji: "🐘", vakType: "visual",
        options: ["Small", "Fast", "Big", "Old"], correctIndex: 2,
      },
      {
        text: "How do you say 'rápido' in English?", emoji: "🐆", vakType: "visual",
        options: ["Slow", "Fast", "Tall", "Short"], correctIndex: 1,
      },
    ],
  },

  // Grado 6 – Past tense
  {
    title: "Past Tense 🕰️",
    subject: "english", grade: 6, vakType: "auditory",
    emoji: "🕰️", duration: "15 min", isActive: true,
    description: "Learn to talk about yesterday.",
    questions: [
      {
        text: "What is the past tense of 'run'?", emoji: "🏃", vakType: "auditory",
        options: ["Runned", "Running", "Ran", "Runs"], correctIndex: 2,
      },
      {
        text: "What is the past tense of 'eat'?", emoji: "🍔", vakType: "auditory",
        options: ["Eated", "Eating", "Eats", "Ate"], correctIndex: 3,
      },
    ],
  },
];

// ── Función principal ─────────────────────────────────────────────────────────

async function seedLessons(force = false) {
  try {
    const count = await Lesson.countDocuments();

    if (count > 0 && !force) {
      console.log(`ℹ️  Ya existen ${count} lecciones. Usa force=true para re-sembrar.`);
      return;
    }

    if (force) await Lesson.deleteMany({});

    const created = await Lesson.insertMany(LESSONS_SEED);
    console.log(`✅ ${created.length} lecciones sembradas correctamente.`);
    return created;
  } catch (err) {
    console.error("❌ Error al sembrar lecciones:", err.message);
    throw err;
  }
}

// ── Ejecución directa (node seedLessons.js) ───────────────────────────────────
if (require.main === module) {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mathkids";
  mongoose
    .connect(MONGO_URI)
    .then(() => seedLessons(true))
    .then(() => mongoose.disconnect())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = seedLessons;
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Lesson from '../models/Lesson.js';

dotenv.config();

const lessons = [
  // ENGLISH LESSONS (Grade 1 & 2)
  {
    title: "Saludos y Presentación",
    description: "Aprende a decir hola y adiós",
    subject: "english",
    grade: "1",
    icon: "👋",
    xp: 50,
    vakType: "all",
    content: {
      words: ["Hello", "Goodbye", "Good morning"],
      audio: "greetings.mp3"
    }
  },
  {
    title: "Números del 1-10",
    description: "Cuenta con nosotros",
    subject: "english",
    grade: "1",
    icon: "🔢",
    xp: 75,
    vakType: "all",
    content: {
      words: ["One", "Two", "Three"],
      audio: "numbers.mp3"
    }
  },
  {
    title: "Colores Básicos",
    description: "Rojo, azul, amarillo...",
    subject: "english",
    grade: "1",
    icon: "🎨",
    xp: 60,
    vakType: "all",
    content: {
      words: ["Red", "Blue", "Yellow"],
      audio: "colors.mp3"
    }
  },
  {
    title: "Animales Comunes",
    description: "Aprende los animales de la granja",
    subject: "english",
    grade: "2",
    icon: "🐶",
    xp: 80,
    vakType: "all",
    content: {
      words: ["Dog", "Cat", "Cow"],
      audio: "animals.mp3"
    }
  },
  // MATH LESSONS (Visual)
  {
    title: "Sumas Divertidas (Visual)",
    description: "Aprende a sumar viendo manzanas",
    subject: "math",
    grade: "1",
    icon: "🍎",
    xp: 50,
    vakType: "visual",
    content: {
      images: ["apples_2_plus_2.png"],
      equation: "2 + 2 = 4"
    }
  },
  // MATH LESSONS (Auditivo)
  {
    title: "Sumas Cantando (Auditivo)",
    description: "Escucha la canción de los números",
    subject: "math",
    grade: "1",
    icon: "🎵",
    xp: 50,
    vakType: "auditivo",
    content: {
      audio: "sum_song.mp3",
      lyrics: "Dos más dos es cuatro, cantemos un rato!"
    }
  },
  // MATH LESSONS (Kinestesico)
  {
    title: "Sumas con Bloques (Kinestésico)",
    description: "Arrastra los bloques para sumar",
    subject: "math",
    grade: "1",
    icon: "🧱",
    xp: 50,
    vakType: "kinestesico",
    content: {
      interactiveGame: "block_drag_and_drop",
      equation: "3 + 1 = 4"
    }
  },
  // MATH LESSONS (Grade 2, All)
  {
    title: "Restas Fáciles",
    description: "Quitar cosas es divertido",
    subject: "math",
    grade: "2",
    icon: "➖",
    xp: 60,
    vakType: "all",
    content: {
      equation: "5 - 2 = 3"
    }
  },
  {
    title: "Figuras Geométricas",
    description: "Círculos, cuadrados y más",
    subject: "math",
    grade: "2",
    icon: "🔺",
    xp: 65,
    vakType: "all",
    content: {
      shapes: ["circle", "square", "triangle"]
    }
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/mathkids';
    console.log(`Conectando a MongoDB en: ${mongoUri}...`);
    
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Conectado!');

    // Eliminar lecciones anteriores para evitar duplicados
    await Lesson.deleteMany();
    console.log('🧹 Lecciones anteriores eliminadas.');

    // Insertar nuevas lecciones
    await Lesson.insertMany(lessons);
    console.log('🌱 Base de datos poblada con lecciones de prueba exitosamente.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
};

seedDB();

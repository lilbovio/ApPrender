/**
 * app.js
 * Punto de entrada del servidor Express + MongoDB.
 * Registra middlewares, rutas y arranca el servidor.
 */
require("dotenv").config();
const express    = require("express");
const mongoose   = require("mongoose");
const cors       = require("cors");
const morgan     = require("morgan");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const path       = require("path");

const app = express();

// ── Variables de entorno ──────────────────────────────────────────────────────
const PORT      = process.env.PORT      || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mathkids";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const NODE_ENV  = process.env.NODE_ENV  || "development";

// ── Middlewares globales ──────────────────────────────────────────────────────

// Seguridad de headers HTTP
app.use(helmet());

// CORS — solo permite el origen del cliente
app.use(cors({
  origin: NODE_ENV === "production"
    ? CLIENT_URL
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Parser de JSON
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Logger de peticiones (solo en dev)
if (NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Rate limiting global — protege de abusos
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Demasiadas peticiones. Espera un momento." },
});
app.use("/api", globalLimiter);

// Rate limiting estricto para auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Demasiados intentos de inicio de sesión. Espera 15 minutos." },
});

// ── Archivos estáticos (fotos de perfil) ─────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Rutas de la API ───────────────────────────────────────────────────────────
const authRoutes     = require("./routes/authRoutes");
const lessonRoutes   = require("./routes/lessonRoutes");
const progressRoutes = require("./routes/progressRoutes");
const vakRoutes      = require("./routes/vakRoutes");
const profileRoutes  = require("./routes/profileRoutes");

app.use("/api/auth",     authLimiter, authRoutes);
app.use("/api/lessons",  lessonRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/vak",      vakRoutes);
app.use("/api/profile",  profileRoutes);

// ── Ruta de salud ─────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    env: NODE_ENV,
    time: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada." });
});

// ── Manejo global de errores ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: status === 500 ? "Error interno del servidor." : err.message,
    ...(NODE_ENV !== "production" && { stack: err.stack }),
  });
});

// ── Conexión a MongoDB y arranque ─────────────────────────────────────────────
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB conectado:", MONGO_URI.replace(/\/\/.*@/, "//***@"));

    // Sembrar lecciones si la BD está vacía (solo en dev)
    if (NODE_ENV !== "production") {
      const seedLessons = require("./utils/seedLessons");
      await seedLessons(false); // false = no forzar si ya existen
    }

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${NODE_ENV}`);
    });
  } catch (err) {
    console.error("❌ Error al iniciar el servidor:", err.message);
    process.exit(1);
  }
}

// ── Manejo de errores no capturados ──────────────────────────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("⚠️  Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("⚠️  Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();

module.exports = app; // para tests
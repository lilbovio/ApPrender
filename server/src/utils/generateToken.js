/**
 * generateToken.js
 * Utilidades para generar y verificar tokens JWT.
 * Usado en: login, registro, reset de contraseña.
 */
const jwt = require("jsonwebtoken");

const SECRET      = process.env.JWT_SECRET || "mathkids_secret_dev";
const RESET_SECRET = process.env.JWT_RESET_SECRET || "mathkids_reset_dev";

// ── Auth token (sesión) ────────────────────────────────────────────────────────

/**
 * Genera el token de sesión del usuario.
 * @param {object} payload  { id, email, role }
 * @param {string} expiresIn  default "30d"
 * @returns {string} JWT
 */
function generateAuthToken(payload, expiresIn = "30d") {
  return jwt.sign(
    {
      id:    payload.id || payload._id,
      email: payload.email,
      role:  payload.role || "student",
    },
    SECRET,
    { expiresIn }
  );
}

/**
 * Verifica un token de sesión.
 * @param {string} token
 * @returns {{ id, email, role }} payload decodificado
 * @throws Error si el token es inválido o expirado
 */
function verifyAuthToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new Error("TOKEN_EXPIRED");
    throw new Error("TOKEN_INVALID");
  }
}

// ── Reset password token ──────────────────────────────────────────────────────

/**
 * Genera un token de corta duración para reset de contraseña.
 * @param {object} payload  { id, email }
 * @returns {string} JWT de 15 min
 */
function generateResetToken(payload) {
  return jwt.sign(
    { id: payload.id || payload._id, email: payload.email },
    RESET_SECRET,
    { expiresIn: "15m" }
  );
}

/**
 * Verifica el token de reset de contraseña.
 * @param {string} token
 * @returns {{ id, email }}
 */
function verifyResetToken(token) {
  try {
    return jwt.verify(token, RESET_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError") throw new Error("RESET_TOKEN_EXPIRED");
    throw new Error("RESET_TOKEN_INVALID");
  }
}

// ── Middleware de autenticación ───────────────────────────────────────────────

/**
 * Middleware Express para proteger rutas.
 * Agrega req.user con el payload del token.
 */
function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token  = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "No autenticado. Inicia sesión." });
    }

    req.user = verifyAuthToken(token);
    next();
  } catch (err) {
    const msg =
      err.message === "TOKEN_EXPIRED"
        ? "Tu sesión expiró. Inicia sesión de nuevo."
        : "Token no válido. Inicia sesión.";
    return res.status(401).json({ message: msg });
  }
}

/**
 * Middleware opcional: no bloquea si no hay token,
 * pero adjunta req.user si lo hay.
 */
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try { req.user = verifyAuthToken(token); } catch (_) {}
  }
  next();
}

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  generateResetToken,
  verifyResetToken,
  authMiddleware,
  optionalAuth,
};
/**
 * validateInput.js
 * Validadores de datos de entrada y funciones de cálculo reutilizables.
 * Usados en controladores y servicios para mantener código limpio.
 */

// ── Regex ─────────────────────────────────────────────────────────────────────
const EMAIL_REGEX    = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^.{6,}$/;          // mínimo 6 caracteres
const NAME_REGEX     = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s'-]{3,60}$/i;

// ── Validación de Auth ────────────────────────────────────────────────────────

/**
 * Valida campos de registro.
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateRegister({ name, email, password, grade }) {
  const errors = [];

  if (!name || !NAME_REGEX.test(name.trim())) {
    errors.push("El nombre debe tener entre 3 y 60 caracteres (solo letras).");
  }
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push("El correo electrónico no es válido.");
  }
  if (!password || !PASSWORD_REGEX.test(password)) {
    errors.push("La contraseña debe tener al menos 6 caracteres.");
  }
  if (!grade || grade < 1 || grade > 6 || !Number.isInteger(Number(grade))) {
    errors.push("El grado debe ser un número entre 1 y 6.");
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Valida campos de login.
 */
function validateLogin({ email, password }) {
  const errors = [];
  if (!email || !EMAIL_REGEX.test(email.trim())) errors.push("Correo no válido.");
  if (!password || !password.trim())              errors.push("La contraseña es requerida.");
  return { valid: errors.length === 0, errors };
}

/**
 * Valida cambio de contraseña.
 */
function validateChangePassword({ currentPassword, newPassword }) {
  const errors = [];
  if (!currentPassword)                          errors.push("Escribe tu contraseña actual.");
  if (!newPassword || newPassword.length < 6)   errors.push("La nueva contraseña debe tener al menos 6 caracteres.");
  if (currentPassword === newPassword)           errors.push("La nueva contraseña debe ser diferente a la actual.");
  return { valid: errors.length === 0, errors };
}

// ── Validación de Perfil ──────────────────────────────────────────────────────

/**
 * Valida actualización de perfil.
 */
function validateProfileUpdate({ username, grade } = {}) {
  const errors = [];

  if (username !== undefined) {
    if (typeof username !== "string" || username.trim().length < 2 || username.trim().length > 30) {
      errors.push("El nombre de usuario debe tener entre 2 y 30 caracteres.");
    }
    if (!/^[a-z0-9_.-]+$/i.test(username.trim())) {
      errors.push("El nombre de usuario solo puede tener letras, números, puntos y guiones bajos.");
    }
  }

  if (grade !== undefined) {
    if (grade < 1 || grade > 6 || !Number.isInteger(Number(grade))) {
      errors.push("El grado debe ser entre 1 y 6.");
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Validación de VAK ─────────────────────────────────────────────────────────

/**
 * Valida las respuestas del test VAK.
 * @param {Array<{ questionId: number, selectedIndex: number }>} answers
 */
function validateVAKAnswers(answers) {
  const errors = [];

  if (!Array.isArray(answers) || answers.length < 5) {
    errors.push("Debes responder al menos 5 preguntas del test.");
    return { valid: false, errors };
  }

  for (const ans of answers) {
    if (typeof ans.questionId !== "number" || typeof ans.selectedIndex !== "number") {
      errors.push("Formato de respuestas inválido.");
      break;
    }
    if (ans.selectedIndex < 0 || ans.selectedIndex > 2) {
      errors.push(`Índice de respuesta inválido en pregunta ${ans.questionId}.`);
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Validación de completación de lección ─────────────────────────────────────

/**
 * Valida el payload de completar una lección.
 */
function validateLessonComplete({ score, correctAnswers, totalQuestions, timeSpent }) {
  const errors = [];

  if (score === undefined || score < 0 || score > 100) {
    errors.push("El puntaje debe ser entre 0 y 100.");
  }
  if (!Number.isInteger(correctAnswers) || correctAnswers < 0) {
    errors.push("correctAnswers inválido.");
  }
  if (!Number.isInteger(totalQuestions) || totalQuestions < 1) {
    errors.push("totalQuestions inválido.");
  }
  if (correctAnswers > totalQuestions) {
    errors.push("correctAnswers no puede ser mayor que totalQuestions.");
  }
  if (typeof timeSpent !== "number" || timeSpent < 0) {
    errors.push("timeSpent inválido.");
  }

  return { valid: errors.length === 0, errors };
}

// ── Cálculo de XP ─────────────────────────────────────────────────────────────

/**
 * Calcula los XP ganados al completar una lección.
 * Fórmula:
 *  - Base: 10 XP por pregunta correcta
 *  - Bonus de puntaje perfecto: +20 XP si score === 100
 *  - Bonus de velocidad: +5 XP si timeSpent < 60 s
 *  - Penalización por lentitud: ninguna (no queremos frustrar al niño)
 *
 * @param {number} score          0-100
 * @param {number} timeSpent      segundos
 * @param {number} totalQuestions
 * @returns {number} XP entero positivo
 */
function calculateXP(score, timeSpent, totalQuestions) {
  let xp = 0;

  // Base: proporcional al puntaje
  xp += Math.round((score / 100) * totalQuestions * 10);

  // Bonus puntaje perfecto
  if (score === 100) xp += 20;

  // Bonus de velocidad
  if (timeSpent > 0 && timeSpent < 60) xp += 5;

  // Mínimo 2 XP para siempre motivar
  return Math.max(2, xp);
}

// ── Helper de respuesta de error ──────────────────────────────────────────────

/**
 * Envía una respuesta de error estándar.
 * Uso: return sendError(res, 400, "Algo salió mal");
 */
function sendError(res, statusCode, message, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined,
  });
}

/**
 * Envía una respuesta exitosa estándar.
 */
function sendSuccess(res, data = {}, statusCode = 200) {
  return res.status(statusCode).json({ success: true, ...data });
}

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateProfileUpdate,
  validateVAKAnswers,
  validateLessonComplete,
  calculateXP,
  sendError,
  sendSuccess,
  EMAIL_REGEX,
  PASSWORD_REGEX,
};
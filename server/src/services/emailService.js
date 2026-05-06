/**
 * emailService.js
 * Servicio de correo usando Nodemailer.
 * Envía: bienvenida, restablecimiento de contraseña, logros.
 */
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Plantilla base HTML ────────────────────────────────────────────────────────
function baseTemplate(title, bodyHTML) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFF;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFF;padding:32px 0;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#fff;border-radius:24px;overflow:hidden;
                    box-shadow:0 8px 32px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4D96FF,#60C5FA);
                     padding:28px 32px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:8px;">🦉</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;
                       letter-spacing:-0.5px;">${title}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 32px;color:#1e293b;font-size:15px;line-height:1.7;">
            ${bodyHTML}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F1F5F9;padding:16px 32px;text-align:center;
                     color:#94a3b8;font-size:12px;border-top:2px solid #e2e8f0;">
            © ${new Date().getFullYear()} MathEnglishKids · 
            <a href="#" style="color:#4D96FF;text-decoration:none;">Soporte</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Emails ─────────────────────────────────────────────────────────────────────

/**
 * Bienvenida al registrarse.
 * @param {string} to
 * @param {string} name
 */
async function sendWelcomeEmail(to, name) {
  const firstName = name.split(" ")[0];
  const body = `
    <p style="font-weight:700;font-size:18px;margin:0 0 12px;">
      ¡Hola, ${firstName}! 👋
    </p>
    <p>¡Bienvenido/a a <strong>MathEnglishKids</strong>! 🎉<br/>
    Tu cuenta ha sido creada con éxito. Ahora puedes empezar a aprender
    Matemáticas e Inglés de una manera divertida y personalizada.</p>

    <div style="background:#EFF6FF;border-radius:16px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0;font-weight:700;color:#1d4ed8;">¿Qué sigue?</p>
      <ul style="margin:8px 0 0;padding-left:20px;color:#334155;">
        <li>Realiza el test VAK para descubrir cómo aprendes mejor 🧠</li>
        <li>Completa lecciones diarias y gana puntos XP ⚡</li>
        <li>¡Colecciona insignias y sube de nivel! 🏆</li>
      </ul>
    </div>

    <p style="color:#64748b;font-size:13px;">
      ¡Que empiece la aventura del aprendizaje! 🚀
    </p>`;

  await transporter.sendMail({
    from: `"MathEnglishKids 🦉" <${process.env.SMTP_USER}>`,
    to,
    subject: `¡Bienvenido/a ${firstName}! 🎉`,
    html: baseTemplate("¡Bienvenido/a a MathEnglishKids!", body),
  });
}

/**
 * Correo de restablecimiento de contraseña.
 * @param {string} to
 * @param {string} name
 * @param {string} resetToken  token JWT de 15 min
 * @param {string} resetURL    URL completa del frontend
 */
async function sendPasswordResetEmail(to, name, resetToken, resetURL) {
  const firstName = name.split(" ")[0];
  const link = `${resetURL}?token=${resetToken}`;

  const body = `
    <p style="font-weight:700;font-size:17px;margin:0 0 10px;">
      Hola ${firstName}, recibimos tu solicitud 🔐
    </p>
    <p>Alguien solicitó restablecer la contraseña de tu cuenta.
    Si fuiste tú, haz clic en el botón de abajo. 
    Si no, puedes ignorar este correo.</p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${link}"
         style="background:#4D96FF;color:#fff;text-decoration:none;
                font-weight:800;font-size:16px;border-radius:16px;
                padding:14px 36px;display:inline-block;
                box-shadow:0 4px 0 #1a5bbf;">
        Restablecer contraseña 🔑
      </a>
    </div>

    <p style="color:#94a3b8;font-size:12px;text-align:center;">
      Este enlace expira en <strong>15 minutos</strong>.<br/>
      Si no funciona, copia esta URL en tu navegador:<br/>
      <span style="word-break:break-all;color:#4D96FF;">${link}</span>
    </p>`;

  await transporter.sendMail({
    from: `"MathEnglishKids 🦉" <${process.env.SMTP_USER}>`,
    to,
    subject: `Restablece tu contraseña 🔐`,
    html: baseTemplate("Restablece tu contraseña", body),
  });
}

/**
 * Notificación de nuevo logro/badge.
 * @param {string} to
 * @param {string} name
 * @param {{ emoji:string, name:string, description:string }} badge
 */
async function sendBadgeEmail(to, name, badge) {
  const firstName = name.split(" ")[0];

  const body = `
    <p style="font-weight:700;font-size:17px;margin:0 0 10px;">
      ¡${firstName}, ganaste un nuevo logro! 🎖️
    </p>

    <div style="background:linear-gradient(135deg,#FFF9E6,#FFF3CD);
                border:2px solid #FFD93D;border-radius:20px;
                padding:20px;text-align:center;margin:20px 0;">
      <div style="font-size:56px;line-height:1;margin-bottom:8px;">${badge.emoji}</div>
      <div style="font-weight:900;font-size:20px;color:#92400e;">${badge.name}</div>
      <div style="color:#b45309;font-size:14px;margin-top:4px;">${badge.description}</div>
    </div>

    <p style="color:#64748b;font-size:13px;text-align:center;">
      ¡Sigue aprendiendo para desbloquear más logros! 🚀
    </p>`;

  await transporter.sendMail({
    from: `"MathEnglishKids 🦉" <${process.env.SMTP_USER}>`,
    to,
    subject: `¡Nuevo logro desbloqueado: ${badge.name}! ${badge.emoji}`,
    html: baseTemplate(`¡Nuevo logro: ${badge.name}!`, body),
  });
}

module.exports = { sendWelcomeEmail, sendPasswordResetEmail, sendBadgeEmail };
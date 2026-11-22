// recordSafe.js - Registro del ledger que NUNCA lanza ni rechaza.
//
// Se usa desde los controladores (registro, perfil, VAK). Si el ledger falla o tarda
// demasiado, la operación del usuario debe completarse igual: por eso devuelve
// true/false y solo deja una línea de log sin datos personales.
//
// Se await-ea en el controlador (no fire-and-forget) porque en Vercel la función
// puede congelarse al enviar la respuesta y la escritura se perdería.
//
// Nunca se registra en el log: el usuario, email, hash de contraseña, huella ni
// mensajes de error (pueden contener datos).

import { recordUserEvent } from './ledgerService.js';

export async function recordUserEventSafe(
  event,
  user,
  { model, timeoutMs = 3000, log = console.error } = {}
) {
  if (process.env.LEDGER_DISABLED === 'true') return false;

  let timer;
  try {
    const timeout = new Promise((_, reject) => {
      timer = setTimeout(() => {
        const err = new Error('timeout');
        err.name = 'TimeoutError';
        reject(err);
      }, timeoutMs);
    });
    await Promise.race([recordUserEvent(event, user, model), timeout]);
    return true;
  } catch (err) {
    let userId = '?';
    try {
      userId = String(user?._id);
    } catch {
      userId = '?';
    }
    try {
      log(`ledger: no se pudo registrar ${event} (${err?.name ?? 'Error'}) userId=${userId}`);
    } catch {
      // El log nunca debe provocar un fallo.
    }
    return false;
  } finally {
    clearTimeout(timer);
  }
}

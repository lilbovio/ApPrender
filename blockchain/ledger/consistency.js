// consistency.js - Compara el ledger con el estado actual de la colección `users`.
//
// Función PURA: no toca la base de datos. Recibe los bloques (ya cargados) y la lista
// de usuarios actuales, y devuelve los desacuerdos entre ambos.
//
// Por cada userId se toma solo el ÚLTIMO bloque (mayor índice) que lo menciona.
// Los detalles nunca incluyen hashes de contraseña ni datos personales.

import { userFingerprint } from './fingerprint.js';

const DELETED = 'user_deleted';

// Tipos de incidencia que puede reportar checkConsistency.
export const ISSUE = Object.freeze({
  USER_MODIFIED: 'user_modified',
  USER_WITHOUT_BLOCK: 'user_without_block',
  BLOCK_WITHOUT_USER: 'block_without_user',
  USER_RESURRECTED: 'user_resurrected',
});

// Devuelve { userId: bloque } con el bloque de mayor índice de cada usuario.
// Los bloques sin data.userId (génesis) se ignoran.
function lastBlockByUser(chain) {
  const last = new Map();
  for (const block of chain) {
    const userId = block?.data?.userId;
    if (userId === undefined || userId === null) continue;
    const key = String(userId);
    const current = last.get(key);
    if (!current || block.index > current.index) last.set(key, block);
  }
  return last;
}

// Compara bloques y usuarios. Devuelve { ok, issues: [{ userId, type, detail }] }.
export function checkConsistency(chain, users) {
  const issues = [];
  const lastBlocks = lastBlockByUser(chain);
  const liveIds = new Set();

  for (const user of users) {
    const userId = String(user._id);
    liveIds.add(userId);
    const block = lastBlocks.get(userId);

    if (!block) {
      issues.push({
        userId,
        type: ISSUE.USER_WITHOUT_BLOCK,
        detail: 'el usuario existe pero no tiene ningún bloque en el ledger',
      });
      continue;
    }

    const event = block.data.event;
    if (event === DELETED) {
      issues.push({
        userId,
        type: ISSUE.USER_RESURRECTED,
        detail: 'el último evento es user_deleted, pero el usuario sigue existiendo',
      });
      continue;
    }

    if (userFingerprint(user) !== block.data.fingerprint) {
      issues.push({
        userId,
        type: ISSUE.USER_MODIFIED,
        detail: `los datos del usuario no coinciden con el último evento registrado (${event})`,
      });
    }
  }

  for (const [userId, block] of lastBlocks) {
    if (liveIds.has(userId)) continue;
    if (block.data.event === DELETED) continue;
    issues.push({
      userId,
      type: ISSUE.BLOCK_WITHOUT_USER,
      detail: `el último evento (${block.data.event}) no es user_deleted, pero el usuario ya no existe`,
    });
  }

  return { ok: issues.length === 0, issues };
}

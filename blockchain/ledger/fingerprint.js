// fingerprint.js - Huella SHA-256 de los campos de un usuario y construcción del
// evento que se registra en el ledger.
//
// La huella usa el hash bcrypt ya guardado (user.password), nunca la contraseña en
// claro. Cualquier cambio en name, email, avatar, vakType o password cambia la huella.

import { createHash } from 'node:crypto';
import { canonical } from '../chain.js';

export const LEDGER_EVENTS = Object.freeze([
  'user_registered',
  'profile_updated',
  'vak_set',
  'password_changed',
  'user_deleted',
]);

// SHA-256 en hexadecimal de la forma canónica de los campos del usuario.
export function userFingerprint(user) {
  const fields = {
    name: user.name,
    email: user.email,
    avatar: user.avatar ?? '',
    vakType: user.vakType ?? null,
    passwordHash: user.password,
  };
  return createHash('sha256').update(canonical(fields), 'utf8').digest('hex');
}

// Evento de usuario listo para guardarse como `data` de un bloque.
export function buildUserEvent(event, user) {
  if (!LEDGER_EVENTS.includes(event)) {
    throw new Error(`Evento de ledger no válido: ${event}`);
  }
  return {
    event,
    userId: String(user._id),
    fingerprint: userFingerprint(user),
  };
}

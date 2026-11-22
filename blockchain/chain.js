// chain.js - Núcleo de la mini-blockchain (IH063 Criptografía)
//
// Cada bloque tiene:
//   index      número de bloque (0 = génesis)
//   timestamp  fecha/hora ISO-8601 (UTC)
//   data       datos del registro (aquí: eventos de ApPrender, p. ej. lección completada)
//   prev_hash  hash del bloque anterior
//   hash       SHA-256( index | timestamp | data | prev_hash )
//
// Si se modifica cualquier campo de un bloque pasado, su hash recalculado ya no
// coincide con el guardado, y además el prev_hash del siguiente deja de coincidir.

import { createHash } from 'node:crypto';

export const GENESIS_PREV_HASH = '0'.repeat(64);

// Serializa los datos de forma determinista (claves ordenadas) para que el mismo
// contenido siempre produzca el mismo hash sin importar el orden de las claves.
export function canonical(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  const keys = Object.keys(value).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(value[k])).join(',') + '}';
}

// hash = SHA-256(index || timestamp || data || prev_hash)
// Se usa '|' como separador para evitar ambigüedades entre campos.
export function computeHash({ index, timestamp, data, prev_hash }) {
  const payload = [index, timestamp, canonical(data), prev_hash].join('|');
  return createHash('sha256').update(payload, 'utf8').digest('hex');
}

export function createBlock(index, data, prev_hash, timestamp = new Date().toISOString()) {
  const block = { index, timestamp, data, prev_hash };
  block.hash = computeHash(block);
  return block;
}

export function createGenesis() {
  return createBlock(0, { message: 'Bloque génesis de ApPrender' }, GENESIS_PREV_HASH);
}

// Agrega un bloque al final de la cadena (devuelve el bloque nuevo).
export function appendBlock(chain, data) {
  const last = chain[chain.length - 1];
  const block = createBlock(last.index + 1, data, last.hash);
  chain.push(block);
  return block;
}

// Verifica toda la cadena y reporta TODOS los problemas, no solo el primero.
// Devuelve { valid, errors: [{ index, reason }] }
export function verifyChain(chain) {
  const errors = [];
  if (!Array.isArray(chain) || chain.length === 0) {
    return { valid: false, errors: [{ index: -1, reason: 'La cadena está vacía' }] };
  }
  chain.forEach((block, i) => {
    const required = ['index', 'timestamp', 'data', 'prev_hash', 'hash'];
    const missing = required.filter((f) => !(f in block));
    if (missing.length) {
      errors.push({ index: i, reason: `Faltan campos: ${missing.join(', ')}` });
      return;
    }
    if (block.index !== i) {
      errors.push({ index: i, reason: `Índice inválido (esperado ${i}, encontrado ${block.index})` });
    }
    if (computeHash(block) !== block.hash) {
      errors.push({ index: i, reason: 'El contenido fue alterado: el hash recalculado no coincide con el almacenado' });
    }
    const expectedPrev = i === 0 ? GENESIS_PREV_HASH : chain[i - 1].hash;
    if (block.prev_hash !== expectedPrev) {
      errors.push({ index: i, reason: 'prev_hash no coincide con el hash del bloque anterior (cadena rota)' });
    }
  });
  return { valid: errors.length === 0, errors };
}

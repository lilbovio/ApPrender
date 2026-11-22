// chain.js - Núcleo de hash del ledger, copia del servidor de blockchain/chain.js.
//
// Vercel despliega solo la carpeta server/, así que el servidor no puede importar
// ../blockchain. Esta copia contiene únicamente las funciones de hash y bloque
// (sin el CLI ni el almacenamiento en archivo). Debe producir EXACTAMENTE los mismos
// hashes que blockchain/chain.js; lo verifica blockchain/ledger/parity.test.js.
//
// Cada bloque tiene:
//   index      número de bloque (0 = génesis)
//   timestamp  fecha/hora ISO-8601 (UTC)
//   data       datos del registro (eventos de usuario del ledger)
//   prev_hash  hash del bloque anterior
//   hash       SHA-256( index | timestamp | data | prev_hash )

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

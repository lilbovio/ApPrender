// ledgerService.js - Operaciones del ledger de usuarios sobre un modelo Mongoose.
//
// El modelo se recibe como parámetro (por defecto LedgerBlock) para poder probar
// todo con un modelo falso en memoria, sin tocar ninguna base de datos.

import LedgerBlock from './LedgerBlock.js';
import { createBlock, createGenesis } from '../chain.js';
import { buildUserEvent } from './fingerprint.js';

// Reintentos ante colisión de índice (otra escritura tomó el mismo número de bloque).
const MAX_RETRIES = 3;

// Devuelve solo los campos que forman parte de la cadena.
function toBlock(doc) {
  return {
    index: doc.index,
    timestamp: doc.timestamp,
    data: doc.data,
    prev_hash: doc.prev_hash,
    hash: doc.hash,
  };
}

// Error de clave duplicada (código 11000) sobre el campo `index`.
function isIndexDuplicate(err) {
  if (err?.code !== 11000) return false;
  if (err.keyPattern) return 'index' in err.keyPattern;
  return /index/.test(err.message ?? '');
}

async function findLast(model) {
  const doc = await model.findOne({}).sort({ index: -1 }).lean();
  return doc ? toBlock(doc) : null;
}

// Crea el bloque génesis si no existe. Es idempotente y devuelve el génesis.
export async function ensureGenesis(model = LedgerBlock) {
  const existing = await model.findOne({ index: 0 }).lean();
  if (existing) return toBlock(existing);

  const genesis = createGenesis();
  try {
    await model.create(genesis);
    return genesis;
  } catch (err) {
    // Otro proceso pudo crearlo entre la consulta y la escritura.
    if (!isIndexDuplicate(err)) throw err;
    return toBlock(await model.findOne({ index: 0 }).lean());
  }
}

// Registra un evento de usuario como nuevo bloque al final de la cadena.
export async function recordUserEvent(event, user, model = LedgerBlock) {
  const data = buildUserEvent(event, user);
  let attempt = 0;

  for (;;) {
    const last = (await findLast(model)) ?? (await ensureGenesis(model));
    const block = createBlock(last.index + 1, data, last.hash);
    try {
      await model.create(block);
      return block;
    } catch (err) {
      if (!isIndexDuplicate(err) || attempt >= MAX_RETRIES) throw err;
      attempt += 1;
    }
  }
}

// Devuelve todos los bloques ordenados por índice, como objetos planos.
export async function loadChain(model = LedgerBlock) {
  const docs = await model.find({}).sort({ index: 1 }).lean();
  return docs.map(toBlock);
}

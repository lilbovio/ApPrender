// Pruebas del esquema LedgerBlock sin conexión a base de datos.

import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import LedgerBlock from './LedgerBlock.js';

const H = 'a'.repeat(64);

function bloqueValido(overrides = {}) {
  return {
    index: 1,
    timestamp: '2026-01-01T00:00:00.000Z',
    data: { event: 'user_registered', userId: 'u1', fingerprint: H },
    prev_hash: H,
    hash: 'b'.repeat(64),
    ...overrides,
  };
}

test('importar el modelo no abre ninguna conexión', () => {
  assert.equal(mongoose.connection.readyState, 0);
});

test('el modelo usa la colección ledgerblocks y no agrega timestamps', () => {
  assert.equal(LedgerBlock.collection.collectionName, 'ledgerblocks');
  assert.equal(LedgerBlock.schema.options.timestamps, false);
});

// Devuelve los errores de validación del documento, o null si es válido.
async function validar(doc) {
  try {
    await doc.validate();
    return null;
  } catch (err) {
    return err.errors;
  }
}

test('un bloque válido pasa la validación del esquema', async () => {
  assert.equal(await validar(new LedgerBlock(bloqueValido())), null);
});

test('faltan campos obligatorios: la validación falla', async () => {
  for (const campo of ['index', 'timestamp', 'data', 'prev_hash', 'hash']) {
    const doc = bloqueValido();
    delete doc[campo];
    const errores = await validar(new LedgerBlock(doc));
    assert.ok(errores?.[campo], `campo ${campo}`);
  }
});

test('prev_hash y hash deben tener exactamente 64 caracteres', async () => {
  assert.ok((await validar(new LedgerBlock(bloqueValido({ prev_hash: 'a'.repeat(63) }))))?.prev_hash);
  assert.ok((await validar(new LedgerBlock(bloqueValido({ hash: 'a'.repeat(65) }))))?.hash);
});

test('index y hash tienen índice único', () => {
  const indices = LedgerBlock.schema.indexes();
  const unicos = indices.filter(([, opts]) => opts?.unique).map(([campos]) => Object.keys(campos)[0]);
  assert.ok(unicos.includes('index'));
  assert.ok(unicos.includes('hash'));
});

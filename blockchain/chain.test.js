import test from 'node:test';
import assert from 'node:assert/strict';
import { createGenesis, appendBlock, verifyChain, computeHash } from './chain.js';

function sample() {
  const c = [createGenesis()];
  appendBlock(c, { user: 'ana', xp: 50 });
  appendBlock(c, { user: 'luis', xp: 30 });
  appendBlock(c, { user: 'ana', xp: 20 });
  return c;
}

test('una cadena intacta es válida', () => {
  assert.equal(verifyChain(sample()).valid, true);
});

test('el hash es SHA-256 en hexadecimal (64 caracteres) y determinista', () => {
  const b = sample()[1];
  assert.match(b.hash, /^[0-9a-f]{64}$/);
  assert.equal(computeHash(b), b.hash);
});

test('alterar los datos de un bloque se detecta', () => {
  const c = sample();
  c[1].data.xp = 9999;
  const r = verifyChain(c);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.index === 1));
});

test('alterar y recalcular el hash rompe el enlace con el siguiente bloque', () => {
  const c = sample();
  c[1].data.xp = 9999;
  c[1].hash = computeHash(c[1]);
  const r = verifyChain(c);
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.index === 2 && /prev_hash/.test(e.reason)));
});

test('eliminar un bloque intermedio se detecta', () => {
  const c = sample();
  c.splice(1, 1);
  assert.equal(verifyChain(c).valid, false);
});

test('el orden de las claves en data no cambia el hash', () => {
  const a = computeHash({ index: 1, timestamp: 't', data: { a: 1, b: 2 }, prev_hash: 'x' });
  const b = computeHash({ index: 1, timestamp: 't', data: { b: 2, a: 1 }, prev_hash: 'x' });
  assert.equal(a, b);
});

test('se reportan todos los bloques corruptos, no solo el primero', () => {
  const c = sample();
  c[1].data.xp = 1;
  c[3].data.xp = 2;
  const idx = verifyChain(c).errors.map((e) => e.index);
  assert.ok(idx.includes(1) && idx.includes(3));
});

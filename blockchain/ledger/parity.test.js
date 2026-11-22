// Paridad entre las copias del ledger y las originales.
//
// El servidor (Vercel, root server/) tiene su propia copia de chain.js y fingerprint.js
// en server/src/ledger/. Esta prueba asegura que ambas versiones producen exactamente
// las mismas salidas, para que los hashes del servidor sean verificables desde blockchain/.
// Solo importa módulos sin mongoose: no abre conexiones.

import test from 'node:test';
import assert from 'node:assert/strict';
import * as srvChain from '../../server/src/ledger/chain.js';
import * as srvFingerprint from '../../server/src/ledger/fingerprint.js';
import * as chain from '../chain.js';
import * as fingerprint from './fingerprint.js';

const CANONICAL_VECTORS = [
  null,
  true,
  0,
  -1.5,
  'texto con ñ y "comillas"',
  [],
  [1, 'dos', null, [3]],
  {},
  { b: 1, a: 2 },
  { z: { y: [1, { x: 'w', v: null }] }, a: 'b', m: [false, { k: 0 }] },
  { 'clave con espacio': 1, '': 2, 'ñ': 3 },
];

test('canonical produce la misma cadena en ambas copias', () => {
  for (const v of CANONICAL_VECTORS) {
    assert.equal(srvChain.canonical(v), chain.canonical(v), JSON.stringify(v));
  }
});

test('canonical ignora el orden de las claves', () => {
  assert.equal(chain.canonical({ a: 1, b: 2 }), chain.canonical({ b: 2, a: 1 }));
  assert.equal(srvChain.canonical({ a: 1, b: 2 }), srvChain.canonical({ b: 2, a: 1 }));
});

const HASH_VECTORS = [
  { index: 0, timestamp: '2026-01-01T00:00:00.000Z', data: { message: 'g' }, prev_hash: '0'.repeat(64) },
  { index: 1, timestamp: '2026-03-10T12:34:56.789Z', data: { event: 'vak_set', userId: 'u1', fingerprint: 'f'.repeat(64) }, prev_hash: 'a'.repeat(64) },
  { index: 7, timestamp: '2026-11-21T08:00:00.000Z', data: { nested: { z: [1, { b: 2, a: 1 }], a: null } }, prev_hash: 'b'.repeat(64) },
  { index: 2, timestamp: '2026-02-02T02:02:02.000Z', data: { ñ: 'á', list: [] }, prev_hash: 'c'.repeat(64) },
];

test('computeHash produce el mismo hash en ambas copias', () => {
  for (const block of HASH_VECTORS) {
    assert.equal(srvChain.computeHash(block), chain.computeHash(block));
  }
});

test('createBlock con timestamp fijo es idéntico en ambas copias', () => {
  for (const v of HASH_VECTORS) {
    const a = srvChain.createBlock(v.index, v.data, v.prev_hash, v.timestamp);
    const b = chain.createBlock(v.index, v.data, v.prev_hash, v.timestamp);
    assert.deepEqual(a, b);
    assert.match(a.hash, /^[0-9a-f]{64}$/);
  }
});

test('el génesis tiene el mismo prev_hash, índice y datos en ambas copias', () => {
  assert.equal(srvChain.GENESIS_PREV_HASH, chain.GENESIS_PREV_HASH);
  const a = srvChain.createGenesis();
  const b = chain.createGenesis();
  assert.equal(a.index, b.index);
  assert.deepEqual(a.data, b.data);
  assert.equal(a.prev_hash, b.prev_hash);
});

const USER_VECTORS = [
  { _id: 'u1', name: 'Ana', email: 'ana@example.com', password: '$2b$10$abc', avatar: 'a.png', vakType: 'visual' },
  { _id: 'u2', name: 'Luis', email: 'luis@example.com', password: '$2b$10$def', avatar: '', vakType: null },
  { _id: 'u3', name: 'Sin campos', email: 'x@example.com', password: '$2b$10$ghi' },
  { _id: 'u4', name: 'Ñandú', email: 'ñ@example.com', password: '$2b$10$jkl', avatar: undefined, vakType: 'kinestesico' },
];

test('userFingerprint produce la misma huella en ambas copias', () => {
  for (const u of USER_VECTORS) {
    assert.equal(srvFingerprint.userFingerprint(u), fingerprint.userFingerprint(u), u.name);
    assert.match(fingerprint.userFingerprint(u), /^[0-9a-f]{64}$/);
  }
});

test('buildUserEvent produce el mismo evento en ambas copias', () => {
  for (const u of USER_VECTORS) {
    assert.deepEqual(
      srvFingerprint.buildUserEvent('profile_updated', u),
      fingerprint.buildUserEvent('profile_updated', u)
    );
  }
});

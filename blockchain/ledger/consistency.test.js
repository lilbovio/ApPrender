// Pruebas de consistency.js. Función pura: no hay base de datos ni red.

import test from 'node:test';
import assert from 'node:assert/strict';
import { checkConsistency, ISSUE } from './consistency.js';
import { buildUserEvent } from './fingerprint.js';
import { createGenesis, createBlock } from '../chain.js';

const SECRET_HASH = '$2b$10$SECRETOQUENODEBESALIR';

function user(id, overrides = {}) {
  return {
    _id: id,
    name: `Usuario ${id}`,
    email: `${id}@example.com`,
    avatar: '',
    vakType: 'auditivo',
    password: SECRET_HASH,
    ...overrides,
  };
}

// Construye la cadena: génesis + un bloque por cada [evento, usuario] en el orden dado.
function chainOf(entries) {
  const chain = [createGenesis()];
  for (const [event, u] of entries) {
    const last = chain[chain.length - 1];
    chain.push(createBlock(last.index + 1, buildUserEvent(event, u), last.hash));
  }
  return chain;
}

function typesOf(result) {
  return result.issues.map((i) => `${i.userId}:${i.type}`);
}

test('caso limpio: todos los usuarios coinciden con su último bloque', () => {
  const ana = user('u1');
  const luis = user('u2');
  const chain = chainOf([['user_registered', ana], ['user_registered', luis]]);
  const result = checkConsistency(chain, [ana, luis]);

  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test('user_modified: el usuario cambió fuera de la app', () => {
  const ana = user('u1');
  const chain = chainOf([['user_registered', ana]]);
  const result = checkConsistency(chain, [user('u1', { name: 'Otro nombre' })]);

  assert.equal(result.ok, false);
  assert.deepEqual(typesOf(result), ['u1:user_modified']);
});

test('user_without_block: usuario existente sin ningún bloque', () => {
  const chain = chainOf([['user_registered', user('u1')]]);
  const result = checkConsistency(chain, [user('u1'), user('u2')]);

  assert.equal(result.ok, false);
  assert.deepEqual(typesOf(result), ['u2:user_without_block']);
});

test('block_without_user: último bloque distinto de user_deleted y usuario inexistente', () => {
  const chain = chainOf([['user_registered', user('u3')]]);
  const result = checkConsistency(chain, []);

  assert.equal(result.ok, false);
  assert.deepEqual(typesOf(result), ['u3:block_without_user']);
});

test('usuario borrado correctamente (último bloque user_deleted y sin usuario): no es incidencia', () => {
  const chain = chainOf([['user_registered', user('u4')], ['user_deleted', user('u4')]]);
  const result = checkConsistency(chain, []);

  assert.equal(result.ok, true);
});

test('user_resurrected: último bloque user_deleted pero el usuario sigue existiendo', () => {
  const chain = chainOf([['user_registered', user('u5')], ['user_deleted', user('u5')]]);
  const result = checkConsistency(chain, [user('u5')]);

  assert.equal(result.ok, false);
  assert.deepEqual(typesOf(result), ['u5:user_resurrected']);
});

test('varios eventos por usuario: solo cuenta el último', () => {
  const antes = user('u6');
  const despues = user('u6', { name: 'Nombre nuevo', vakType: 'kinestesico' });
  const chain = chainOf([
    ['user_registered', antes],
    ['profile_updated', despues],
  ]);

  // El estado actual coincide con el último evento: no hay incidencia aunque el primero difiera.
  assert.equal(checkConsistency(chain, [despues]).ok, true);
  // Si el usuario vuelve al estado anterior al último evento, sí se detecta.
  const result = checkConsistency(chain, [antes]);
  assert.deepEqual(typesOf(result), ['u6:user_modified']);
});

test('varios eventos: un bloque anterior con estado original no genera incidencia', () => {
  const v1 = user('u7');
  const v2 = user('u7', { email: 'nuevo@example.com' });
  const chain = chainOf([
    ['user_registered', v1],
    ['password_changed', v2],
    ['vak_set', v2],
  ]);

  assert.equal(checkConsistency(chain, [v2]).ok, true);
});

test('el último bloque se elige por índice aunque la cadena llegue desordenada', () => {
  const v1 = user('u8');
  const v2 = user('u8', { name: 'Cambiado' });
  const chain = chainOf([
    ['user_registered', v1],
    ['profile_updated', v2],
  ]).reverse();

  assert.equal(checkConsistency(chain, [v2]).ok, true);
});

test('independencia del orden de claves: la misma huella con claves en otro orden', () => {
  const ana = user('u9');
  const reordenado = {
    password: ana.password,
    vakType: ana.vakType,
    avatar: ana.avatar,
    email: ana.email,
    name: ana.name,
    _id: ana._id,
  };
  const chain = chainOf([['user_registered', ana]]);

  assert.equal(checkConsistency(chain, [reordenado]).ok, true);
});

test('el génesis (sin userId) se ignora', () => {
  const result = checkConsistency([createGenesis()], []);

  assert.equal(result.ok, true);
  assert.deepEqual(result.issues, []);
});

test('los detalles de las incidencias no contienen el hash de la contraseña', () => {
  const chain = chainOf([
    ['user_registered', user('u10')],
    ['user_registered', user('u11')],
    ['user_deleted', user('u12')],
  ]);
  const result = checkConsistency(chain, [
    user('u10', { name: 'Cambiado' }),
    user('u12'),
    user('u13'),
  ]);

  assert.equal(result.issues.length, 4);
  assert.equal(JSON.stringify(result).includes(SECRET_HASH), false);
  const types = result.issues.map((i) => i.type).sort();
  assert.deepEqual(types, [
    ISSUE.BLOCK_WITHOUT_USER,
    ISSUE.USER_MODIFIED,
    ISSUE.USER_RESURRECTED,
    ISSUE.USER_WITHOUT_BLOCK,
  ].sort());
});

test('cada incidencia tiene userId, type y detail en texto', () => {
  const result = checkConsistency(chainOf([]), [user('u14')]);
  const [issue] = result.issues;

  assert.equal(issue.userId, 'u14');
  assert.equal(issue.type, ISSUE.USER_WITHOUT_BLOCK);
  assert.equal(typeof issue.detail, 'string');
  assert.ok(issue.detail.length > 0);
});

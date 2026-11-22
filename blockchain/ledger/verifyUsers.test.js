// Pruebas de verifyUsers.js con driver, modelo y origen de usuarios falsos.
// No se conecta a MongoDB ni a Atlas. El modelo falso registra cualquier escritura.

import test from 'node:test';
import assert from 'node:assert/strict';
import { run, EXIT_VALID, EXIT_CORRUPT, EXIT_ERROR } from './verifyUsers.js';
import { buildUserEvent } from './fingerprint.js';
import { createGenesis, createBlock } from '../chain.js';

const FAKE_URI = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/apprender';
const SECRET_HASH = '$2b$10$HASHSECRETOFALSO';

function fakeDriver({ failWith = null } = {}) {
  return {
    connectCalls: 0,
    disconnectCalls: 0,
    async connect() {
      this.connectCalls += 1;
      if (failWith) throw failWith;
      return this;
    },
    async disconnect() {
      this.disconnectCalls += 1;
    },
  };
}

// Modelo falso de solo lectura: find().sort().lean(). Cualquier escritura queda registrada.
const WRITE_METHODS = ['create', 'insertMany', 'updateOne', 'updateMany', 'findOneAndUpdate',
  'deleteOne', 'deleteMany', 'findOneAndDelete', 'replaceOne', 'bulkWrite', 'syncIndexes',
  'createIndexes', 'ensureIndexes', 'save', 'remove'];

function fakeModel(blocks) {
  const writes = [];
  const model = {
    writes,
    find() {
      return {
        sort(spec) {
          const [[key, dir]] = Object.entries(spec);
          const sorted = [...blocks].sort((a, b) => (a[key] - b[key]) * dir);
          return { lean: async () => sorted.map((b) => ({ ...b })) };
        },
      };
    },
  };
  for (const name of WRITE_METHODS) {
    model[name] = async () => {
      writes.push(name);
      throw new Error(`escritura no permitida en verifyUsers: ${name}`);
    };
  }
  return model;
}

// Origen de usuarios falso. Cuenta las lecturas y puede fallar.
function fakeUsersSource(users, { failWith = null } = {}) {
  const source = {
    reads: 0,
    async listUsers() {
      source.reads += 1;
      if (failWith) throw failWith;
      return users.map((u) => ({ ...u }));
    },
  };
  return source;
}

function user(id, overrides = {}) {
  return {
    _id: id,
    name: `Usuario ${id}`,
    email: `${id}@example.com`,
    avatar: '',
    vakType: 'visual',
    password: SECRET_HASH,
    ...overrides,
  };
}

// Cadena válida con un bloque user_registered por usuario, en el orden dado.
function chainFor(users) {
  const chain = [createGenesis()];
  for (const u of users) {
    const last = chain[chain.length - 1];
    chain.push(createBlock(last.index + 1, buildUserEvent('user_registered', u), last.hash));
  }
  return chain;
}

// Ejecuta run() con MONGO_URI fijada y restaura el entorno después.
async function runWithUri(options) {
  const previous = process.env.MONGO_URI;
  process.env.MONGO_URI = FAKE_URI;
  const lines = [];
  try {
    const code = await run({ ...options, log: (line) => lines.push(String(line)) });
    return { code, output: lines.join('\n') };
  } finally {
    if (previous === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = previous;
  }
}

const USERS = [user('u1'), user('u2')];

test('cadena y usuarios válidos: devuelve 0', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainFor(USERS));
  const usersSource = fakeUsersSource(USERS);
  const { code, output } = await runWithUri({ driver, model, usersSource });

  assert.equal(code, EXIT_VALID);
  assert.match(output, /CADENA VÁLIDA \(3 bloques\)/);
  assert.match(output, /USUARIOS CONSISTENTES \(2 usuarios\)/);
  assert.equal(driver.connectCalls, 1);
  assert.equal(driver.disconnectCalls, 1);
  assert.deepEqual(model.writes, []);
});

test('bloque alterado en la cadena: devuelve 2', async () => {
  const chain = chainFor(USERS);
  chain[1] = { ...chain[1], data: { event: 'user_deleted', userId: 'u1', fingerprint: 'alterado' } };
  const driver = fakeDriver();
  const model = fakeModel(chain);
  const { code, output } = await runWithUri({ driver, model, usersSource: fakeUsersSource(USERS) });

  assert.equal(code, EXIT_CORRUPT);
  assert.match(output, /CADENA NO VÁLIDA/);
  assert.match(output, /bloque 1: /);
  assert.equal(driver.disconnectCalls, 1);
  assert.deepEqual(model.writes, []);
});

test('usuario modificado fuera de la app: devuelve 2 y nombra al usuario', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainFor(USERS));
  const usersSource = fakeUsersSource([user('u1', { name: 'Cambiado' }), user('u2')]);
  const { code, output } = await runWithUri({ driver, model, usersSource });

  assert.equal(code, EXIT_CORRUPT);
  assert.match(output, /INCONSISTENCIAS CON USERS: 1/);
  assert.match(output, /^ {2}- usuario u1: user_modified - .+$/m);
  assert.deepEqual(model.writes, []);
});

test('no imprime el hash de la contraseña', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainFor(USERS));
  const usersSource = fakeUsersSource([user('u1', { name: 'Cambiado' }), user('u2')]);
  const { output } = await runWithUri({ driver, model, usersSource });

  assert.equal(output.includes(SECRET_HASH), false);
});

test('error de conexión: devuelve 1, no lee usuarios ni desconecta', async () => {
  const driver = fakeDriver({
    failWith: Object.assign(new Error(`fallo con ${FAKE_URI}`), { name: 'MongooseServerSelectionError' }),
  });
  const model = fakeModel(chainFor(USERS));
  const usersSource = fakeUsersSource(USERS);
  const { code, output } = await runWithUri({ driver, model, usersSource });

  assert.equal(code, EXIT_ERROR);
  assert.match(output, /No se pudo conectar a MongoDB/);
  assert.equal(output.includes('usuarioFalso'), false);
  assert.equal(usersSource.reads, 0);
  assert.equal(driver.disconnectCalls, 0);
  assert.deepEqual(model.writes, []);
});

test('error al leer users: devuelve 1 y desconecta igualmente', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainFor(USERS));
  const usersSource = fakeUsersSource([], { failWith: new Error('timeout leyendo users') });
  const { code, output } = await runWithUri({ driver, model, usersSource });

  assert.equal(code, EXIT_ERROR);
  assert.match(output, /timeout leyendo users/);
  assert.equal(driver.disconnectCalls, 1);
  assert.deepEqual(model.writes, []);
});

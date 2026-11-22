// Pruebas de backfill.js con driver, modelo y origen de usuarios falsos.
// No se conecta a MongoDB ni a Atlas. El modelo falso solo implementa lo que usa el script
// (findOne, find, create); cualquier otro método (p. ej. syncIndexes) falla la prueba.

import test from 'node:test';
import assert from 'node:assert/strict';
import { run } from './backfill.js';
import { buildUserEvent } from './fingerprint.js';
import { createGenesis, createBlock, verifyChain } from '../chain.js';

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

// Modelo falso en memoria. `creates` guarda los documentos escritos con create.
function fakeModel(initial = []) {
  const docs = initial.map((d) => ({ ...d }));
  const creates = [];

  function sorted(spec) {
    const [[key, dir]] = Object.entries(spec);
    return [...docs].sort((a, b) => (a[key] - b[key]) * dir);
  }

  return {
    docs,
    creates,
    findOne(filter) {
      const match = docs.find((d) => Object.entries(filter).every(([k, v]) => d[k] === v));
      return {
        sort: (spec) => {
          const [first] = sorted(spec);
          return { lean: async () => (first ? { ...first } : null) };
        },
        lean: async () => (match ? { ...match } : null),
      };
    },
    find() {
      return {
        sort: (spec) => ({ lean: async () => sorted(spec).map((d) => ({ ...d })) }),
      };
    },
    async create(doc) {
      creates.push(doc);
      docs.push({ ...doc });
      return doc;
    },
  };
}

function fakeUsersSource(users) {
  const source = {
    reads: 0,
    async listUsers() {
      source.reads += 1;
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

// Cadena inicial: génesis + un user_registered para cada id dado.
function chainWithBlocksFor(ids) {
  const chain = [createGenesis()];
  for (const id of ids) {
    const last = chain[chain.length - 1];
    chain.push(createBlock(last.index + 1, buildUserEvent('user_registered', user(id)), last.hash));
  }
  return chain;
}

const CONFIRM = ['--confirm'];

test('sin --confirm no conecta, no lee usuarios, no escribe y sale con 0', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainWithBlocksFor(['u1']));
  const usersSource = fakeUsersSource([user('u1'), user('u2')]);
  const { code, output } = await runWithUri({ argv: [], driver, model, usersSource });

  assert.equal(code, 0);
  assert.equal(driver.connectCalls, 0);
  assert.equal(usersSource.reads, 0);
  assert.deepEqual(model.creates, []);
  assert.match(output, /Modo simulación/);
  assert.match(output, /Destino: base de datos: apprender/);
});

test('con --confirm agrega bloques solo a usuarios sin bloque', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainWithBlocksFor(['u1']));
  const usersSource = fakeUsersSource([user('u1'), user('u2'), user('u3')]);
  const { code, output } = await runWithUri({ argv: CONFIRM, driver, model, usersSource });

  assert.equal(code, 0);
  assert.equal(driver.connectCalls, 1);
  assert.equal(driver.disconnectCalls, 1);
  assert.equal(model.creates.length, 2);
  assert.deepEqual(
    model.creates.map((b) => b.data.userId),
    ['u2', 'u3'],
  );
  assert.ok(model.creates.every((b) => b.data.event === 'user_registered'));
  assert.match(output, /Usuarios encontrados: 3/);
  assert.match(output, /Bloques agregados: 2/);
  assert.match(output, /Omitidos \(ya tenían bloque\): 1/);
  assert.equal(verifyChain([...model.docs].sort((a, b) => a.index - b.index)).valid, true);
});

test('segunda ejecución: no agrega nada (idempotente)', async () => {
  const model = fakeModel(chainWithBlocksFor([]));
  const usersSource = fakeUsersSource([user('u1'), user('u2')]);

  const first = await runWithUri({ argv: CONFIRM, driver: fakeDriver(), model, usersSource });
  const createdAfterFirst = model.creates.length;
  const second = await runWithUri({ argv: CONFIRM, driver: fakeDriver(), model, usersSource });

  assert.equal(first.code, 0);
  assert.equal(second.code, 0);
  assert.equal(createdAfterFirst, 2);
  assert.equal(model.creates.length, createdAfterFirst);
  assert.match(second.output, /Bloques agregados: 0/);
  assert.match(second.output, /Omitidos \(ya tenían bloque\): 2/);
});

test('sin génesis previo: lo crea y luego registra a los usuarios', async () => {
  const model = fakeModel([]);
  const usersSource = fakeUsersSource([user('u1')]);
  const { code } = await runWithUri({ argv: CONFIRM, driver: fakeDriver(), model, usersSource });

  assert.equal(code, 0);
  assert.equal(model.creates[0].index, 0);
  assert.equal(model.creates[1].data.userId, 'u1');
  assert.equal(verifyChain([...model.docs].sort((a, b) => a.index - b.index)).valid, true);
});

test('la salida no contiene el hash de la contraseña', async () => {
  const model = fakeModel(chainWithBlocksFor([]));
  const usersSource = fakeUsersSource([user('u1'), user('u2')]);
  const { output } = await runWithUri({ argv: CONFIRM, driver: fakeDriver(), model, usersSource });

  assert.equal(output.includes(SECRET_HASH), false);
});

test('error de conexión con --confirm: devuelve 1 y no escribe', async () => {
  const driver = fakeDriver({
    failWith: Object.assign(new Error(`fallo con ${FAKE_URI}`), { name: 'MongooseServerSelectionError' }),
  });
  const model = fakeModel([]);
  const usersSource = fakeUsersSource([user('u1')]);
  const { code, output } = await runWithUri({ argv: CONFIRM, driver, model, usersSource });

  assert.equal(code, 1);
  assert.match(output, /No se pudo conectar a MongoDB/);
  assert.equal(output.includes('usuarioFalso'), false);
  assert.equal(usersSource.reads, 0);
  assert.deepEqual(model.creates, []);
  assert.equal(driver.disconnectCalls, 0);
});

test('error al escribir un bloque: devuelve 1 y desconecta igualmente', async () => {
  const driver = fakeDriver();
  const model = fakeModel(chainWithBlocksFor([]));
  model.create = async () => {
    throw new Error('escritura rechazada');
  };
  const usersSource = fakeUsersSource([user('u1')]);
  const { code, output } = await runWithUri({ argv: CONFIRM, driver, model, usersSource });

  assert.equal(code, 1);
  assert.match(output, /escritura rechazada/);
  assert.equal(driver.disconnectCalls, 1);
});

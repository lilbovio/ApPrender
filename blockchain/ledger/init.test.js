// Pruebas de init.js con driver y modelo falsos. No se conecta a MongoDB ni a Atlas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { run } from './init.js';

const FAKE_URI = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/apprender';

// Driver falso que cuenta conexiones y desconexiones.
function fakeDriver() {
  return {
    connectCalls: 0,
    disconnectCalls: 0,
    async connect() {
      this.connectCalls += 1;
      return this;
    },
    async disconnect() {
      this.disconnectCalls += 1;
    },
  };
}

// Modelo falso con el mínimo que usa ensureGenesis + syncIndexes.
function fakeModel({ genesis = null } = {}) {
  const docs = genesis ? [{ ...genesis }] : [];
  const calls = { syncIndexes: 0, create: 0 };
  return {
    calls,
    docs,
    async syncIndexes() {
      calls.syncIndexes += 1;
      return [];
    },
    findOne(filter) {
      return {
        lean: async () => docs.find((d) => d.index === filter.index) ?? null,
      };
    },
    async create(doc) {
      calls.create += 1;
      docs.push({ ...doc });
      return doc;
    },
  };
}

const GENESIS = {
  index: 0,
  timestamp: '2026-01-01T00:00:00.000Z',
  data: { message: 'Bloque génesis de ApPrender' },
  prev_hash: '0'.repeat(64),
  hash: 'a'.repeat(64),
};

// Ejecuta run() con MONGO_URI fijada y restaura el entorno después.
async function runWithUri(options) {
  const previous = process.env.MONGO_URI;
  process.env.MONGO_URI = FAKE_URI;
  const lines = [];
  try {
    const code = await run({ ...options, log: (line) => lines.push(String(line)) });
    return { code, lines, output: lines.join('\n') };
  } finally {
    if (previous === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = previous;
  }
}

test('sin --confirm no conecta, no escribe y sale con código 0', async () => {
  const driver = fakeDriver();
  const model = fakeModel();
  const { code, output } = await runWithUri({ argv: [], driver, model });

  assert.equal(code, 0);
  assert.equal(driver.connectCalls, 0);
  assert.equal(driver.disconnectCalls, 0);
  assert.equal(model.calls.syncIndexes, 0);
  assert.equal(model.calls.create, 0);
  assert.match(output, /no se conecta/);
});

test('con --confirm conecta, crea índices y el génesis, y desconecta', async () => {
  const driver = fakeDriver();
  const model = fakeModel();
  const { code, output } = await runWithUri({ argv: ['--confirm'], driver, model });

  assert.equal(code, 0);
  assert.equal(driver.connectCalls, 1);
  assert.equal(model.calls.syncIndexes, 1);
  assert.equal(model.calls.create, 1);
  assert.equal(driver.disconnectCalls, 1);
  assert.match(output, /base de datos: apprender/);
  assert.match(output, /índice 0, hash [0-9a-f]{64}/);
  assert.equal(output.includes('usuarioFalso'), false);
  assert.equal(output.includes('claveFalsa'), false);
  assert.equal(output.includes('hostFalso'), false);
});

test('con --confirm no duplica el génesis si ya existe', async () => {
  const driver = fakeDriver();
  const model = fakeModel({ genesis: GENESIS });
  const { code, output } = await runWithUri({ argv: ['--confirm'], driver, model });

  assert.equal(code, 0);
  assert.equal(model.calls.create, 0);
  assert.equal(model.docs.length, 1);
  assert.match(output, /índice 0, hash a{64}/);
});

test('si la conexión falla devuelve código 1, no escribe y no desconecta', async () => {
  const driver = fakeDriver();
  driver.connect = async () => {
    throw Object.assign(new Error(`fallo con ${FAKE_URI}`), { name: 'MongooseServerSelectionError' });
  };
  const model = fakeModel();
  const { code, output } = await runWithUri({ argv: ['--confirm'], driver, model });

  assert.equal(code, 1);
  assert.equal(model.calls.syncIndexes, 0);
  assert.equal(model.calls.create, 0);
  assert.match(output, /No se pudo conectar a MongoDB/);
  assert.equal(output.includes('usuarioFalso'), false);
});

// Pruebas de verifyLedger.js con driver y modelo falsos. No se conecta a MongoDB ni a Atlas.
// Comprueba además que el script solo lee: cualquier método de escritura del modelo falso
// queda registrado y la prueba falla.

import test from 'node:test';
import assert from 'node:assert/strict';
import { run, EXIT_VALID, EXIT_CORRUPT, EXIT_ERROR } from './verifyLedger.js';
import { createGenesis, createBlock } from '../chain.js';

const FAKE_URI = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/apprender';

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
          return {
            lean: async () => sorted.map((b) => ({ ...b })),
          };
        },
      };
    },
  };
  for (const name of WRITE_METHODS) {
    model[name] = async () => {
      writes.push(name);
      throw new Error(`escritura no permitida en verifyLedger: ${name}`);
    };
  }
  return model;
}

// Construye una cadena válida de n bloques (génesis + n-1).
function validChain(n) {
  const chain = [createGenesis()];
  for (let i = 1; i < n; i += 1) {
    const last = chain[chain.length - 1];
    chain.push(createBlock(last.index + 1, { event: 'user_registered', userId: `u${i}`, fingerprint: 'f' }, last.hash));
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

test('cadena válida: imprime el número de bloques y devuelve 0', async () => {
  const driver = fakeDriver();
  const model = fakeModel(validChain(3));
  const { code, output } = await runWithUri({ driver, model });

  assert.equal(code, EXIT_VALID);
  assert.match(output, /CADENA VÁLIDA \(3 bloques\)/);
  assert.equal(driver.connectCalls, 1);
  assert.equal(driver.disconnectCalls, 1);
  assert.deepEqual(model.writes, []);
});

test('cadena alterada: lista los errores y devuelve 2', async () => {
  const chain = validChain(3);
  chain[1] = { ...chain[1], data: { event: 'user_deleted', userId: 'u1', fingerprint: 'alterado' } };
  const driver = fakeDriver();
  const model = fakeModel(chain);
  const { code, output } = await runWithUri({ driver, model });

  assert.equal(code, EXIT_CORRUPT);
  assert.match(output, /CADENA NO VÁLIDA/);
  assert.match(output, /bloque 1: .*alterado/);
  assert.equal(driver.disconnectCalls, 1);
  assert.deepEqual(model.writes, []);
});

test('error de conexión: devuelve 1, no lee ni desconecta', async () => {
  const driver = fakeDriver({
    failWith: Object.assign(new Error(`fallo con ${FAKE_URI}`), { name: 'MongooseServerSelectionError' }),
  });
  const model = fakeModel(validChain(2));
  const { code, output } = await runWithUri({ driver, model });

  assert.equal(code, EXIT_ERROR);
  assert.match(output, /No se pudo conectar a MongoDB/);
  assert.equal(output.includes('usuarioFalso'), false);
  assert.equal(driver.disconnectCalls, 0);
  assert.deepEqual(model.writes, []);
});

test('error al leer bloques: devuelve 1 y desconecta igualmente', async () => {
  const driver = fakeDriver();
  const model = fakeModel([]);
  model.find = () => ({
    sort: () => ({ lean: async () => { throw new Error('timeout de lectura'); } }),
  });
  const { code, output } = await runWithUri({ driver, model });

  assert.equal(code, EXIT_ERROR);
  assert.match(output, /timeout de lectura/);
  assert.equal(driver.disconnectCalls, 1);
  assert.deepEqual(model.writes, []);
});

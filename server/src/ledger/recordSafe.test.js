// Pruebas de recordUserEventSafe con modelos falsos. No se conecta a MongoDB.

import test from 'node:test';
import assert from 'node:assert/strict';
import { recordUserEventSafe } from './recordSafe.js';
import { userFingerprint } from './fingerprint.js';

const USER = {
  _id: '65a000000000000000000001',
  name: 'Ana Prueba',
  email: 'ana.privada@example.com',
  password: '$2b$10$HashSecretoDePruebaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  avatar: '',
  vakType: null,
};

// Modelo en memoria con la forma mínima que usa ledgerService:
// findOne(filter).sort(spec).lean(), findOne(filter).lean() y create(doc).
function fakeModel() {
  const docs = [];
  const model = {
    calls: 0,
    docs,
    findOne(filter = {}) {
      const match = (d) => Object.entries(filter).every(([k, v]) => d[k] === v);
      const query = {
        sort() {
          return query;
        },
        lean() {
          const list = docs.filter(match).sort((a, b) => b.index - a.index);
          return Promise.resolve(list[0] ? { ...list[0] } : null);
        },
      };
      return query;
    },
    async create(doc) {
      model.calls += 1;
      docs.push({ ...doc });
      return doc;
    },
  };
  return model;
}

function throwingModel(err) {
  return {
    findOne() {
      throw err;
    },
    async create() {
      throw err;
    },
  };
}

function hangingModel() {
  const never = new Promise(() => {});
  return {
    findOne() {
      return { sort: () => ({ lean: () => never }), lean: () => never };
    },
    create: () => never,
  };
}

function collectLog() {
  const lines = [];
  return { lines, log: (line) => lines.push(String(line)) };
}

test('devuelve true y registra el evento con un modelo falso', async () => {
  const model = fakeModel();
  const { lines, log } = collectLog();
  const ok = await recordUserEventSafe('user_registered', USER, { model, log });
  assert.equal(ok, true);
  assert.equal(model.calls, 2); // génesis (primera vez) + el evento
  assert.equal(lines.length, 0);
  const genesis = model.docs.find((d) => d.index === 0);
  const block = model.docs.find((d) => d.index === 1);
  assert.ok(genesis, 'se crea el génesis');
  assert.equal(block.data.event, 'user_registered');
  assert.equal(block.data.userId, USER._id);
});

test('devuelve false sin lanzar cuando el modelo lanza', async () => {
  const { lines, log } = collectLog();
  const err = new Error('fallo de red con ana.privada@example.com');
  err.name = 'MongoNetworkError';
  const ok = await recordUserEventSafe('profile_updated', USER, {
    model: throwingModel(err),
    log,
  });
  assert.equal(ok, false);
  assert.equal(lines.length, 1);
  assert.match(lines[0], /MongoNetworkError/);
});

test('devuelve false sin lanzar cuando el modelo no responde (timeout)', async () => {
  const { lines, log } = collectLog();
  const started = Date.now();
  const ok = await recordUserEventSafe('vak_set', USER, {
    model: hangingModel(),
    timeoutMs: 50,
    log,
  });
  assert.equal(ok, false);
  assert.ok(Date.now() - started < 2000, 'respeta el timeout');
  assert.equal(lines.length, 1);
  assert.match(lines[0], /TimeoutError/);
});

test('con LEDGER_DISABLED=true no llama al modelo y devuelve false', async () => {
  const previous = process.env.LEDGER_DISABLED;
  process.env.LEDGER_DISABLED = 'true';
  try {
    const model = fakeModel();
    const ok = await recordUserEventSafe('user_registered', USER, { model, log: () => {} });
    assert.equal(ok, false);
    assert.equal(model.calls, 0);
  } finally {
    if (previous === undefined) delete process.env.LEDGER_DISABLED;
    else process.env.LEDGER_DISABLED = previous;
  }
});

test('el log nunca contiene email, hash de contraseña ni huella', async () => {
  const fingerprint = userFingerprint(USER);
  const { lines, log } = collectLog();
  const err = new Error(`duplicado para ${USER.email} hash ${USER.password} huella ${fingerprint}`);
  err.name = 'ValidationError';
  await recordUserEventSafe('password_changed', USER, { model: throwingModel(err), log });
  await recordUserEventSafe('password_changed', USER, {
    model: throwingModel(new Error(USER.password)),
    timeoutMs: 1000,
    log,
  });
  const all = lines.join('\n');
  assert.ok(lines.length >= 2);
  assert.ok(!all.includes(USER.email));
  assert.ok(!all.includes(USER.password));
  assert.ok(!all.includes(fingerprint));
  assert.ok(all.includes(USER._id), 'sí incluye el userId');
  assert.ok(all.includes('password_changed'));
});

test('no lanza aunque el logger falle', async () => {
  const ok = await recordUserEventSafe('user_registered', USER, {
    model: throwingModel(new Error('x')),
    log: () => {
      throw new Error('logger roto');
    },
  });
  assert.equal(ok, false);
});

test('un éxito no deja el temporizador activo (la prueba termina rápido)', async () => {
  const model = fakeModel();
  const started = Date.now();
  const ok = await recordUserEventSafe('vak_set', USER, {
    model,
    timeoutMs: 60_000,
    log: () => {},
  });
  assert.equal(ok, true);
  assert.ok(Date.now() - started < 5000);
});

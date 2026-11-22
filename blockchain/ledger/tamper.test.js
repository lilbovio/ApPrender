// Pruebas de tamper.js con driver y sistema de archivos falsos.
// No se conecta a MongoDB ni a Atlas y no se toca el disco real.

import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { run, parseArgs, EXIT_OK, EXIT_ERROR } from './tamper.js';

const FAKE_URI = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/apprender';
const FAKE_EMAIL = 'victim@example.invalid';
const FAKE_HASH = '$2b$10$HASHFALSOSECRETO';
const OTHER_EMAIL = 'other@example.invalid';
const BACKUP = '/fake/blockchain/data/tamper-backup.json';
const VICTIM_ID = 'a1b2c3d4e5f6a7b8c9d0e1f2';
const OTHER_ID = 'ffffffffffffffffffffffff';
const ENV = { TAMPER_ALLOWED_EMAIL: FAKE_EMAIL };
const FIXED_NOW = () => new Date('2026-01-01T00:00:00.000Z');

// Dinero de prueba: MONGO_URI solo para comprobar que nunca aparece en la salida.
let savedUri;
before(() => {
  savedUri = process.env.MONGO_URI;
  process.env.MONGO_URI = FAKE_URI;
});
after(() => {
  if (savedUri === undefined) delete process.env.MONGO_URI;
  else process.env.MONGO_URI = savedUri;
});

class FakeObjectId {
  constructor(value) {
    this.value = String(value);
  }
  toString() {
    return this.value;
  }
}

// Evalúa un filtro simple: igualdad o $regex. Suficiente para estas pruebas.
function matches(doc, filter) {
  return Object.entries(filter).every(([key, cond]) => {
    const actual = doc[key];
    if (cond && typeof cond === 'object' && '$regex' in cond) {
      return new RegExp(cond.$regex, cond.$options ?? '').test(String(actual));
    }
    return String(actual) === String(cond);
  });
}

function setPath(doc, dotted, value) {
  const keys = dotted.split('.');
  let target = doc;
  for (const key of keys.slice(0, -1)) target = target[key];
  target[keys[keys.length - 1]] = value;
}

// Colección falsa. Todas las operaciones quedan registradas en `events`, en orden.
function fakeCollection(name, docs, events) {
  return {
    find(filter) {
      events.push({ op: 'find', collection: name, filter });
      const found = docs.filter((d) => matches(d, filter)).map((d) => ({ ...d }));
      const cursor = {
        limit: () => cursor,
        toArray: async () => found,
      };
      return cursor;
    },
    async updateOne(filter, update) {
      events.push({ op: 'updateOne', collection: name, filter, update });
      const hit = docs.filter((d) => matches(d, filter));
      if (hit.length === 1) {
        for (const [path, value] of Object.entries(update.$set)) setPath(hit[0], path, value);
      }
      return { matchedCount: hit.length, modifiedCount: hit.length === 1 ? 1 : 0 };
    },
  };
}

function fakeDriver({ users = [], blocks = [], failConnect = false } = {}, events) {
  const collections = {
    users: fakeCollection('users', users, events),
    ledgerblocks: fakeCollection('ledgerblocks', blocks, events),
  };
  return {
    Types: { ObjectId: FakeObjectId },
    connectCalls: 0,
    disconnectCalls: 0,
    users,
    blocks,
    connection: { collection: (name) => collections[name] },
    async connect() {
      this.connectCalls += 1;
      events.push({ op: 'connect' });
      if (failConnect) throw new Error('fallo simulado de red');
      return this;
    },
    async disconnect() {
      this.disconnectCalls += 1;
      events.push({ op: 'disconnect' });
    },
  };
}

// Sistema de archivos falso en memoria. Registra escrituras y borrados en `events`.
function fakeFs(files, events, { failWrite = false } = {}) {
  const enoent = () => Object.assign(new Error('no existe'), { code: 'ENOENT' });
  return {
    files,
    async readFile(p) {
      if (!(p in files)) throw enoent();
      return files[p];
    },
    async mkdir(p) {
      events.push({ op: 'mkdir', path: p });
    },
    async writeFile(p, data, opts) {
      events.push({ op: 'writeFile', path: p, flag: opts?.flag });
      if (failWrite) throw new Error('disco lleno simulado');
      if (opts?.flag === 'wx' && p in files) {
        throw Object.assign(new Error('ya existe'), { code: 'EEXIST' });
      }
      files[p] = data;
    },
    async unlink(p) {
      events.push({ op: 'unlink', path: p });
      if (!(p in files)) throw enoent();
      delete files[p];
    },
  };
}

function user(id, email, overrides = {}) {
  return { _id: new FakeObjectId(id), email, name: 'Nombre original', password: FAKE_HASH, ...overrides };
}

function block(index, userId, event = 'user_registered') {
  return {
    index,
    timestamp: '2026-01-01T00:00:00.000Z',
    data: { event, userId, fingerprint: 'f'.repeat(64) },
    prev_hash: '0'.repeat(64),
    hash: 'e'.repeat(64),
  };
}

// Prepara driver, fs y log falsos. Devuelve también los eventos para las aserciones.
function setup({ users = [VICTIM], blocks = [], files = {}, env = ENV, failConnect = false, failWrite = false } = {}) {
  const events = [];
  const logs = [];
  const driver = fakeDriver({ users: users.map((u) => ({ ...u })), blocks: blocks.map((b) => structuredClone(b)), failConnect }, events);
  const fs = fakeFs(files, events, { failWrite });
  const log = (msg) => logs.push(msg);
  const exec = (argv) => run({ argv, env, driver, fs, log, now: FIXED_NOW, backupPath: BACKUP });
  return { driver, fs, events, logs, files, exec };
}

const VICTIM = user(VICTIM_ID, FAKE_EMAIL);
const OTHER = user(OTHER_ID, OTHER_EMAIL);
const writes = (events) => events.filter((e) => e.op === 'updateOne' || e.op === 'writeFile' || e.op === 'unlink');
const connects = (events) => events.filter((e) => e.op === 'connect');

// ---------- Parseo de argumentos ----------

test('parseArgs rechaza comandos desconocidos y opciones no reconocidas', () => {
  assert.throws(() => parseArgs([]), /Comando no válido/);
  assert.throws(() => parseArgs(['drop']), /Comando no válido/);
  assert.throws(() => parseArgs(['user', '--password', 'x']), /Opción no reconocida/);
  assert.throws(() => parseArgs(['user', '--email']), /Falta el valor de --email/);
});

test('parseArgs separa el comando, las opciones y --confirm', () => {
  const { command, options } = parseArgs(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'X', '--confirm']);
  assert.equal(command, 'user');
  assert.deepEqual(options, { confirm: true, email: FAKE_EMAIL, field: 'name', value: 'X' });
});

// ---------- Modo simulación ----------

test('sin --confirm no conecta ni escribe nada (user, block y restore)', async () => {
  const backup = JSON.stringify({ kind: 'block', target: 2, field: 'data.event', original: 'user_registered' });

  const u = setup({ files: {} });
  assert.equal(await u.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo']), EXIT_OK);
  assert.equal(connects(u.events).length, 0);
  assert.equal(writes(u.events).length, 0);
  assert.equal(u.driver.connectCalls, 0);

  const b = setup({ files: {} });
  assert.equal(await b.exec(['block', '--index', '2']), EXIT_OK);
  assert.equal(connects(b.events).length, 0);
  assert.equal(writes(b.events).length, 0);

  const r = setup({ files: { [BACKUP]: backup } });
  assert.equal(await r.exec(['restore']), EXIT_OK);
  assert.equal(connects(r.events).length, 0);
  assert.equal(writes(r.events).length, 0);
  assert.ok(BACKUP in r.files, 'la copia no se borra en simulación');
});

test('la simulación no imprime el valor nuevo ni el email', async () => {
  const t = setup();
  await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'NombreNuevoSecreto']);
  const out = t.logs.join('\n');
  assert.ok(!out.includes(FAKE_EMAIL));
  assert.ok(out.includes('Simulación'));
});

// ---------- Guardas de entorno y argumentos (sin conexión) ----------

test('falta TAMPER_ALLOWED_EMAIL: refuse con exit 1 y sin conexión (incluso con --confirm)', async () => {
  for (const env of [{}, { TAMPER_ALLOWED_EMAIL: '' }, { TAMPER_ALLOWED_EMAIL: '   ' }]) {
    const t = setup({ env });
    const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'X', '--confirm']);
    assert.equal(code, EXIT_ERROR);
    assert.equal(connects(t.events).length, 0);
    assert.equal(writes(t.events).length, 0);
  }
});

test('email distinto de TAMPER_ALLOWED_EMAIL: refuse antes de conectar', async () => {
  const t = setup();
  const code = await t.exec(['user', '--email', OTHER_EMAIL, '--field', 'name', '--value', 'X', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(connects(t.events).length, 0);
  assert.equal(writes(t.events).length, 0);
  assert.ok(!t.logs.join('\n').includes(OTHER_EMAIL));
});

test('email se compara sin distinguir mayúsculas', async () => {
  const t = setup();
  const code = await t.exec(['user', '--email', FAKE_EMAIL.toUpperCase(), '--field', 'name', '--value', 'X', '--confirm']);
  assert.equal(code, EXIT_OK);
  assert.equal(connects(t.events).length, 1);
});

test('otro campo distinto de name se rechaza antes de conectar', async () => {
  for (const field of ['email', 'password', 'avatar', 'vakType']) {
    const t = setup();
    const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', field, '--value', 'X', '--confirm']);
    assert.equal(code, EXIT_ERROR, `campo ${field}`);
    assert.equal(connects(t.events).length, 0);
    assert.equal(writes(t.events).length, 0);
  }
});

test('bloque génesis (índice 0) se rechaza antes de conectar', async () => {
  const t = setup({ blocks: [block(0, VICTIM_ID)] });
  const code = await t.exec(['block', '--index', '0', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(connects(t.events).length, 0);
  assert.equal(writes(t.events).length, 0);
});

// ---------- Guardas contra la base de datos ----------

test('bloque de otro usuario se rechaza sin modificar nada', async () => {
  const t = setup({ users: [VICTIM, OTHER], blocks: [block(1, OTHER_ID), block(2, VICTIM_ID)] });
  const code = await t.exec(['block', '--index', '1', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(writes(t.events).length, 0);
  assert.equal(t.driver.blocks[0].data.event, 'user_registered');
});

test('usuario de prueba inexistente: refuse sin modificar', async () => {
  const t = setup({ users: [OTHER] });
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'X', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(writes(t.events).length, 0);
});

test('dos usuarios que coinciden con el email: refuse sin modificar', async () => {
  const twin = user('bbbbbbbbbbbbbbbbbbbbbbbb', FAKE_EMAIL.toUpperCase());
  const t = setup({ users: [VICTIM, twin] });
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'X', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(writes(t.events).length, 0);
  assert.ok(t.logs.some((l) => l.includes('exactamente 1')));
});

test('bloque inexistente: refuse sin modificar', async () => {
  const t = setup({ blocks: [block(1, VICTIM_ID)] });
  const code = await t.exec(['block', '--index', '9', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(writes(t.events).length, 0);
});

// ---------- Copia de seguridad ----------

test('la copia se escribe ANTES del updateOne y no contiene email ni hash', async () => {
  const t = setup();
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(code, EXIT_OK);

  const order = t.events.map((e) => e.op);
  assert.ok(order.indexOf('writeFile') > -1, 'hubo escritura de copia');
  assert.ok(order.indexOf('writeFile') < order.indexOf('updateOne'), 'copia antes de modificar');
  assert.equal(t.events.find((e) => e.op === 'writeFile').flag, 'wx');

  const saved = JSON.parse(t.files[BACKUP]);
  assert.deepEqual(Object.keys(saved).sort(), ['field', 'kind', 'original', 'savedAt', 'target']);
  assert.equal(saved.kind, 'user');
  assert.equal(saved.target, VICTIM_ID);
  assert.equal(saved.field, 'name');
  assert.equal(saved.original, 'Nombre original');
  assert.ok(!t.files[BACKUP].includes(FAKE_EMAIL));
  assert.ok(!t.files[BACKUP].includes(FAKE_HASH));
});

test('si no se puede escribir la copia, no se modifica la base', async () => {
  const t = setup({ failWrite: true });
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(t.events.filter((e) => e.op === 'updateOne').length, 0);
  assert.equal(t.driver.users[0].name, 'Nombre original');
});

test('existe una copia previa: refuse sin conectar y sin sobrescribirla', async () => {
  const previous = '{"kind":"user","target":"x","field":"name","original":"Anterior"}';
  const t = setup({ files: { [BACKUP]: previous } });
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(connects(t.events).length, 0);
  assert.equal(writes(t.events).length, 0);
  assert.equal(t.files[BACKUP], previous);
});

// ---------- Ataque ----------

test('user: exactamente un updateOne, filtrado por _id y con $set solo de name', async () => {
  const t = setup();
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(code, EXIT_OK);

  const updates = t.events.filter((e) => e.op === 'updateOne');
  assert.equal(updates.length, 1);
  assert.equal(updates[0].collection, 'users');
  assert.deepEqual(Object.keys(updates[0].filter), ['_id']);
  assert.equal(String(updates[0].filter._id), VICTIM_ID);
  assert.deepEqual(updates[0].update, { $set: { name: 'Nuevo' } });
  assert.equal(t.driver.users[0].name, 'Nuevo');
  assert.equal(t.driver.users[0].password, FAKE_HASH, 'la contraseña no se toca');
  assert.equal(connects(t.events).length, 1);
  assert.equal(t.driver.disconnectCalls, 1);
});

test('block: exactamente un updateOne por índice, solo data.event, nunca hash', async () => {
  const t = setup({ blocks: [block(0, VICTIM_ID), block(1, VICTIM_ID), block(2, VICTIM_ID)] });
  const before = structuredClone(t.driver.blocks[2]);
  const code = await t.exec(['block', '--index', '2', '--confirm']);
  assert.equal(code, EXIT_OK);

  const updates = t.events.filter((e) => e.op === 'updateOne');
  assert.equal(updates.length, 1);
  assert.equal(updates[0].collection, 'ledgerblocks');
  assert.deepEqual(updates[0].filter, { index: 2 });
  assert.deepEqual(updates[0].update, { $set: { 'data.event': 'tampered' } });
  assert.equal(t.driver.blocks[2].data.event, 'tampered');
  assert.equal(t.driver.blocks[2].hash, before.hash, 'el hash no se recalcula');
  assert.equal(t.driver.blocks[2].prev_hash, before.prev_hash);
  assert.equal(t.driver.blocks[2].data.userId, before.data.userId);
});

test('la salida de tamper no contiene email, hash ni MONGO_URI', async () => {
  const t = setup({ blocks: [block(1, VICTIM_ID)] });
  await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  await t.exec(['block', '--index', '1', '--confirm']);
  await t.exec(['restore', '--confirm']);
  await t.exec(['restore', '--confirm']);
  const out = t.logs.join('\n');
  for (const secret of [FAKE_EMAIL, FAKE_HASH, FAKE_URI, 'claveFalsa', 'hostFalso']) {
    assert.ok(!out.includes(secret), `la salida contiene ${secret}`);
  }
});

test('si el updateOne no encuentra el documento, se borra la copia', async () => {
  const t = setup();
  t.driver.connection.collection = () => ({
    find: () => ({ limit: () => ({ toArray: async () => [{ _id: new FakeObjectId(VICTIM_ID), name: 'x' }] }) }),
    updateOne: async () => ({ matchedCount: 0 }),
  });
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.ok(!(BACKUP in t.files), 'copia eliminada porque nada cambió');
});

test('fallo de conexión: exit 1 y sin escrituras', async () => {
  const t = setup({ failConnect: true });
  const code = await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(writes(t.events).length, 0);
});

// ---------- Restauración ----------

test('restore sin copia: refuse sin conectar', async () => {
  const t = setup({ files: {} });
  const code = await t.exec(['restore', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.equal(connects(t.events).length, 0);
  assert.equal(writes(t.events).length, 0);
});

test('restore de user devuelve el original, usa filtro _id y borra la copia', async () => {
  const t = setup();
  await t.exec(['user', '--email', FAKE_EMAIL, '--field', 'name', '--value', 'Nuevo', '--confirm']);
  assert.equal(t.driver.users[0].name, 'Nuevo');

  const code = await t.exec(['restore', '--confirm']);
  assert.equal(code, EXIT_OK);
  assert.equal(t.driver.users[0].name, 'Nombre original');
  assert.equal(t.driver.users[0].password, FAKE_HASH);
  assert.ok(!(BACKUP in t.files), 'la copia se borra');

  const restoreUpdate = t.events.filter((e) => e.op === 'updateOne').at(-1);
  assert.deepEqual(Object.keys(restoreUpdate.filter), ['_id']);
  assert.equal(String(restoreUpdate.filter._id), VICTIM_ID);
  assert.deepEqual(restoreUpdate.update, { $set: { name: 'Nombre original' } });
});

test('restore de block devuelve el evento original y borra la copia', async () => {
  const t = setup({ blocks: [block(1, VICTIM_ID, 'profile_updated')] });
  await t.exec(['block', '--index', '1', '--confirm']);
  assert.equal(t.driver.blocks[0].data.event, 'tampered');

  const code = await t.exec(['restore', '--confirm']);
  assert.equal(code, EXIT_OK);
  assert.equal(t.driver.blocks[0].data.event, 'profile_updated');
  assert.equal(t.driver.blocks[0].hash, 'e'.repeat(64));
  assert.ok(!(BACKUP in t.files));

  const restoreUpdate = t.events.filter((e) => e.op === 'updateOne').at(-1);
  assert.deepEqual(restoreUpdate.filter, { index: 1 });
  assert.deepEqual(restoreUpdate.update, { $set: { 'data.event': 'profile_updated' } });
});

test('restore con copia dañada o de forma inválida: refuse sin conectar', async () => {
  const bad = [
    'no es json',
    JSON.stringify({ kind: 'block', target: 0, field: 'data.event', original: 'x' }),
    JSON.stringify({ kind: 'user', target: 'id', field: 'email', original: 'x' }),
  ];
  for (const content of bad) {
    const t = setup({ files: { [BACKUP]: content } });
    const code = await t.exec(['restore', '--confirm']);
    assert.equal(code, EXIT_ERROR);
    assert.equal(connects(t.events).length, 0);
    assert.equal(writes(t.events).length, 0);
  }
});

test('si la restauración no encuentra el documento, la copia se conserva', async () => {
  const files = { [BACKUP]: JSON.stringify({ kind: 'block', target: 7, field: 'data.event', original: 'x' }) };
  const t = setup({ files, blocks: [block(1, VICTIM_ID)] });
  const code = await t.exec(['restore', '--confirm']);
  assert.equal(code, EXIT_ERROR);
  assert.ok(BACKUP in t.files);
});

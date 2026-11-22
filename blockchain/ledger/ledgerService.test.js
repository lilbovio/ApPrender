// Pruebas del servicio del ledger con un modelo falso en memoria.
// No se conecta a MongoDB ni a Atlas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureGenesis, recordUserEvent, loadChain } from './ledgerService.js';
import { createBlock, verifyChain, GENESIS_PREV_HASH } from '../chain.js';

const PASSWORD_HASH = '$2b$10$HashDePruebaQueNoEsRealAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

function dupError(field) {
  const err = new Error(`E11000 duplicate key error collection: ledgerblocks index: ${field}_1 dup key`);
  err.code = 11000;
  err.keyPattern = { [field]: 1 };
  return err;
}

// Consulta mínima compatible con la cadena usada por el servicio:
// .sort({campo: dir}).lean()
class FakeQuery {
  constructor(docs, single) {
    this.docs = docs;
    this.single = single;
    this.sortKey = null;
    this.sortDir = 1;
  }

  sort(spec) {
    const [[key, dir]] = Object.entries(spec);
    this.sortKey = key;
    this.sortDir = dir;
    return this;
  }

  lean() {
    let docs = [...this.docs];
    if (this.sortKey) {
      const k = this.sortKey;
      const d = this.sortDir;
      docs.sort((a, b) => (a[k] - b[k]) * d);
    }
    const copies = docs.map((x) => ({ ...x }));
    return Promise.resolve(this.single ? (copies[0] ?? null) : copies);
  }
}

// Modelo falso: guarda documentos en un array y aplica unicidad de index y hash.
// `injectRaces(n)` hace que las próximas n escrituras pierdan una carrera: otro
// escritor inserta un bloque válido en el mismo índice justo antes.
class FakeLedgerModel {
  constructor() {
    this.docs = [];
    this.createAttempts = 0;
    this.racesLeft = 0;
  }

  injectRaces(n) {
    this.racesLeft = n;
  }

  matches(doc, filter) {
    return Object.entries(filter).every(([k, v]) => doc[k] === v);
  }

  findOne(filter = {}) {
    return new FakeQuery(this.docs.filter((d) => this.matches(d, filter)), true);
  }

  find(filter = {}) {
    return new FakeQuery(this.docs.filter((d) => this.matches(d, filter)), false);
  }

  #insertCompetitor(index) {
    const prev = this.docs.find((d) => d.index === index - 1)?.hash ?? GENESIS_PREV_HASH;
    const rival = createBlock(index, { event: 'user_registered', userId: 'rival', fingerprint: '0'.repeat(64) }, prev);
    this.docs.push(rival);
  }

  async create(doc) {
    this.createAttempts += 1;
    if (this.racesLeft > 0) {
      this.racesLeft -= 1;
      this.#insertCompetitor(doc.index);
    }
    if (this.docs.some((d) => d.index === doc.index)) throw dupError('index');
    if (this.docs.some((d) => d.hash === doc.hash)) throw dupError('hash');
    this.docs.push({ ...doc });
    return { ...doc };
  }
}

const user = (overrides = {}) => ({
  _id: '65f000000000000000000002',
  name: 'Luis',
  email: 'luis@example.com',
  avatar: '',
  vakType: null,
  password: PASSWORD_HASH,
  ...overrides,
});

test('ensureGenesis crea el génesis una sola vez', async () => {
  const model = new FakeLedgerModel();
  const g1 = await ensureGenesis(model);
  const g2 = await ensureGenesis(model);
  assert.equal(model.docs.length, 1);
  assert.equal(g1.index, 0);
  assert.equal(g1.prev_hash, GENESIS_PREV_HASH);
  assert.deepEqual(g1, g2);
});

test('la cadena crece con cada evento y sus hashes se verifican', async () => {
  const model = new FakeLedgerModel();
  await ensureGenesis(model);
  await recordUserEvent('user_registered', user(), model);
  await recordUserEvent('profile_updated', user({ name: 'Luis P.' }), model);
  await recordUserEvent('vak_set', user({ vakType: 'kinestesico' }), model);

  const chain = await loadChain(model);
  assert.deepEqual(chain.map((b) => b.index), [0, 1, 2, 3]);
  assert.equal(verifyChain(chain).valid, true);
});

test('recordUserEvent crea el génesis si la cadena aún no existe', async () => {
  const model = new FakeLedgerModel();
  const block = await recordUserEvent('user_registered', user(), model);
  assert.equal(block.index, 1);
  const chain = await loadChain(model);
  assert.equal(chain[0].index, 0);
  assert.equal(verifyChain(chain).valid, true);
});

test('loadChain devuelve solo los campos de la cadena, ordenados por índice', async () => {
  const model = new FakeLedgerModel();
  await ensureGenesis(model);
  await recordUserEvent('user_registered', user(), model);
  const chain = await loadChain(model);
  for (const block of chain) {
    assert.deepEqual(Object.keys(block).sort(), ['data', 'hash', 'index', 'prev_hash', 'timestamp']);
  }
});

test('alterar un bloque guardado se detecta con verifyChain', async () => {
  const model = new FakeLedgerModel();
  await ensureGenesis(model);
  await recordUserEvent('user_registered', user(), model);
  await recordUserEvent('vak_set', user({ vakType: 'auditivo' }), model);

  model.docs[1].data.fingerprint = 'f'.repeat(64);
  const r = verifyChain(await loadChain(model));
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.index === 1));
});

test('el registro no guarda la contraseña ni su hash en la cadena', async () => {
  const model = new FakeLedgerModel();
  await recordUserEvent('user_registered', user(), model);
  const texto = JSON.stringify(await loadChain(model));
  assert.equal(texto.includes(PASSWORD_HASH), false);
});

test('reintenta cuando pierde la carrera por el índice y termina bien', async () => {
  const model = new FakeLedgerModel();
  await ensureGenesis(model);
  model.injectRaces(2);
  const before = model.createAttempts;

  const block = await recordUserEvent('user_registered', user(), model);

  assert.equal(model.createAttempts - before, 3);
  assert.equal(block.index, 3);
  const chain = await loadChain(model);
  assert.equal(new Set(chain.map((b) => b.index)).size, chain.length);
  assert.equal(verifyChain(chain).valid, true);
});

test('se rinde tras 3 reintentos y propaga el error de índice', async () => {
  const model = new FakeLedgerModel();
  await ensureGenesis(model);
  model.injectRaces(10);
  const before = model.createAttempts;
  await assert.rejects(recordUserEvent('user_registered', user(), model), { code: 11000 });
  assert.equal(model.createAttempts - before, 4);
});

test('un evento inválido no escribe nada en la cadena', async () => {
  const model = new FakeLedgerModel();
  await ensureGenesis(model);
  await assert.rejects(recordUserEvent('nope', user(), model), /Evento de ledger no válido/);
  assert.equal(model.docs.length, 1);
});

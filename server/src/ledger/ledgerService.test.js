// Pruebas de la copia server-side de ledgerService con un modelo falso en memoria.
// No se conecta a MongoDB ni a Atlas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureGenesis, recordUserEvent, loadChain } from './ledgerService.js';
import { computeHash, GENESIS_PREV_HASH } from './chain.js';

const USER = {
  _id: '65a000000000000000000002',
  name: 'Luis Prueba',
  email: 'luis.prueba@example.com',
  password: '$2b$10$HashDePruebaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  avatar: '',
  vakType: 'visual',
};

// Consulta mínima: sort({campo: dir}) y lean().
class FakeQuery {
  constructor(docs, single) {
    this.docs = docs;
    this.single = single;
    this.key = null;
    this.dir = 1;
  }
  sort(spec) {
    const [[key, dir]] = Object.entries(spec);
    this.key = key;
    this.dir = dir;
    return this;
  }
  lean() {
    const docs = [...this.docs];
    if (this.key) docs.sort((a, b) => (a[this.key] - b[this.key]) * this.dir);
    const copies = docs.map((d) => ({ ...d }));
    return Promise.resolve(this.single ? (copies[0] ?? null) : copies);
  }
}

class FakeModel {
  constructor() {
    this.docs = [];
    this.creates = 0;
  }
  findOne(filter = {}) {
    return new FakeQuery(this.docs.filter((d) => matches(d, filter)), true);
  }
  find(filter = {}) {
    return new FakeQuery(this.docs.filter((d) => matches(d, filter)), false);
  }
  async create(doc) {
    this.creates += 1;
    if (this.docs.some((d) => d.index === doc.index)) {
      const err = new Error('E11000 duplicate key index');
      err.code = 11000;
      err.keyPattern = { index: 1 };
      throw err;
    }
    this.docs.push({ ...doc });
    return doc;
  }
}

function matches(doc, filter) {
  return Object.entries(filter).every(([k, v]) => doc[k] === v);
}

test('el génesis se crea una sola vez', async () => {
  const model = new FakeModel();
  const first = await ensureGenesis(model);
  const second = await ensureGenesis(model);
  assert.equal(first.index, 0);
  assert.equal(first.prev_hash, GENESIS_PREV_HASH);
  assert.deepEqual(second, first);
  assert.equal(model.docs.length, 1);
});

test('registrar eventos hace crecer la cadena y cada hash se recalcula igual', async () => {
  const model = new FakeModel();
  await recordUserEvent('user_registered', USER, model);
  await recordUserEvent('vak_set', USER, model);
  await recordUserEvent('profile_updated', { ...USER, name: 'Otro' }, model);

  const chain = await loadChain(model);
  assert.equal(chain.length, 4); // génesis + 3 eventos
  chain.forEach((block, i) => {
    assert.equal(block.index, i);
    assert.equal(computeHash(block), block.hash);
    assert.equal(block.prev_hash, i === 0 ? GENESIS_PREV_HASH : chain[i - 1].hash);
  });
  assert.equal(chain[1].data.event, 'user_registered');
  assert.equal(chain[1].data.userId, USER._id);
});

test('un evento no válido se rechaza sin escribir', async () => {
  const model = new FakeModel();
  await assert.rejects(() => recordUserEvent('evento_inventado', USER, model), /no válido/);
  assert.equal(model.creates, 0);
});

test('una colisión de índice se reintenta y el bloque nuevo encadena con el ganador', async () => {
  const model = new FakeModel();
  await ensureGenesis(model);
  // Otro escritor toma el índice 1 justo antes de nuestra escritura.
  const rival = { index: 1, timestamp: '2026-01-01T00:00:00.000Z', data: { event: 'x' }, prev_hash: model.docs[0].hash, hash: 'a'.repeat(64) };
  const originalCreate = model.create.bind(model);
  let injected = false;
  model.create = async (doc) => {
    if (!injected) {
      injected = true;
      model.docs.push(rival);
    }
    return originalCreate(doc);
  };
  await recordUserEvent('vak_set', USER, model);
  const chain = await loadChain(model);
  assert.equal(chain.length, 3);
  assert.equal(chain[2].index, 2);
  assert.equal(chain[2].prev_hash, rival.hash);
});

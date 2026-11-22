// Pruebas de usersSource.js con una colección falsa. No se conecta a MongoDB ni a Atlas.
// La colección falsa solo implementa find: cualquier otro método lanza un error.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mongoUsersSource } from './usersSource.js';

// Driver falso: expone connection.collection(name) con un único método, find.
function fakeDriver(docs) {
  const log = { collections: [], finds: 0 };
  const driver = {
    log,
    connection: {
      collection(name) {
        log.collections.push(name);
        return {
          find(filter) {
            log.finds += 1;
            assertEmptyFilter(filter);
            return { toArray: async () => docs.map((d) => ({ ...d })) };
          },
        };
      },
    },
  };
  return driver;
}

function assertEmptyFilter(filter) {
  if (JSON.stringify(filter) !== '{}') throw new Error('solo se permite leer todos los documentos');
}

const DOCS = [
  {
    _id: 'u1',
    name: 'Ana',
    email: 'ana@example.com',
    avatar: 'a.png',
    vakType: 'visual',
    password: '$2b$10$HASHFALSO1',
    secretoAjeno: 'no debe salir',
  },
  { _id: 'u2', name: 'Luis', email: 'luis@example.com', password: '$2b$10$HASHFALSO2' },
];

test('listUsers lee la colección users con find y devuelve todos los documentos', async () => {
  const driver = fakeDriver(DOCS);
  const users = await mongoUsersSource(driver).listUsers();

  assert.deepEqual(driver.log.collections, ['users']);
  assert.equal(driver.log.finds, 1);
  assert.equal(users.length, 2);
  assert.equal(users[0]._id, 'u1');
  assert.equal(users[1].email, 'luis@example.com');
});

test('listUsers devuelve solo los campos del ledger, como objetos planos', async () => {
  const users = await mongoUsersSource(fakeDriver(DOCS)).listUsers();

  assert.deepEqual(Object.keys(users[0]).sort(), ['_id', 'avatar', 'email', 'name', 'password', 'vakType']);
  assert.equal('secretoAjeno' in users[0], false);
  assert.equal(users[0].password, '$2b$10$HASHFALSO1');
});

test('listUsers sin documentos devuelve una lista vacía', async () => {
  const users = await mongoUsersSource(fakeDriver([])).listUsers();
  assert.deepEqual(users, []);
});

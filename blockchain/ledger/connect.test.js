// Pruebas de connect.js con un driver falso. No se conecta a MongoDB ni a Atlas.

import test from 'node:test';
import assert from 'node:assert/strict';
import { connectDB, disconnectDB, describeTarget } from './connect.js';

// URI ficticia con valores reconocibles, para comprobar que nunca aparecen en los errores.
const FAKE_URI = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/apprender?retryWrites=true';

// Driver falso: registra las llamadas y puede fallar a propósito.
function fakeDriver({ failWith = null } = {}) {
  const driver = {
    connectCalls: [],
    disconnectCalls: 0,
    async connect(uri, options) {
      driver.connectCalls.push({ uri, options });
      if (failWith) throw failWith;
      return driver;
    },
    async disconnect() {
      driver.disconnectCalls += 1;
    },
  };
  return driver;
}

// Guarda y restaura MONGO_URI alrededor de cada prueba que la modifica.
function withMongoUri(value, fn) {
  return async () => {
    const previous = process.env.MONGO_URI;
    if (value === undefined) delete process.env.MONGO_URI;
    else process.env.MONGO_URI = value;
    try {
      await fn();
    } finally {
      if (previous === undefined) delete process.env.MONGO_URI;
      else process.env.MONGO_URI = previous;
    }
  };
}

test('connectDB falla con mensaje claro si falta MONGO_URI y no conecta', withMongoUri(undefined, async () => {
  const driver = fakeDriver();
  await assert.rejects(connectDB(driver), /MONGO_URI/);
  assert.equal(driver.connectCalls.length, 0);
}));

test('connectDB llama a connect con el timeout de 8000 ms y devuelve el driver', withMongoUri(FAKE_URI, async () => {
  const driver = fakeDriver();
  const result = await connectDB(driver);
  assert.equal(result, driver);
  assert.equal(driver.connectCalls.length, 1);
  assert.equal(driver.connectCalls[0].uri, FAKE_URI);
  assert.equal(driver.connectCalls[0].options.serverSelectionTimeoutMS, 8000);
}));

test('el error de conexión no contiene la URI ni sus partes', withMongoUri(FAKE_URI, async () => {
  const leaky = new Error(`bad auth connecting to ${FAKE_URI}`);
  leaky.name = 'MongooseServerSelectionError';
  const driver = fakeDriver({ failWith: leaky });

  await assert.rejects(connectDB(driver), (err) => {
    assert.match(err.message, /No se pudo conectar a MongoDB/);
    assert.match(err.message, /MongooseServerSelectionError/);
    for (const secret of ['usuarioFalso', 'claveFalsa', 'hostFalso', 'mongodb+srv', '@']) {
      assert.equal(err.message.includes(secret), false, `el mensaje no debe contener "${secret}"`);
    }
    return true;
  });
}));

test('disconnectDB llama a disconnect del driver', async () => {
  const driver = fakeDriver();
  await disconnectDB(driver);
  assert.equal(driver.disconnectCalls, 1);
});

test('describeTarget devuelve solo el nombre de la base de datos', () => {
  const text = describeTarget(FAKE_URI);
  assert.equal(text, 'base de datos: apprender');
  for (const secret of ['usuarioFalso', 'claveFalsa', 'hostFalso', 'mongodb', 'retryWrites']) {
    assert.equal(text.includes(secret), false, `no debe contener "${secret}"`);
  }
});

test('describeTarget indica cuando la URI no trae nombre de base de datos', () => {
  const text = describeTarget('mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/');
  assert.equal(text, 'base de datos: (no especificada en la URI; MongoDB usará "test")');
  assert.equal(text.includes('hostFalso'), false);
});

test('describeTarget ignora los parámetros de consulta', () => {
  const text = describeTarget('mongodb+srv://u:p@h.example/mibase?authSource=admin&retryWrites=true');
  assert.equal(text, 'base de datos: mibase');
});

test('describeTarget no devuelve texto sospechoso como nombre de base', () => {
  const text = describeTarget('mongodb+srv://u:p@h.example/nombre.con.puntos');
  assert.equal(text, 'base de datos: (nombre no reconocido)');
});

test('describeTarget responde sin filtrar datos si la cadena no es una URI', () => {
  const text = describeTarget('esto no es una uri claveFalsa');
  assert.equal(text, 'base de datos: desconocida (URI no válida)');
  assert.equal(text.includes('claveFalsa'), false);
  assert.equal(describeTarget(undefined), 'base de datos: desconocida (URI no válida)');
});

// Comprueba que ninguno de los valores ficticios aparece en la salida.
function assertNoLeak(text, secrets) {
  for (const secret of secrets) {
    assert.equal(text.includes(secret), false, `la salida no debe contener "${secret}": ${text}`);
  }
}

test('describeTarget acepta varios hosts con puerto y parámetros de consulta', () => {
  const uri = 'mongodb://usuarioFalso:claveFalsa@hostFalso1:27017,hostFalso2:27017,hostFalso3:27017/mibase?replicaSet=rsFalso&ssl=true';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: mibase');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso1', 'hostFalso2', 'hostFalso3', 'rsFalso', 'ssl']);
});

test('describeTarget acepta un solo host sin puerto', () => {
  const uri = 'mongodb://usuarioFalso:claveFalsa@hostFalso/mibase';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: mibase');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso']);
});

test('describeTarget acepta un solo host con puerto en mongodb://', () => {
  const uri = 'mongodb://usuarioFalso:claveFalsa@hostFalso:27017/mibase';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: mibase');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso']);
});

test('describeTarget acepta credenciales codificadas con caracteres especiales', () => {
  const uri = 'mongodb+srv://usu%40rioFalso:cla%3Fve%25Falsa%23@hostFalso.example/mibase?retryWrites=true';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: mibase');
  assertNoLeak(text, ['usu', 'rioFalso', 'cla', 'Falsa', 'hostFalso']);
});

test('describeTarget tolera una contraseña sin codificar que contiene "/"', () => {
  const uri = 'mongodb://usuarioFalso:clave/Falsa@hostFalso1:27017,hostFalso2:27017/mibase?ssl=true';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: mibase');
  assertNoLeak(text, ['usuarioFalso', 'clave', 'Falsa', 'hostFalso1', 'hostFalso2']);
});

test('describeTarget acepta mongodb+srv con varios parámetros', () => {
  const uri = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso.example/apprender?retryWrites=true&w=majority';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: apprender');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso', 'retryWrites']);
});

test('describeTarget indica base no especificada con varios hosts y sin nombre', () => {
  const uri = 'mongodb://usuarioFalso:claveFalsa@hostFalso1:27017,hostFalso2:27017/?replicaSet=rsFalso';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: (no especificada en la URI; MongoDB usará "test")');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso1', 'hostFalso2', 'rsFalso']);
});

test('describeTarget indica base no especificada si la URI no tiene barra tras el host', () => {
  const uri = 'mongodb://usuarioFalso:claveFalsa@hostFalso:27017';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: (no especificada en la URI; MongoDB usará "test")');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso']);
});

test('describeTarget marca como no reconocido un nombre con caracteres no válidos', () => {
  const uri = 'mongodb+srv://usuarioFalso:claveFalsa@hostFalso/mi.base%20x';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: (nombre no reconocido)');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso', 'mi.base', '%20']);
});

test('describeTarget marca como no reconocido un nombre con codificación inválida', () => {
  const uri = 'mongodb://usuarioFalso:claveFalsa@hostFalso/mi%ZZbase';
  const text = describeTarget(uri);
  assert.equal(text, 'base de datos: (nombre no reconocido)');
  assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso']);
});

test('describeTarget rechaza esquemas distintos de mongodb', () => {
  for (const uri of [
    'http://usuarioFalso:claveFalsa@hostFalso/mibase',
    'postgres://usuarioFalso:claveFalsa@hostFalso/mibase',
    'mongo://usuarioFalso:claveFalsa@hostFalso/mibase',
  ]) {
    const text = describeTarget(uri);
    assert.equal(text, 'base de datos: desconocida (URI no válida)');
    assertNoLeak(text, ['usuarioFalso', 'claveFalsa', 'hostFalso']);
  }
});

test('describeTarget no acepta valores que no son texto ni cadenas vacías', () => {
  for (const value of [null, 42, {}, [], '']) {
    assert.equal(describeTarget(value), 'base de datos: desconocida (URI no válida)');
  }
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { userFingerprint, buildUserEvent, LEDGER_EVENTS } from './fingerprint.js';

const PASSWORD_HASH = '$2b$10$EjemploDeHashBcryptNoEsLaClaveReal0123456789abcdef';

function sampleUser(overrides = {}) {
  return {
    _id: '65f000000000000000000001',
    name: 'Ana',
    email: 'ana@example.com',
    avatar: 'https://cdn.example.com/a.png',
    vakType: 'visual',
    password: PASSWORD_HASH,
    ...overrides,
  };
}

test('la huella es SHA-256 en hexadecimal (64 caracteres)', () => {
  assert.match(userFingerprint(sampleUser()), /^[0-9a-f]{64}$/);
});

test('la misma información produce siempre la misma huella', () => {
  assert.equal(userFingerprint(sampleUser()), userFingerprint(sampleUser()));
});

test('el orden de las claves del usuario no cambia la huella', () => {
  const u = sampleUser();
  const reordered = {
    password: u.password,
    vakType: u.vakType,
    avatar: u.avatar,
    email: u.email,
    name: u.name,
  };
  assert.equal(userFingerprint(u), userFingerprint(reordered));
});

test('cambiar name, email, avatar, vakType o password cambia la huella', () => {
  const base = userFingerprint(sampleUser());
  const changes = {
    name: 'Ana B',
    email: 'otra@example.com',
    avatar: 'https://cdn.example.com/b.png',
    vakType: 'auditivo',
    password: '$2b$10$OtroHashDistinto000000000000000000000000000000000000',
  };
  for (const [field, value] of Object.entries(changes)) {
    assert.notEqual(userFingerprint(sampleUser({ [field]: value })), base, `campo ${field}`);
  }
});

test('avatar ausente equivale a cadena vacía', () => {
  const sinAvatar = sampleUser({ avatar: undefined });
  assert.equal(userFingerprint(sinAvatar), userFingerprint(sampleUser({ avatar: '' })));
});

test('vakType ausente equivale a null', () => {
  const sinVak = sampleUser({ vakType: undefined });
  assert.equal(userFingerprint(sinVak), userFingerprint(sampleUser({ vakType: null })));
});

test('buildUserEvent devuelve evento, userId como texto y huella', () => {
  const user = sampleUser();
  const ev = buildUserEvent('user_registered', user);
  assert.deepEqual(Object.keys(ev).sort(), ['event', 'fingerprint', 'userId']);
  assert.equal(ev.event, 'user_registered');
  assert.equal(ev.userId, '65f000000000000000000001');
  assert.equal(ev.fingerprint, userFingerprint(user));
});

test('buildUserEvent acepta todos los eventos válidos', () => {
  for (const event of LEDGER_EVENTS) {
    assert.equal(buildUserEvent(event, sampleUser()).event, event);
  }
});

test('un evento inválido se rechaza', () => {
  assert.throws(() => buildUserEvent('user_hacked', sampleUser()), /Evento de ledger no válido/);
  assert.throws(() => buildUserEvent(undefined, sampleUser()), /Evento de ledger no válido/);
});

test('el evento no contiene la contraseña ni su hash', () => {
  const ev = buildUserEvent('password_changed', sampleUser());
  const texto = JSON.stringify(ev);
  assert.equal(texto.includes(PASSWORD_HASH), false);
  assert.equal(texto.includes('EjemploDeHashBcrypt'), false);
  assert.equal('password' in ev, false);
  assert.equal('passwordHash' in ev, false);
});

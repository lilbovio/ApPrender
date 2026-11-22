// tamper.js - Simula a un atacante que modifica la base de datos directamente, sin pasar
// por la aplicación, para demostrar que verifyUsers.js detecta la manipulación.
// `restore` deshace el cambio con la copia de seguridad guardada antes de modificar.
//
// ESCRIBE en Atlas, por eso está muy protegido:
//   - solo actúa sobre el usuario de prueba cuyo email es TAMPER_ALLOWED_EMAIL;
//   - sin --confirm nunca conecta: solo muestra qué haría;
//   - guarda una copia de seguridad ANTES de modificar y se niega a sobrescribirla.
//
// Uso (ver package.json, script ledger:tamper):
//   npm run ledger:tamper -- user --email <email> --field name --value <nuevo> [--confirm]
//   npm run ledger:tamper -- block --index <n> [--confirm]
//   npm run ledger:tamper -- restore [--confirm]
//
// Nunca imprime MONGO_URI, emails, hashes de contraseña ni datos de otros usuarios.
// Nota: la conexión la gestiona connect.js, que lee MONGO_URI de process.env.

import fsp from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './connect.js';

export const EXIT_OK = 0;
export const EXIT_ERROR = 1;

const DEFAULT_BACKUP_PATH = fileURLToPath(new URL('../data/tamper-backup.json', import.meta.url));
const COMMANDS = ['user', 'block', 'restore'];
const VALUE_OPTIONS = ['email', 'field', 'value', 'index'];
const TAMPERED_EVENT = 'tampered';

// Separa el comando (primer argumento posicional) y las opciones `--clave valor` / `--confirm`.
// Lanza Error con un mensaje seguro: nunca repite el valor de una opción.
export function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!COMMANDS.includes(command)) {
    throw new Error('Comando no válido: usa user, block o restore');
  }

  const options = { confirm: false };
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (token === '--confirm') {
      options.confirm = true;
      continue;
    }
    const name = token.startsWith('--') ? token.slice(2) : '';
    if (!VALUE_OPTIONS.includes(name)) {
      throw new Error('Opción no reconocida (revisa la sintaxis del comando)');
    }
    const value = rest[i + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`Falta el valor de --${name}`);
    }
    options[name] = value;
    i += 1;
  }
  return { command, options };
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Lee la copia de seguridad. Devuelve null si no existe.
async function readBackup(fs, backupPath) {
  let text;
  try {
    text = await fs.readFile(backupPath, 'utf8');
  } catch (err) {
    if (err?.code === 'ENOENT') return null;
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('La copia de seguridad existente no es JSON válido; revísala a mano');
  }
}

// Solo se aceptan copias con la forma exacta que genera este script.
function isValidBackup(backup) {
  if (!backup || typeof backup !== 'object') return false;
  if (backup.kind === 'user') {
    return backup.field === 'name' && typeof backup.target === 'string' && typeof backup.original === 'string';
  }
  if (backup.kind === 'block') {
    return backup.field === 'data.event' && Number.isSafeInteger(backup.target) && backup.target > 0
      && typeof backup.original === 'string';
  }
  return false;
}

// Escribe la copia ANTES de tocar la base. Con flag 'wx' falla si ya existe,
// así una copia original nunca se sobrescribe.
async function writeBackup(fs, backupPath, backup) {
  await fs.mkdir(path.dirname(backupPath), { recursive: true });
  try {
    await fs.writeFile(backupPath, `${JSON.stringify(backup, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
  } catch (err) {
    if (err?.code === 'EEXIST') {
      throw new Error('Ya existe una copia de seguridad: ejecuta restore antes de modificar otra vez');
    }
    throw err;
  }
}

// Validaciones que no requieren conexión. Devuelve el plan o lanza Error.
async function prepare(command, options, { env, fs, backupPath }) {
  if (command === 'restore') {
    const backup = await readBackup(fs, backupPath);
    if (!backup) throw new Error('No hay copia de seguridad que restaurar');
    if (!isValidBackup(backup)) throw new Error('La copia de seguridad no es válida; no se restaura');
    return { command, backup };
  }

  const allowed = (env.TAMPER_ALLOWED_EMAIL ?? '').trim().toLowerCase();
  if (!allowed) {
    throw new Error('Falta TAMPER_ALLOWED_EMAIL: el ataque solo se permite sobre ese usuario de prueba');
  }

  if (await readBackup(fs, backupPath)) {
    throw new Error('Ya existe una copia de seguridad pendiente: ejecuta restore antes de modificar otra vez');
  }

  if (command === 'user') {
    if (typeof options.email !== 'string' || options.email.trim().toLowerCase() !== allowed) {
      throw new Error('--email no coincide con TAMPER_ALLOWED_EMAIL');
    }
    if (options.field !== 'name') {
      throw new Error('Campo no permitido: solo se puede modificar name');
    }
    if (typeof options.value !== 'string' || options.value.trim() === '') {
      throw new Error('Falta --value (nuevo name)');
    }
    return { command, kind: 'user', email: allowed, value: options.value };
  }

  // command === 'block'
  if (!/^\d+$/.test(options.index ?? '')) {
    throw new Error('--index debe ser un entero mayor o igual que 0');
  }
  const index = Number(options.index);
  if (!Number.isSafeInteger(index)) {
    throw new Error('--index fuera de rango');
  }
  if (index === 0) {
    throw new Error('No se puede alterar el bloque génesis (índice 0)');
  }
  return { command, kind: 'block', email: allowed, index };
}

// Busca el único usuario de prueba. Filtra por email sin distinguir mayúsculas.
async function findTargetUser(driver, email) {
  const filter = { email: { $regex: `^${escapeRegex(email)}$`, $options: 'i' } };
  const docs = await driver.connection
    .collection('users')
    .find(filter, { projection: { _id: 1, name: 1 } })
    .limit(2)
    .toArray();
  if (docs.length === 0) throw new Error('No existe el usuario de prueba (TAMPER_ALLOWED_EMAIL)');
  if (docs.length > 1) throw new Error('Hay más de un usuario con TAMPER_ALLOWED_EMAIL; se requiere exactamente 1');
  return docs[0];
}

async function tamperUser(plan, ctx) {
  const { driver, fs, backupPath, now, log } = ctx;
  const user = await findTargetUser(driver, plan.email);
  if (typeof user.name !== 'string') throw new Error('El usuario de prueba no tiene name válido');

  const backup = {
    kind: 'user',
    target: String(user._id),
    field: 'name',
    original: user.name,
    savedAt: now().toISOString(),
  };
  await writeBackup(fs, backupPath, backup);

  const users = driver.connection.collection('users');
  const result = await users.updateOne({ _id: user._id }, { $set: { name: plan.value } });
  if (result?.matchedCount !== 1) {
    if (result?.matchedCount === 0) await fs.unlink(backupPath).catch(() => {});
    throw new Error(`Se esperaba modificar 1 documento y coincidieron ${result?.matchedCount ?? 0}`);
  }
  log(`Comando: user | tipo: usuario | _id: ${backup.target} | campo: name | nuevo valor: ${plan.value} | modificado`);
}

async function tamperBlock(plan, ctx) {
  const { driver, fs, backupPath, now, log } = ctx;
  const user = await findTargetUser(driver, plan.email);

  const blocks = driver.connection.collection('ledgerblocks');
  const found = await blocks.find({ index: plan.index }).limit(2).toArray();
  if (found.length !== 1) throw new Error(`No existe exactamente 1 bloque con índice ${plan.index}`);
  const block = found[0];

  if (block.data?.userId !== String(user._id)) {
    throw new Error('El bloque no pertenece al usuario de prueba (TAMPER_ALLOWED_EMAIL)');
  }
  if (typeof block.data.event !== 'string') throw new Error('El bloque no tiene data.event válido');

  const backup = {
    kind: 'block',
    target: plan.index,
    field: 'data.event',
    original: block.data.event,
    savedAt: now().toISOString(),
  };
  await writeBackup(fs, backupPath, backup);

  // Solo se toca data.event. El hash NO se recalcula: esa es la señal que detecta la verificación.
  const result = await blocks.updateOne({ index: plan.index }, { $set: { 'data.event': TAMPERED_EVENT } });
  if (result?.matchedCount !== 1) {
    if (result?.matchedCount === 0) await fs.unlink(backupPath).catch(() => {});
    throw new Error(`Se esperaba modificar 1 bloque y coincidieron ${result?.matchedCount ?? 0}`);
  }
  log(`Comando: block | tipo: bloque | índice: ${plan.index} | campo: data.event | modificado`);
}

async function restore(plan, ctx) {
  const { driver, fs, backupPath, log } = ctx;
  const { backup } = plan;

  let result;
  if (backup.kind === 'user') {
    const filter = { _id: new driver.Types.ObjectId(backup.target) };
    result = await driver.connection.collection('users').updateOne(filter, { $set: { name: backup.original } });
  } else {
    result = await driver.connection
      .collection('ledgerblocks')
      .updateOne({ index: backup.target }, { $set: { 'data.event': backup.original } });
  }
  if (result?.matchedCount !== 1) {
    // Se conserva la copia: sin restaurar no se debe borrar.
    throw new Error(`Se esperaba restaurar 1 documento y coincidieron ${result?.matchedCount ?? 0}`);
  }

  await fs.unlink(backupPath);
  const target = backup.kind === 'user' ? `_id: ${backup.target}` : `índice: ${backup.target}`;
  log(`Comando: restore | tipo: ${backup.kind === 'user' ? 'usuario' : 'bloque'} | ${target} | restaurado`);
}

function describePlan(plan, log) {
  if (plan.command === 'restore') {
    const target = plan.backup.kind === 'user' ? `_id: ${plan.backup.target}` : `índice: ${plan.backup.target}`;
    log(`Simulación: restore | tipo: ${plan.backup.kind} | ${target} | restauraría el valor original`);
  } else if (plan.kind === 'user') {
    log('Simulación: user | tipo: usuario de prueba | campo: name | modificaría 1 documento');
  } else {
    log(`Simulación: block | tipo: bloque | índice: ${plan.index} | campo: data.event | modificaría 1 documento`);
  }
  log('No se conectó a la base de datos ni se modificó nada. Para ejecutarlo de verdad añade --confirm.');
}

// Ejecuta el ataque de demostración y devuelve el código de salida (0 correcto, 1 error).
// `driver`, `fs`, `env`, `log`, `now` y `backupPath` se pueden inyectar en las pruebas.
export async function run({
  argv = process.argv.slice(2),
  env = process.env,
  driver = mongoose,
  now = () => new Date(),
  log = console.log,
  fs = fsp,
  backupPath = DEFAULT_BACKUP_PATH,
} = {}) {
  let parsed;
  let plan;
  try {
    parsed = parseArgs(argv);
    plan = await prepare(parsed.command, parsed.options, { env, fs, backupPath });
  } catch (err) {
    log(`Error: ${err.message}`);
    return EXIT_ERROR;
  }

  // Sin --confirm no se conecta ni se escribe nada.
  if (!parsed.options.confirm) {
    describePlan(plan, log);
    return EXIT_OK;
  }

  try {
    await connectDB(driver);
  } catch (err) {
    log(`Error: ${err.message}`);
    return EXIT_ERROR;
  }

  const ctx = { driver, fs, backupPath, now, log };
  try {
    if (plan.command === 'restore') await restore(plan, ctx);
    else if (plan.kind === 'user') await tamperUser(plan, ctx);
    else await tamperBlock(plan, ctx);
    return EXIT_OK;
  } catch (err) {
    log(`Error: ${err.message}`);
    return EXIT_ERROR;
  } finally {
    await disconnectDB(driver).catch((err) => log(`Aviso: ${err.message}`));
  }
}

// Solo se ejecuta si el archivo se lanza directamente (no al importarlo en pruebas).
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  run().then((code) => {
    process.exitCode = code;
  });
}

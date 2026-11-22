// verifyUsers.js - Verifica la cadena del ledger y su consistencia con la colección users
// en MongoDB Atlas. SOLO LECTURA.
//
// Uso: npm run ledger:verify-users
// Códigos de salida: 0 todo válido, 2 cadena corrupta o incidencias de consistencia,
// 1 error (p. ej. de conexión).
//
// Este script nunca crea, actualiza, borra ni sincroniza índices: solo lee.

import { pathToFileURL } from 'node:url';
import { connectDB, disconnectDB } from './connect.js';
import LedgerBlock from './LedgerBlock.js';
import { loadChain } from './ledgerService.js';
import { checkConsistency } from './consistency.js';
import { mongoUsersSource } from './usersSource.js';
import { verifyChain } from '../chain.js';

export const EXIT_VALID = 0;
export const EXIT_CORRUPT = 2;
export const EXIT_ERROR = 1;

// Ejecuta la verificación y devuelve el código de salida.
// `driver`, `model` y `usersSource` se pueden inyectar en las pruebas.
export async function run({
  driver,
  model = LedgerBlock,
  usersSource = mongoUsersSource(),
  log = console.log,
} = {}) {
  try {
    await connectDB(driver);
  } catch (err) {
    log(`Error: ${err.message}`);
    return EXIT_ERROR;
  }

  try {
    const chain = await loadChain(model);
    const chainResult = verifyChain(chain);
    const users = await usersSource.listUsers();
    const consistency = checkConsistency(chain, users);

    if (chainResult.valid) {
      log(`CADENA VÁLIDA (${chain.length} bloques)`);
    } else {
      log(`CADENA NO VÁLIDA: ${chainResult.errors.length} problema(s) encontrado(s)`);
      for (const { index, reason } of chainResult.errors) {
        log(`  - bloque ${index}: ${reason}`);
      }
    }

    if (consistency.ok) {
      log(`USUARIOS CONSISTENTES (${users.length} usuarios)`);
    } else {
      log(`INCONSISTENCIAS CON USERS: ${consistency.issues.length} problema(s) encontrado(s)`);
      for (const { userId, type, detail } of consistency.issues) {
        log(`  - usuario ${userId}: ${type} - ${detail}`);
      }
    }

    return chainResult.valid && consistency.ok ? EXIT_VALID : EXIT_CORRUPT;
  } catch (err) {
    log(`Error al verificar el ledger: ${err.name ?? 'Error'}: ${err.message}`);
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

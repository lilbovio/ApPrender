// verifyLedger.js - Verifica la cadena del ledger en MongoDB Atlas. SOLO LECTURA.
//
// Uso: npm run ledger:verify
// Códigos de salida: 0 cadena válida, 2 cadena corrupta, 1 error (p. ej. de conexión).
//
// Este script nunca crea, actualiza, borra ni sincroniza índices: solo lee bloques.

import { pathToFileURL } from 'node:url';
import { connectDB, disconnectDB } from './connect.js';
import LedgerBlock from './LedgerBlock.js';
import { loadChain } from './ledgerService.js';
import { verifyChain } from '../chain.js';

export const EXIT_VALID = 0;
export const EXIT_CORRUPT = 2;
export const EXIT_ERROR = 1;

// Ejecuta la verificación y devuelve el código de salida.
// `driver` y `model` se pueden inyectar en las pruebas.
export async function run({ driver, model = LedgerBlock, log = console.log } = {}) {
  try {
    await connectDB(driver);
  } catch (err) {
    log(`Error: ${err.message}`);
    return EXIT_ERROR;
  }

  try {
    const chain = await loadChain(model);
    const result = verifyChain(chain);

    if (result.valid) {
      log(`CADENA VÁLIDA (${chain.length} bloques)`);
      return EXIT_VALID;
    }

    log(`CADENA NO VÁLIDA: ${result.errors.length} problema(s) encontrado(s)`);
    for (const { index, reason } of result.errors) {
      log(`  - bloque ${index}: ${reason}`);
    }
    return EXIT_CORRUPT;
  } catch (err) {
    log(`Error al leer el ledger: ${err.name ?? 'Error'}: ${err.message}`);
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

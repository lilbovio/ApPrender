// init.js - Crea el bloque génesis del ledger en MongoDB Atlas.
//
// Uso:
//   npm run ledger:init              -> solo muestra qué haría (no conecta)
//   npm run ledger:init -- --confirm -> conecta, crea índices y el génesis si falta
//
// Escribe en Atlas (colección ledgerblocks), por eso exige --confirm explícito.

import { pathToFileURL } from 'node:url';
import { connectDB, disconnectDB, describeTarget } from './connect.js';
import LedgerBlock from './LedgerBlock.js';
import { ensureGenesis } from './ledgerService.js';

// Ejecuta la inicialización. Devuelve el código de salida (0 correcto, 1 error).
// `driver` y `model` se pueden inyectar en las pruebas.
export async function run({
  argv = process.argv.slice(2),
  driver,
  model = LedgerBlock,
  log = console.log,
} = {}) {
  if (!argv.includes('--confirm')) {
    log('Modo simulación: no se conecta a la base de datos ni escribe nada.');
    log('Haría: crear los índices únicos de ledgerblocks y el bloque génesis (índice 0) si no existe.');
    log('Para ejecutarlo de verdad: npm run ledger:init -- --confirm');
    return 0;
  }

  try {
    await connectDB(driver);
  } catch (err) {
    log(`Error: ${err.message}`);
    return 1;
  }

  try {
    // Primero los índices únicos: así el génesis no puede duplicarse aunque dos procesos corran a la vez.
    await model.syncIndexes();
    const genesis = await ensureGenesis(model);
    log(describeTarget(process.env.MONGO_URI));
    log(`Bloque génesis: índice ${genesis.index}, hash ${genesis.hash}`);
    return 0;
  } catch (err) {
    log(`Error al inicializar el ledger: ${err.name ?? 'Error'}: ${err.message}`);
    return 1;
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

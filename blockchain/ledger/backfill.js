// backfill.js - Agrega un bloque `user_registered` a cada usuario que aún no tenga ninguno.
//
// Uso:
//   npm run ledger:backfill              -> solo muestra qué haría (no conecta)
//   npm run ledger:backfill -- --confirm -> conecta y escribe los bloques que falten
//
// Escribe en Atlas (colección ledgerblocks), por eso exige --confirm explícito.
// Es idempotente: un usuario que ya tiene algún bloque se omite, así que una segunda
// ejecución no agrega nada.

import { pathToFileURL } from 'node:url';
import { connectDB, disconnectDB, describeTarget } from './connect.js';
import LedgerBlock from './LedgerBlock.js';
import { ensureGenesis, loadChain, recordUserEvent } from './ledgerService.js';
import { mongoUsersSource } from './usersSource.js';

export const EVENT_REGISTERED = 'user_registered';

// Devuelve el conjunto de userId que ya tienen algún bloque en la cadena.
function userIdsWithBlock(chain) {
  const ids = new Set();
  for (const block of chain) {
    const userId = block?.data?.userId;
    if (userId !== undefined && userId !== null) ids.add(String(userId));
  }
  return ids;
}

// Ejecuta el backfill y devuelve el código de salida (0 correcto, 1 error).
// `driver`, `model` y `usersSource` se pueden inyectar en las pruebas.
export async function run({
  argv = process.argv.slice(2),
  driver,
  model = LedgerBlock,
  usersSource = mongoUsersSource(),
  log = console.log,
} = {}) {
  if (!argv.includes('--confirm')) {
    log('Modo simulación: no se conecta a la base de datos ni escribe nada.');
    log(`Haría: crear el bloque génesis si falta y un bloque ${EVENT_REGISTERED} por cada usuario sin bloques.`);
    log('Para ejecutarlo de verdad: npm run ledger:backfill -- --confirm');
    const uri = process.env.MONGO_URI;
    log(uri ? `Destino: ${describeTarget(uri)}` : 'Destino: MONGO_URI no definida');
    return 0;
  }

  try {
    await connectDB(driver);
  } catch (err) {
    log(`Error: ${err.message}`);
    return 1;
  }

  try {
    await ensureGenesis(model);
    const users = await usersSource.listUsers();
    const withBlock = userIdsWithBlock(await loadChain(model));

    let added = 0;
    let skipped = 0;
    // Secuencial: cada recordUserEvent lee el último bloque antes de escribir.
    for (const user of users) {
      if (withBlock.has(String(user._id))) {
        skipped += 1;
        continue;
      }
      await recordUserEvent(EVENT_REGISTERED, user, model);
      added += 1;
    }

    log(`Usuarios encontrados: ${users.length}`);
    log(`Bloques agregados: ${added}`);
    log(`Omitidos (ya tenían bloque): ${skipped}`);
    return 0;
  } catch (err) {
    log(`Error en el backfill: ${err.name ?? 'Error'}: ${err.message}`);
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

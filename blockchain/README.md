# Blockchain de ApPrender (IH063 – Criptografía)

Este directorio contiene dos piezas relacionadas:

1. **Mini-blockchain CLI** (`chain.js`, `cli.js`, `store.js`): una base de datos encadenada
   con SHA-256 que modela un registro de eventos de solo-anexar.
2. **Ledger de usuarios en MongoDB Atlas** (`ledger/`): una cadena de hashes que registra los
   cambios de la colección `users` de ApPrender y permite detectar modificaciones hechas fuera
   de la aplicación.

## Requisitos

- **Mini-blockchain CLI**: solo Node.js 18+ (módulo `node:crypto`). No necesita dependencias.
- **Scripts del ledger**: `npm install` dentro de `blockchain/` (instala `mongoose`), Node.js
  20.6+ (por `--env-file`) y un archivo `server/.env` con `MONGO_URI`. Los scripts leen ese
  archivo con `node --env-file=../server/.env`. La URI nunca se imprime ni se commitea.

## Mini-blockchain CLI

Base de datos encadenada con SHA-256. Cada registro guarda el hash del anterior, así que
modificar cualquier registro pasado rompe la cadena y la verificación lo detecta.

### Estructura de un registro

| Campo       | Descripción                                           |
|-------------|-------------------------------------------------------|
| `index`     | Número de bloque (0 = génesis)                        |
| `timestamp` | Fecha/hora ISO-8601 UTC                               |
| `data`      | Datos (eventos de ApPrender: lección completada, etc.)|
| `prev_hash` | Hash del bloque anterior (64 ceros en el génesis)     |
| `hash`      | `SHA-256(index \| timestamp \| data \| prev_hash)`    |

`data` se serializa con claves ordenadas (`canonical()`), para que el hash sea determinista.

### Uso

```
cd blockchain
node cli.js add '{"user":"ana","event":"lesson_completed","xp":50}'   # agregar registro
node cli.js show                                                       # mostrar cadena
node cli.js verify                                                     # verificar (exit 0 válida, 2 corrupta)
node cli.js tamper 1 '{"user":"ana","xp":9999}'                        # simular ataque
node cli.js verify                                                     # detecta el bloque #1
node cli.js demo                                                       # demostración completa
node cli.js reset                                                      # reiniciar
```

Persistencia: `data/chain.json` (se crea al primer uso). También puedes editar ese archivo
a mano y ejecutar `verify` para probar la detección.

### Relación con ApPrender

La base de datos real (MongoDB/Mongoose) sobrescribe `Progress` en cada guardado y no
conserva historial, por lo que no se puede encadenar "en sitio". Este módulo modela un
**registro de eventos de solo-anexar** (p. ej. cada `completeLesson`) que podría
integrarse en `progressController.completeLesson`. Esa integración no está hecha; el
ledger de usuarios de la sección siguiente sí está integrado en el servidor.

## Ledger de usuarios en MongoDB Atlas

Ledger de solo-anexar guardado en la colección `ledgerblocks` del mismo cluster de Atlas que
la colección `users`. Cada bloque registra un evento de usuario (`user_registered`,
`profile_updated`, `password_changed`, `vak_set`) junto con el `userId` y una **huella**
SHA-256 calculada sobre los campos relevantes del usuario (`fingerprint.js`). Así no se guarda
ninguna contraseña en claro.

La verificación tiene dos niveles:

1. **Cadena**: se recalculan los hashes de todos los bloques y se comprueba que cada
   `prev_hash` apunte al bloque anterior.
2. **Consistencia con `users`**: para cada usuario se compara la huella del documento actual
   con la del último bloque de ese `userId`. Detecta usuarios modificados fuera de la
   aplicación, usuarios sin ningún bloque y bloques de usuarios que ya no existen.

### Scripts npm

Todos se ejecutan desde `blockchain/` (`npm run <script>`).

| Script | Qué hace | Escribe en Atlas | Salida / opciones |
|---|---|---|---|
| `ledger:init` | Crea los índices únicos de `ledgerblocks` y el bloque génesis si falta | Sí, solo con `--confirm` | Sin `--confirm` solo muestra lo que haría y no conecta |
| `ledger:verify` | Verifica la cadena de bloques | No (solo lectura) | Exit 0 cadena válida, 2 cadena corrupta, 1 error |
| `ledger:verify-users` | Verifica la cadena y su consistencia con `users` | No (solo lectura) | Exit 0 todo válido, 2 cadena corrupta o incidencias, 1 error |
| `ledger:backfill` | Agrega un bloque `user_registered` a cada usuario que no tenga ninguno (idempotente) | Sí, solo con `--confirm` | Sin `--confirm` solo muestra lo que haría y no conecta |
| `ledger:tamper` | Simula una modificación directa en la base de datos (demostración) | Sí, solo con `--confirm` | Requiere la variable `TAMPER_ALLOWED_EMAIL` (ver abajo) |

Los scripts que escriben funcionan en **modo simulación** si no se pasa `--confirm`: muestran
lo que harían y no abren conexión. Para ejecutarlos de verdad:

```
npm run ledger:init -- --confirm
npm run ledger:backfill -- --confirm
```

### Demostración de manipulación (`ledger:tamper`)

`TAMPER_ALLOWED_EMAIL` no está en `server/.env`. Se pasa en cada ejecución, y no debe guardarse
en ningún archivo ni commitearse. Ejemplos:

```
# Git Bash
TAMPER_ALLOWED_EMAIL=<email-de-prueba> npm run ledger:tamper -- user --email <email-de-prueba> --field name --value "Nombre alterado" --confirm

# PowerShell
$env:TAMPER_ALLOWED_EMAIL="<email-de-prueba>"; npm run ledger:tamper -- user --email <email-de-prueba> --field name --value "Nombre alterado" --confirm
```

`--email` debe coincidir con `TAMPER_ALLOWED_EMAIL` (sin distinguir mayúsculas). Solo se permite
actuar sobre el usuario de prueba. Tiene tres comandos:

```
npm run ledger:tamper -- user --email <email-de-prueba> --field name --value <nuevo> [--confirm]
npm run ledger:tamper -- block --index <n> [--confirm]
npm run ledger:tamper -- restore [--confirm]
```

- `user`: cambia `name` del usuario de prueba directamente en Mongo, sin pasar por la app.
  `--field` acepta **solo** `name`. Antes de escribir, guarda una copia de seguridad con el
  `name` original en `blockchain/data/tamper-backup.json` (ignorada por git).
- `block --index <n>`: cambia `data.event` del bloque de índice `n` al texto `tampered` y
  **no recalcula el hash**; esa diferencia es la que detecta la verificación. Solo funciona si el
  bloque pertenece al usuario de prueba (`data.userId`) y nunca con el génesis (índice 0). También
  guarda copia de seguridad antes de escribir.
- `restore`: devuelve el valor original de la copia de seguridad y borra la copia. No requiere
  `TAMPER_ALLOWED_EMAIL`. Si no restaura exactamente 1 documento, la copia se conserva.

Mientras exista una copia pendiente, `user` y `block` se niegan a ejecutarse: primero hay que
ejecutar `restore`.

Resultados esperados (según el código de `verifyUsers.js` y `consistency.js`):

- Tras `user`: la cadena sigue válida, pero `ledger:verify-users` reporta un `user_modified` para
  ese usuario y sale con código 2.
- Tras `block`: `ledger:verify-users` muestra `CADENA NO VÁLIDA` para ese bloque y sale con código 2.
- Tras `restore`: ambas verificaciones vuelven a ser válidas y salen con código 0.

## Integración con el servidor

`server/src/ledger/` contiene una copia del núcleo del ledger (`chain.js`, `fingerprint.js`,
`LedgerBlock.js`, `ledgerService.js`, `recordSafe.js`). La copia existe porque el despliegue en
Vercel tiene como raíz `server/` y no puede importar código de `blockchain/`.

Los controladores llaman a `recordUserEventSafe` con `await`:

- `authController.registerUser` → `user_registered`
- `userController.updateUserProfile` → `profile_updated` o `password_changed`
- `vakController.updateVakType` → `vak_set`

`recordUserEventSafe` nunca lanza ni rechaza: aplica un timeout de 3 segundos, devuelve
`true` o `false` y deja una línea de log sin datos personales. Si el ledger falla, la operación
del usuario se completa igual, pero no se crea el bloque. La llamada se espera (no es
fire-and-forget) porque en Vercel la función puede congelarse al enviar la respuesta.

La variable `LEDGER_DISABLED=true` desactiva los registros en el servidor.

`blockchain/ledger/parity.test.js` comprueba que `chain.js` y `fingerprint.js` producen las
mismas salidas en ambas copias. Si cambia uno de esos archivos en una copia, hay que cambiar
también la otra.

## Archivos

### `blockchain/`

- `chain.js` – hash, creación de bloques, verificación (núcleo)
- `store.js` – lectura/escritura del JSON
- `cli.js` – interfaz de comandos y demo
- `chain.test.js` – pruebas (alteración, eliminación, re-hash, orden de claves)
- `PLAN.md` – plan de diseño del ledger de usuarios
- `WORKFLOW.md` – flujo de trabajo con agentes

### `blockchain/ledger/`

- `connect.js` – conexión a Atlas desde `MONGO_URI`; no imprime la URI ni la incluye en errores
- `LedgerBlock.js` – modelo Mongoose de la colección `ledgerblocks`
- `fingerprint.js` – huella SHA-256 de los campos de un usuario
- `ledgerService.js` – génesis (`ensureGenesis`), registro de eventos (`recordUserEvent`) y carga de la cadena (`loadChain`)
- `consistency.js` – cruza la cadena con los usuarios (`checkConsistency`)
- `usersSource.js` – lectura de la colección `users` (solo lectura)
- `init.js` – script `ledger:init`
- `verifyLedger.js` – script `ledger:verify`
- `verifyUsers.js` – script `ledger:verify-users`
- `backfill.js` – script `ledger:backfill`
- `tamper.js` – script `ledger:tamper` (demostración de ataque)
- `*.test.js` – pruebas de cada módulo, incluida `parity.test.js`

### `server/src/ledger/`

- Copia del núcleo (`chain.js`, `fingerprint.js`, `LedgerBlock.js`, `ledgerService.js`) y el
  wrapper `recordSafe.js` usado por los controladores, con sus pruebas.

## Pruebas

- `npm test` en `blockchain/` (ejecuta `node --test`): pruebas de la mini-blockchain y del
  ledger. Las pruebas del ledger usan drivers y modelos falsos inyectados.
- `npm run test:ledger` en `server/`: pruebas de `src/ledger/` (`node --test src/ledger/*.test.js`).

## Documentación relacionada

- [`PLAN.md`](./PLAN.md): diseño, modelos, verificación en dos niveles y fases del ledger de usuarios.
- [`WORKFLOW.md`](./WORKFLOW.md): flujo de trabajo con agentes (roles, ramas y revisión).
- [`INFORME.md`](./INFORME.md): informe técnico del proyecto, con resultados de la demostración contra Atlas.

## Limitaciones (para el informe)

No es una blockchain completa: sin consenso, sin minería/prueba de trabajo, sin red P2P,
un solo nodo. Quien controla el archivo puede recalcular **toda** la cadena tras alterar un
bloque y la verificación local no lo notaría; solo se detecta si se conoce de antemano el
hash final (ancla) guardado en otro lugar.

En el ledger de usuarios, el sistema **detecta** la manipulación pero no la impide. Quien
controle a la vez la base de datos y el ledger puede recalcular la cadena. Los cambios hechos
directamente en la base de datos no generan bloque, y solo se ven cuando se ejecuta
`ledger:verify-users`. El registro en el servidor es de mejor esfuerzo: si falla, el usuario
queda sin bloque y la verificación lo reportará.

## Mejoras posibles

Firma digital de cada bloque (Ed25519/ECDSA), anclar el último hash en un sitio externo
(también para la cadena de usuarios), múltiples nodos con consenso, prueba de trabajo, árbol
de Merkle, y llevar el CLI de la mini-blockchain a MongoDB (el ledger de usuarios ya usa Atlas).

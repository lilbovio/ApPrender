# Base de datos encadenada con hash: ledger de usuarios de ApPrender

**Curso:** IH063 Criptografía · **Proyecto final:** base de datos encadenada con hash (mini-blockchain)
**Aplicación:** ApPrender (plataforma educativa: cliente React en Vercel, API Express en Vercel, MongoDB Atlas)

---

## 1. Introducción

Una **función hash criptográfica** transforma un mensaje de cualquier longitud en un resumen
de longitud fija. Para usarse en seguridad debe ser:

- **determinista**: el mismo mensaje siempre da el mismo resumen;
- **resistente a preimagen**: dado un resumen, no es factible encontrar un mensaje que lo produzca;
- **resistente a colisiones**: no es factible encontrar dos mensajes distintos con el mismo resumen;
- con **efecto avalancha**: cambiar un solo bit del mensaje cambia, en promedio, la mitad de
  los bits del resumen.

**SHA-256** (familia SHA-2, NIST FIPS 180-4) produce resúmenes de 256 bits, que aquí se
representan como 64 caracteres hexadecimales. En el proyecto se usa la implementación de
Node.js (`node:crypto`, `createHash('sha256')`); no se implementó el algoritmo a mano.

La **idea de blockchain** que se simula es la de una lista de registros (bloques) en la que
cada bloque guarda el hash del bloque anterior. Como el hash de un bloque depende de todo su
contenido, alterar un registro pasado cambia su hash recalculado; y como el bloque siguiente
guarda el hash original, la alteración queda en evidencia. El proyecto **no** implementa
consenso, minería ni red P2P (ver sección 6): es una base de datos de solo-anexar cuya
integridad se puede verificar.

El proyecto tiene dos partes:

1. Una **mini-blockchain didáctica** por línea de comandos, con persistencia en un archivo JSON.
2. Una aplicación real: un **ledger de auditoría de la colección `users`** de ApPrender,
   guardado en MongoDB Atlas, que el servidor alimenta automáticamente y que un verificador
   compara con el estado real de los usuarios para detectar modificaciones hechas por fuera de
   la aplicación.

## 2. Estructura de datos y lógica de encadenamiento

### 2.1 El bloque

Cada bloque es un objeto con cinco campos (`blockchain/chain.js`):

| Campo       | Tipo                 | Descripción |
|-------------|----------------------|-------------|
| `index`     | número entero        | posición en la cadena; `0` es el bloque génesis |
| `timestamp` | texto ISO-8601 UTC   | p. ej. `2026-11-21T08:00:00.000Z`; se guarda como texto para que el hash sea reproducible |
| `data`      | objeto               | contenido del registro |
| `prev_hash` | 64 hex               | hash del bloque anterior (64 ceros en el génesis) |
| `hash`      | 64 hex               | hash de este bloque |

El hash se calcula así (`computeHash`):

```
hash = SHA-256( index + "|" + timestamp + "|" + canonical(data) + "|" + prev_hash )
```

El separador `|` evita que dos combinaciones distintas de campos produzcan el mismo texto
(por ejemplo, `index=1, timestamp="2..."` frente a `index=12, timestamp="..."`). Como
`index`, `timestamp` y `prev_hash` tienen formatos fijos sin `|`, el texto es inequívoco.

### 2.2 Serialización canónica

`JSON.stringify` respeta el orden de inserción de las claves, así que `{a:1,b:2}` y
`{b:2,a:1}` darían textos (y hashes) distintos aunque representen el mismo dato. Además, al
guardar y releer de MongoDB el orden de las claves no está garantizado. Por eso `canonical()`
serializa de forma determinista: recorre el valor de forma recursiva, **ordena
alfabéticamente las claves** de cada objeto, conserva el orden de los arreglos y usa
`JSON.stringify` para los valores primitivos (lo que escapa comillas y caracteres especiales).
Así, el mismo contenido siempre produce el mismo hash.

### 2.3 Bloque génesis y encadenamiento

- `createGenesis()` crea el bloque 0 con `data = { message: "Bloque génesis de ApPrender" }`
  y `prev_hash` = 64 ceros.
- `appendBlock()` / `createBlock()` crean el bloque `n+1` con `prev_hash` = `hash` del bloque `n`.

### 2.4 Verificación (`verifyChain`)

Recorre todos los bloques y, para cada bloque `i`, comprueba:

1. que tenga los cinco campos;
2. que `index === i` (detecta bloques eliminados o reordenados en medio de la cadena);
3. que `computeHash(bloque) === bloque.hash` (detecta contenido alterado);
4. que `prev_hash` sea el hash del bloque `i-1` (o 64 ceros si `i = 0`) (detecta cadena rota).

No se detiene en el primer error: devuelve **todos** los problemas con su índice y motivo.
Si un atacante modifica solo `data` de un bloque, falla la comprobación 3 en ese bloque. Si
además recalcula su hash, falla la comprobación 4 en el bloque siguiente. Para pasar la
verificación tendría que recalcular **todos** los bloques posteriores (ver limitaciones).

### 2.5 El ledger de eventos de usuario

En la aplicación real no se encadenan los documentos de `users` en sitio: son mutables y el
servidor los sobrescribe. En su lugar se registra un **evento** por cada cambio legítimo. El
campo `data` de cada bloque del ledger es:

```
{ event: "user_registered" | "profile_updated" | "vak_set" | "password_changed" | "user_deleted",
  userId: "<id del usuario como texto>",
  fingerprint: SHA-256( canonical({ name, email, avatar, vakType, passwordHash }) ) }
```

- La **huella** (`userFingerprint`, `blockchain/ledger/fingerprint.js`) resume el estado del
  usuario después del cambio. `avatar` ausente se normaliza a `""` y `vakType` ausente a `null`,
  los mismos valores por defecto del modelo `User`.
- `passwordHash` es el **hash bcrypt ya almacenado** en la base de datos, nunca la contraseña en
  claro. Así, un cambio directo de la contraseña en la base (por ejemplo, reemplazar el hash
  bcrypt por otro conocido por el atacante) también cambia la huella.
- El bloque no guarda nombre, email ni hash de contraseña, solo la huella. Como la huella
  incluye el hash bcrypt (que contiene una sal aleatoria), no es práctico adivinar los datos a
  partir de ella.
- El evento `user_deleted` está definido en el modelo de datos y el verificador lo entiende,
  pero hoy la aplicación no tiene una ruta para borrar usuarios, por lo que ningún código lo emite.

## 3. Arquitectura

### 3.1 Mini-blockchain por línea de comandos (`blockchain/`)

- `chain.js`: núcleo (hash, bloques, verificación). Sin dependencias externas.
- `store.js`: persistencia en `blockchain/data/chain.json`; si el archivo no existe, crea la
  cadena con el bloque génesis.
- `cli.js`: comandos `add`, `show`, `verify` (código de salida 0 válida, 2 corrupta), `tamper`
  (edita un bloque **sin** recalcular el hash, para simular un ataque), `demo` y `reset`.

### 3.2 Ledger de usuarios en MongoDB Atlas

- **Modelo `LedgerBlock`** (colección `ledgerblocks`, mismo cluster que `users`): los cinco
  campos del bloque, con **índice único en `index`** y en `hash`, y sin las marcas de tiempo
  automáticas de Mongoose (el `timestamp` forma parte del hash).
- **`ledgerService.js`**: `ensureGenesis()` (crea el génesis si falta, de forma idempotente),
  `recordUserEvent(event, user)` (lee el último bloque, crea el siguiente y lo inserta) y
  `loadChain()`. Si dos escrituras concurrentes intentan el mismo `index`, el índice único hace
  fallar a una de ellas (error de clave duplicada 11000) y esa escritura se **reintenta** hasta
  3 veces con el nuevo último bloque. Así se evita que la cadena se bifurque.
- **Scripts** (`npm run ledger:*`, leen `MONGO_URI` del entorno y nunca la imprimen):
  `ledger:init` (génesis), `ledger:backfill`, `ledger:verify`, `ledger:verify-users` y
  `ledger:tamper` (demo de ataque). Los que escriben exigen `--confirm`; sin él solo describen
  lo que harían.

### 3.3 Integración con el servidor (`server/src/ledger/`)

Vercel despliega solo la carpeta `server/`, así que el servidor tiene una copia de `chain.js`,
`fingerprint.js`, `ledgerService.js` y `LedgerBlock.js`. Una prueba de paridad
(`blockchain/ledger/parity.test.js`) comprueba que ambas copias producen exactamente los mismos
hashes y huellas.

Los controladores llaman a `recordUserEventSafe(evento, usuario)` **después** de guardar el
usuario:

| Controlador | Acción | Evento |
|---|---|---|
| `authController.registerUser` | registro | `user_registered` |
| `userController.updateUserProfile` | edición de perfil | `profile_updated`, o `password_changed` si se envió contraseña |
| `vakController.updateVakType` | resultado del test VAK | `vak_set` |

`recordUserEventSafe` (`server/src/ledger/recordSafe.js`):

- **nunca lanza**: si el ledger falla, devuelve `false` y escribe una línea de log sin datos
  personales (solo evento, tipo de error y `userId`); la operación del usuario continúa;
- se **espera con `await`** dentro del controlador, porque en Vercel la función puede congelarse
  al enviar la respuesta y una escritura en segundo plano se perdería;
- tiene un **límite de 3 s** (`Promise.race` con un temporizador), para no bloquear el registro
  ni el perfil si Atlas tarda;
- se puede desactivar con la variable de entorno `LEDGER_DISABLED=true`.

### 3.4 Verificación en dos niveles (`ledger:verify-users`)

`verifyUsers.js` es de **solo lectura**:

1. **Integridad de la cadena**: carga todos los bloques ordenados por `index` y aplica
   `verifyChain`.
2. **Consistencia con `users`** (`checkConsistency`, función pura): para cada usuario toma el
   **último** bloque que lo menciona y compara la huella del documento actual con la guardada.
   Reporta:
   - `user_modified`: la huella no coincide (el usuario cambió sin pasar por la aplicación);
   - `user_without_block`: el usuario existe pero no tiene ningún bloque;
   - `block_without_user`: hay bloques de un usuario que ya no existe y su último evento no es
     `user_deleted`;
   - `user_resurrected`: el último evento es `user_deleted` pero el usuario sigue existiendo.

Los usuarios se leen con el driver nativo (sin el modelo `User` ni sus hooks de bcrypt) y nunca
se imprimen emails ni hashes. Código de salida: 0 todo válido, 2 cadena corrupta o
inconsistencias, 1 error de conexión o lectura.

### 3.5 Backfill

Los usuarios creados antes de activar el ledger no tienen bloque. `ledger:backfill -- --confirm`
agrega, de forma secuencial, un bloque `user_registered` por cada usuario que todavía no tenga
ninguno. Es idempotente: una segunda ejecución no agrega nada.

## 4. Demostración y resultados

### 4.1 Mini-blockchain por línea de comandos

Ejecutar desde la carpeta `blockchain/`. En PowerShell las comillas dentro de JSON se pierden al
pasar argumentos a Node; para las capturas es más simple usar texto plano (se guarda como
`{"message": ...}`) o ejecutar los comandos desde Git Bash.

> [CAPTURA 1: reinicio y registros agregados]
> `node cli.js reset`
> `node cli.js add "Ana completo la leccion Sumas"`
> `node cli.js add "Luis obtuvo la insignia Primera leccion"`

> [CAPTURA 2: cadena completa con index, timestamp, data, prev_hash y hash]
> `node cli.js show`
> (se ve que el `prev_hash` de cada bloque es el `hash` del anterior)

> [CAPTURA 3: verificación correcta]
> `node cli.js verify`  → `✔ CADENA VÁLIDA (3 bloques verificados)`

> [CAPTURA 4: ataque y detección]
> `node cli.js tamper 1 "Ana completo 100 lecciones"`
> `node cli.js verify`  → `✘ CADENA CORRUPTA`, con el bloque #1: "El contenido fue alterado: el
> hash recalculado no coincide con el almacenado"

> [CAPTURA 5 (opcional): demostración automática]
> `node cli.js demo` (crea la cadena, la verifica, cambia el `xp` del bloque #1 a 9999 y la
> vuelve a verificar)

### 4.2 Ledger de usuarios en Atlas (resultados obtenidos)

La demostración se hizo sobre un **usuario de prueba** creado para ese fin (nunca una cuenta
real). `ledger:tamper` solo actúa sobre el usuario indicado en `TAMPER_ALLOWED_EMAIL`, exige
`--confirm`, guarda una copia de seguridad antes de modificar y permite deshacer con `restore`.

| Paso | Acción | Resultado de `ledger:verify-users` |
|---|---|---|
| 1 | Estado inicial | Cadena válida (3 bloques); 1 usuario consistente; código 0 |
| 2 | Edición directa del `name` del usuario de prueba en Atlas | Cadena **válida**, pero `user_modified` para ese usuario; código 2 |
| 3 | Restauración del nombre | Cadena válida y usuarios consistentes |
| 4 | Edición directa de `data.event` del bloque 1 sin recalcular el hash | `CADENA NO VÁLIDA: bloque 1: El contenido fue alterado: el hash recalculado no coincide con el almacenado`; código 2 |
| 5 | Restauración del bloque | Cadena válida y usuarios consistentes; código 0 |

El paso 2 muestra el segundo nivel de verificación: la cadena por sí sola sigue íntegra (nadie
tocó el ledger), pero el usuario ya no coincide con su último evento registrado. El paso 4
muestra el primer nivel: un bloque alterado se detecta aunque los usuarios no hayan cambiado.

Además, se probó la aplicación en producción (navegador → API en Vercel → Atlas): al registrar
un usuario de prueba y completar el test VAK, el ledger registró automáticamente un bloque
`user_registered` y luego uno `vak_set` para ese usuario.

Capturas a incluir (ocultar o recortar los `userId` y cualquier dato personal):

> [CAPTURA 6: estado inicial válido]
> `npm run ledger:verify-users`  → `CADENA VÁLIDA (3 bloques)` y `USUARIOS CONSISTENTES (1 usuarios)`

> [CAPTURA 7: ataque al usuario y detección]
> `npm run ledger:tamper -- user --email <email de prueba> --field name --value "Nombre alterado" --confirm`
> `npm run ledger:verify-users`  → `INCONSISTENCIAS CON USERS: 1 problema(s)` con `user_modified`
> `npm run ledger:tamper -- restore --confirm`

> [CAPTURA 8: ataque a un bloque y detección]
> `npm run ledger:tamper -- block --index 1 --confirm`
> `npm run ledger:verify-users`  → `CADENA NO VÁLIDA ... bloque 1: El contenido fue alterado ...`
> `npm run ledger:tamper -- restore --confirm`

> [CAPTURA 9: estado restaurado]
> `npm run ledger:verify-users`  → cadena válida y usuarios consistentes

> [CAPTURA 10: bloques creados por la aplicación]
> Colección `ledgerblocks` en Atlas (Data Explorer) mostrando los bloques `user_registered` y
> `vak_set` del usuario de prueba, con `prev_hash` igual al `hash` del bloque anterior.

## 5. Pruebas automáticas

Todas las pruebas usan modelos y conexiones falsas en memoria: no se conectan a Atlas.

| Conjunto | Comando | Pruebas | Resultado |
|---|---|---|---|
| Mini-blockchain y scripts del ledger | `npm test` en `blockchain/` | 125 | 125 correctas |
| Ganchos del servidor | `npm run test:ledger` en `server/` | 11 | 11 correctas |

Distribución en `blockchain/`: `chain.test.js` 7, `connect` 21, `tamper` 26, `consistency` 13,
`fingerprint` 10, `ledgerService` 9, `backfill` 7, `parity` 7, `LedgerBlock` 6, `init` 6,
`verifyUsers` 6, `verifyLedger` 4, `usersSource` 3. En `server/`: `recordSafe` 7 y
`ledgerService` 4.

Casos cubiertos, entre otros: alteración de datos, eliminación de un bloque intermedio, cadena
recalculada por completo, independencia del orden de las claves, reintento ante índice
duplicado, cada tipo de inconsistencia con `users`, paridad de hashes entre las copias del
servidor y de `blockchain/`, que ningún log contenga emails, hashes de contraseña ni huellas, y
que `recordUserEventSafe` no lance ante errores, tiempos de espera ni `LEDGER_DISABLED`.

> [CAPTURA 11: salida de `npm test` en `blockchain/` con 125 pruebas correctas]

## 6. Limitaciones

- **No es una blockchain completa.** No hay consenso, minería ni prueba de trabajo, ni red P2P:
  hay un único nodo y un único dominio de confianza (el mismo cluster de Atlas guarda los
  usuarios y el ledger).
- **Quien controla la base de datos puede reescribir la historia.** El hash no usa ninguna clave
  secreta. Un atacante con permisos de escritura sobre `users` y `ledgerblocks` puede recalcular
  toda la cadena o, más simple aún, modificar un usuario y **agregar un bloque nuevo y válido**
  con la huella nueva; la verificación no lo notaría. Tampoco se detecta, a nivel de cadena, que
  se eliminen los **últimos** bloques (la cadena truncada sigue siendo válida); en la práctica la
  consistencia con `users` suele delatarlo, porque el usuario deja de coincidir con su bloque
  anterior. La mitigación es **anclar** el hash del último bloque fuera de la base de datos
  (otro sistema, un correo, un repositorio, una blockchain pública) o firmar los bloques con una
  clave que no esté en la base.
- **Detecta, no impide.** El ledger no bloquea la modificación; solo la deja en evidencia cuando
  se ejecuta el verificador.
- **Solo se registran los cambios hechos por los tres controladores.** Cualquier escritura que no
  pase por ellos (consola de Atlas, scripts, otro código futuro) no genera bloque; eso es
  precisamente lo que el verificador reporta como `user_modified`. Tampoco hay hoy un gancho
  para el borrado de usuarios.
- **Falsos positivos posibles.** Como el registro en el ledger no es atómico con el guardado del
  usuario, si el ledger falla o supera los 3 s (o está `LEDGER_DISABLED`), el cambio legítimo
  queda sin bloque y luego aparece como `user_modified` (o `user_without_block` en un registro).
  Dos actualizaciones casi simultáneas del mismo usuario podrían, en teoría, registrarse en orden
  inverso y producir el mismo efecto. Estos casos se deben revisar a mano.
- **La huella depende del hash de contraseña guardado.** Si en el futuro se vuelve a calcular el
  hash bcrypt (por ejemplo, al cambiar el costo o el algoritmo), todas las huellas dejarían de
  coincidir aunque la contraseña sea la misma.

## 7. Posibles mejoras

- **Firmas digitales (Ed25519)** o un HMAC en cada bloque, con la clave privada fuera de la base
  de datos (por ejemplo, en las variables de entorno del servidor): un atacante que solo controle
  la base ya no podría crear bloques válidos.
- **Ancla externa** del hash del último bloque, publicada periódicamente en otro sistema, para
  detectar una reescritura completa o un truncamiento.
- **Árbol de Merkle** sobre los eventos, para probar que un evento pertenece a la cadena sin
  revisar todos los bloques.
- **Varios nodos con consenso**, cada uno con su copia, de modo que alterar uno solo no baste.
- **Cadenas por usuario** (cada evento enlaza también con el evento anterior del mismo usuario),
  para verificar a un usuario sin recorrer toda la cadena.
- **Gancho para el borrado** (`user_deleted`) cuando exista una ruta de eliminación de usuarios,
  y una herramienta de reconciliación que, tras revisión manual, registre de nuevo a usuarios
  marcados como falsos positivos.

## 8. Uso de herramientas de IA

El desarrollo fue asistido por IA (Claude, de Anthropic) con un flujo de agentes descrito en
`blockchain/WORKFLOW.md`: un agente Haiku escribió el código y las pruebas en ramas separadas, un
agente Sonnet revisó cada pull request antes del merge, y un agente Opus hizo la revisión final y
la redacción de este informe. Las decisiones de diseño (ledger de eventos en lugar de encadenar
`users`, huella con el hash bcrypt, verificación en dos niveles) y todas las escrituras sobre
Atlas fueron confirmadas por el estudiante. El estudiante es responsable del código y debe poder
explicarlo en la revisión oral.

### Puntos clave para la revisión oral

- **`computeHash`** (`chain.js`): concatena `index|timestamp|canonical(data)|prev_hash` y le
  aplica SHA-256; es lo que une cada bloque con su contenido y con el anterior.
- **`canonical`** (`chain.js`): serializa con claves ordenadas para que el mismo dato produzca
  siempre el mismo hash, aunque MongoDB devuelva las claves en otro orden.
- **`verifyChain`** (`chain.js`): para cada bloque comprueba campos, índice, hash recalculado y
  `prev_hash`, y devuelve todos los errores encontrados.
- **`userFingerprint`** (`ledger/fingerprint.js`): SHA-256 de los campos del usuario, incluido el
  hash bcrypt guardado (nunca la contraseña en claro), para resumir su estado en un bloque.
- **`checkConsistency`** (`ledger/consistency.js`): compara la huella actual de cada usuario con la
  de su último bloque y reporta modificaciones, usuarios sin bloque y bloques huérfanos.
- **`recordUserEventSafe`** (`server/src/ledger/recordSafe.js`): registra el evento desde el
  servidor con `await` y un límite de 3 s, sin lanzar nunca, para que un fallo del ledger no
  rompa el registro ni el perfil.

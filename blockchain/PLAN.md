# Plan: Hash de la tabla de usuarios (ledger de auditoría en MongoDB Atlas)

## Objetivo
Proteger la colección `users` de ApPrender con una cadena de hashes SHA-256 almacenada en
el **mismo cluster de MongoDB Atlas**, de modo que cualquier modificación directa a un
usuario quede en evidencia. El esquema de `User` no cambia; la cadena vive en una colección
nueva.

## Contexto
- El cluster Atlas actual no tiene datos de la cadena: los modelos nuevos se crean desde
  cero (Mongoose crea las colecciones en el primer uso).
- Las pruebas se hacen directamente contra Atlas (decisión del usuario).
- Credenciales: `MONGO_URI` se lee de `server/.env`; nunca se imprime ni se commitea.

## Opción elegida: ledger de eventos de solo-anexar sobre `users`
No se encadenan los documentos de `users` en sitio (son mutables, no tienen orden estable
y el hook `pre('save')` de bcrypt interferiría). Se crea una cadena aparte donde cada
bloque registra un evento de usuario, y la verificación compara esa cadena con el estado
real de `users`.

## Modelos nuevos (Mongoose)

### `LedgerBlock` (colección `ledgerblocks`)
| Campo | Tipo | Notas |
|---|---|---|
| `index` | Number, único, requerido | 0 = génesis |
| `timestamp` | String ISO-8601 UTC | se guarda como texto para que el hash sea reproducible |
| `data` | Object | evento (ver abajo) |
| `prev_hash` | String(64) | |
| `hash` | String(64), único | `SHA-256(index \| timestamp \| data \| prev_hash)` |

- Índice único en `index` para evitar bifurcaciones por escrituras concurrentes
  (un segundo bloque con el mismo índice falla y se reintenta).
- `timestamps: false`: el timestamp forma parte del hash y no debe lo gestionar Mongoose.
- Un modelo `LedgerMeta` no es necesario; el último bloque se obtiene ordenando por `index`.

### `data` de un evento
```
{ event: "user_registered" | "profile_updated" | "vak_set" | "password_changed" | "user_deleted",
  userId: "<ObjectId como string>",
  fingerprint: SHA-256(canonical({ name, email, avatar, vakType, passwordHash })) }
```
- `passwordHash` es el hash bcrypt ya almacenado; nunca la contraseña en claro.
- `user_deleted` agrega un bloque; los anteriores permanecen.

## Estructura de archivos
```
blockchain/
  chain.js            (existente) hash, bloques, verifyChain
  ledger/
    LedgerBlock.js    modelo Mongoose
    fingerprint.js    userFingerprint(user)
    ledgerService.js  recordUserEvent(event, user), loadChain()
    verifyUsers.js    CLI de verificación (solo lectura sobre users)
    tamper.js         CLI de ataque de demostración
```
Las funciones de hash se reutilizan de `chain.js`; no se duplican.

## Verificación (dos niveles)
1. **Cadena**: cargar todos los `LedgerBlock` ordenados por `index`, recalcular hashes y
   comprobar `prev_hash` (`verifyChain`).
2. **Consistencia con `users`**: para cada usuario, calcular el `fingerprint` del documento
   actual y compararlo con el del último bloque de ese `userId`. Reportar:
   - usuario modificado fuera de la app (fingerprint distinto),
   - usuario existente sin ningún bloque,
   - bloque de un usuario que ya no existe y no tiene `user_deleted`.

`verifyUsers.js` es de **solo lectura**.

## Integración con el servidor
Necesaria para que la cadena se llene sola con el uso real:
- `authController.registerUser` → `user_registered`
- `userController.updateUserProfile` → `profile_updated` / `password_changed`
- `vakController.updateVakType` → `vak_set`

Reglas de seguridad de la integración:
- Si el ledger falla, la operación del usuario **no** debe fallar (try/catch + log), para no
  romper login/registro en producción (Vercel).
- Usuarios que ya existen en Atlas antes de activar el ledger: un script de **backfill**
  (`backfill.js`) agrega un bloque `user_registered` por cada uno, una sola vez.
- Cambios directos a la BD (sin pasar por la app) no generan bloque; eso es justo lo que
  la verificación detecta.

## Fases
1. Modelo `LedgerBlock` + `fingerprint.js` + `ledgerService.js` (con pruebas unitarias del
   fingerprint, sin tocar Atlas).
2. Conexión a Atlas desde los scripts del ledger (reutiliza `MONGO_URI`); crear el bloque
   génesis en la primera ejecución.
3. `backfill.js` para los usuarios existentes.
4. `verifyUsers.js` y comprobación en estado limpio (debe dar válido).
5. Integración en los tres controladores.
6. Demostración de ataque contra Atlas: `tamper.js` modifica un usuario **de prueba**
   directamente en MongoDB y `verifyUsers.js` lo detecta; luego se restaura. También
   alterar un `LedgerBlock` y detectar la cadena rota.
7. Entregables: README, capturas, informe PDF de 4–6 páginas.

## Precauciones al probar en la BD real
- La demo de ataque usa un usuario de prueba creado para ese fin, nunca una cuenta real.
- Confirmar con el usuario antes de cualquier escritura o modificación sobre `users`.
- Los scripts de verificación no escriben; solo backfill, la integración y `tamper.js`
  escriben, y `tamper.js` requiere un flag explícito (`--confirm`).
- No imprimir `MONGO_URI`, hashes de contraseña ni datos personales en logs o capturas del
  informe (usar datos de prueba para las capturas).
- Atlas: verificar que la IP de la máquina esté en la lista de acceso de red.

## Limitaciones (para el informe)
- Detecta manipulación, no la impide.
- Quien controle la BD y el ledger puede recalcular toda la cadena; se mitiga con un ancla
  externa del último hash o firma digital.
- Sin consenso, minería ni P2P: no es una blockchain completa.
- Escrituras concurrentes se manejan con índice único y reintento, no con consenso.

## Mejoras futuras
Firma digital de bloques (Ed25519), ancla externa del hash final, árbol de Merkle,
varios nodos con consenso.

## Riesgos de seguridad ya detectados en el proyecto
- Contraseña de Atlas en texto plano en `server/.env` (rotar si se compartió).
- Secreto JWT con fallback `secret123`.
- El cambio de contraseña no exige la actual.

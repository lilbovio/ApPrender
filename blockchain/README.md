# Mini-blockchain de ApPrender (IH063 – Criptografía)

Base de datos encadenada con SHA-256. Cada registro guarda el hash del anterior, así que
modificar cualquier registro pasado rompe la cadena y la verificación lo detecta.

Sin dependencias: solo Node.js 18+ (módulo `node:crypto`).

## Estructura de un registro

| Campo       | Descripción                                           |
|-------------|-------------------------------------------------------|
| `index`     | Número de bloque (0 = génesis)                        |
| `timestamp` | Fecha/hora ISO-8601 UTC                               |
| `data`      | Datos (eventos de ApPrender: lección completada, etc.)|
| `prev_hash` | Hash del bloque anterior (64 ceros en el génesis)     |
| `hash`      | `SHA-256(index \| timestamp \| data \| prev_hash)`    |

`data` se serializa con claves ordenadas (`canonical()`), para que el hash sea determinista.

## Uso

```
cd blockchain
node cli.js add '{"user":"ana","event":"lesson_completed","xp":50}'   # agregar registro
node cli.js show                                                       # mostrar cadena
node cli.js verify                                                     # verificar (exit 0 válida, 2 corrupta)
node cli.js tamper 1 '{"user":"ana","xp":9999}'                        # simular ataque
node cli.js verify                                                     # detecta el bloque #1
node cli.js demo                                                       # demostración completa
node cli.js reset                                                      # reiniciar
npm test                                                               # pruebas automáticas
```

Persistencia: `data/chain.json` (se crea al primer uso). También puedes editar ese archivo
a mano y ejecutar `verify` para probar la detección.

## Archivos

- `chain.js` – hash, creación de bloques, verificación (núcleo)
- `store.js` – lectura/escritura del JSON
- `cli.js` – interfaz de comandos y demo
- `chain.test.js` – pruebas (alteración, eliminación, re-hash, orden de claves)

## Relación con ApPrender

La base de datos real (MongoDB/Mongoose) sobrescribe `Progress` en cada guardado y no
conserva historial, por lo que no se puede encadenar "en sitio". Este módulo modela un
**registro de eventos de solo-anexar** (p. ej. cada `completeLesson`) que podría
integrarse en `progressController.completeLesson`.

## Limitaciones (para el informe)

No es una blockchain completa: sin consenso, sin minería/prueba de trabajo, sin red P2P,
un solo nodo. Quien controla el archivo puede recalcular **toda** la cadena tras alterar un
bloque y la verificación local no lo notaría; solo se detecta si se conoce de antemano el
hash final (ancla) guardado en otro lugar.

## Mejoras posibles

Firma digital de cada bloque (Ed25519/ECDSA), anclar el último hash en un sitio externo,
múltiples nodos con consenso, prueba de trabajo, árbol de Merkle, integración con MongoDB.

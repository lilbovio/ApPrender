// cli.js - Interfaz de línea de comandos de la mini-blockchain
//
// Uso:  node cli.js <comando> [argumentos]
import { existsSync, unlinkSync } from 'node:fs';
import { appendBlock, verifyChain } from './chain.js';
import { loadChain, saveChain, CHAIN_FILE } from './store.js';

const [cmd, ...args] = process.argv.slice(2);

// Convierte el texto recibido en datos: JSON si es válido, si no un mensaje simple.
function parseData(text) {
  try { return JSON.parse(text); } catch { return { message: text }; }
}

function show(chain) {
  for (const b of chain) {
    console.log(`\n=== Bloque #${b.index} ===`);
    console.log(`timestamp : ${b.timestamp}`);
    console.log(`data      : ${JSON.stringify(b.data)}`);
    console.log(`prev_hash : ${b.prev_hash}`);
    console.log(`hash      : ${b.hash}`);
  }
}

function report(chain) {
  const { valid, errors } = verifyChain(chain);
  if (valid) {
    console.log(`✔ CADENA VÁLIDA (${chain.length} bloques verificados)`);
  } else {
    console.log(`✘ CADENA CORRUPTA: ${errors.length} problema(s) detectado(s)`);
    errors.forEach((e) => console.log(`  - Bloque #${e.index}: ${e.reason}`));
  }
  return valid;
}

switch (cmd) {
  case 'add': {
    if (!args.length) { console.log('Uso: node cli.js add <texto o JSON>'); process.exit(1); }
    const chain = loadChain();
    const b = appendBlock(chain, parseData(args.join(' ')));
    saveChain(chain);
    console.log(`Bloque #${b.index} agregado\nhash: ${b.hash}`);
    break;
  }
  case 'show':
    show(loadChain());
    break;
  case 'verify':
    process.exit(report(loadChain()) ? 0 : 2);
    break;
  case 'tamper': {
    // Simula un ataque: edita el archivo directamente SIN recalcular hashes.
    const [idx, ...rest] = args;
    const chain = loadChain();
    const i = Number(idx);
    if (!chain[i] || !rest.length) { console.log('Uso: node cli.js tamper <indice> <nuevo texto o JSON>'); process.exit(1); }
    chain[i].data = parseData(rest.join(' '));
    saveChain(chain);
    console.log(`⚠ Bloque #${i} modificado manualmente (hash NO recalculado). Ejecuta "verify".`);
    break;
  }
  case 'demo': {
    // Demostración completa para la presentación.
    if (existsSync(CHAIN_FILE)) unlinkSync(CHAIN_FILE);
    const chain = loadChain();
    appendBlock(chain, { user: 'ana', event: 'lesson_completed', subject: 'math', lesson: 'Sumas', xp: 50 });
    appendBlock(chain, { user: 'ana', event: 'lesson_completed', subject: 'english', lesson: 'Hello', xp: 50 });
    appendBlock(chain, { user: 'luis', event: 'badge_earned', badge: 'Primera lección' });
    saveChain(chain);
    console.log('--- Cadena creada ---'); show(chain);
    console.log('\n--- Verificación inicial ---'); report(chain);
    chain[1].data.xp = 9999; // ataque: ana "gana" XP falso
    saveChain(chain);
    console.log('\n--- Ataque: se cambia xp del bloque #1 a 9999 ---');
    report(loadChain());
    break;
  }
  case 'reset':
    if (existsSync(CHAIN_FILE)) unlinkSync(CHAIN_FILE);
    loadChain();
    console.log('Cadena reiniciada con bloque génesis.');
    break;
  default:
    console.log(`Comandos:
  add <texto|JSON>          agrega un registro
  show                      muestra la cadena
  verify                    verifica integridad
  tamper <indice> <datos>   simula un ataque (modifica un bloque pasado)
  demo                      demostración completa
  reset                     reinicia la cadena`);
}

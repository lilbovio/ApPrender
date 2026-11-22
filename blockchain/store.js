// store.js - Persistencia en un archivo JSON (data/chain.json)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGenesis } from './chain.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const CHAIN_FILE = process.env.CHAIN_FILE || join(__dirname, 'data', 'chain.json');

export function loadChain(file = CHAIN_FILE) {
  if (!existsSync(file)) {
    const chain = [createGenesis()];
    saveChain(chain, file);
    return chain;
  }
  return JSON.parse(readFileSync(file, 'utf8'));
}

export function saveChain(chain, file = CHAIN_FILE) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(chain, null, 2), 'utf8');
}

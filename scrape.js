import { writeFileSync, readFileSync, mkdirSync, existsSync } from 'node:fs';
import * as produbanco from './scrapers/produbanco.js';

const FUENTES = [produbanco];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const leer = (f) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : []);

async function correr(f) {
  const res = await fetch(f.url, { headers: { 'user-agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const promos = f.scrape(await res.text());

  // Si el banco rediseña su web, el parser devuelve 0 y sobreescribiríamos
  // datos buenos con un archivo vacío. Preferimos fallar ruidosamente.
  if (promos.length === 0) throw new Error('0 promos: el HTML cambió, revisar selectores');

  return promos;
}

mkdirSync('data', { recursive: true });
let fallos = 0;
const todas = [];

for (const f of FUENTES) {
  const archivo = `data/${f.fuente}.json`;
  try {
    const promos = await correr(f);
    writeFileSync(archivo, JSON.stringify(promos, null, 2) + '\n');
    console.log(`✓ ${f.fuente.padEnd(14)} ${promos.length} promos`);
    todas.push(...promos);
  } catch (e) {
    // Conservamos lo último bueno en vez de borrar el catálogo.
    const previas = leer(archivo);
    todas.push(...previas);
    console.error(`✗ ${f.fuente.padEnd(14)} ${e.message} (se conservan ${previas.length} previas)`);
    fallos++;
  }
}

todas.sort((a, b) => (a.vence ?? '9999').localeCompare(b.vence ?? '9999'));
writeFileSync(
  'data/promos.json',
  JSON.stringify(
    { actualizado: new Date().toISOString(), total: todas.length, promos: todas },
    null,
    2
  ) + '\n'
);

console.log(`\n${todas.length} promos en data/promos.json`);
process.exit(fallos ? 1 : 0);

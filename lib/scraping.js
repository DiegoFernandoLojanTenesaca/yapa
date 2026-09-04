import * as produbanco from '../scrapers/produbanco.js';
import * as pacifico from '../scrapers/pacifico.js';
import { sincronizar, registrarCorrida } from './almacen.js';

export const FUENTES = [produbanco, pacifico];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

async function correrUna(f) {
  const res = await fetch(f.url, { headers: { 'user-agent': UA }, cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const promos = f.scrape(await res.text());

  // Si el banco rediseña su web el parser devuelve 0, y sincronizar() dejaría
  // todo el catálogo de esa fuente archivado. Mejor fallar ruidosamente.
  if (promos.length === 0) throw new Error('0 promos: cambió el HTML, revisar selectores');

  return sincronizar(f.fuente, promos);
}

/** Corre todas las fuentes. Una que falle no tumba a las demás. */
export async function correrTodo() {
  const reporte = [];

  for (const f of FUENTES) {
    try {
      const r = await correrUna(f);
      await registrarCorrida({ fuente: f.fuente, ...r, error: null });
      reporte.push({ fuente: f.fuente, ok: true, ...r });
    } catch (e) {
      await registrarCorrida({ fuente: f.fuente, encontradas: 0, nuevas: 0, archivadas: 0, error: e.message });
      reporte.push({ fuente: f.fuente, ok: false, error: e.message });
    }
  }
  return reporte;
}

import * as produbanco from '../scrapers/produbanco.js';
import * as pacifico from '../scrapers/pacifico.js';
import * as cuponesecuador from '../scrapers/cuponesecuador.js';
import * as encuentrapromo from '../scrapers/encuentrapromo.js';
import * as juegos from '../scrapers/juegos.js';
import * as cursos from '../scrapers/cursos.js';
import { sincronizar, registrarCorrida } from './almacen.js';

export const FUENTES = [produbanco, pacifico, cuponesecuador, encuentrapromo, juegos, cursos];

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Una fuente lenta no puede comerse la corrida entera: en Vercel la función
// se corta a los 60 s y se perderían las demás fuentes.
// ponytail: tope fijo por pedido; si alguna fuente legítima tarda más, darle el suyo.
const ESPERA_MAXIMA = 10_000;

/** Descarga una URL como texto. Se le pasa a las fuentes que piden varias. */
async function pedir(url, cabeceras = {}) {
  const res = await fetch(url, {
    headers: { 'user-agent': UA, ...cabeceras },
    cache: 'no-store',
    signal: AbortSignal.timeout(ESPERA_MAXIMA),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function correrUna(f) {
  // Las fuentes que son API necesitan varias llamadas y su propio user-agent,
  // así que se traen solas; las de HTML solo reciben la página ya descargada.
  const promos = f.recolectar ? await f.recolectar(pedir) : f.scrape(await pedir(f.url));

  // Si la fuente rediseña, el parser devuelve 0 y sincronizar() archivaría todo
  // su catálogo. Mejor fallar ruidosamente.
  if (promos.length === 0) throw new Error('0 promos: cambió el formato, revisar la fuente');

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

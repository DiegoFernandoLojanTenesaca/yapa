import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ARCHIVO = () => join(process.cwd(), 'data', 'local.json');

/**
 * Modo local: sin Supabase configurado, todo vive en data/local.json.
 * Sirve para desarrollar la interfaz con datos reales antes de conectar nada.
 */
export function esLocal() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  return !url || url.includes('placeholder');
}

const VACIO = { promos: [], favoritos: [], corridas: [], bancos: [] };

export function leer() {
  const f = ARCHIVO();
  if (!existsSync(f)) return { ...VACIO };
  try {
    return { ...VACIO, ...JSON.parse(readFileSync(f, 'utf8')) };
  } catch {
    return { ...VACIO };
  }
}

export function escribir(datos) {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
  writeFileSync(ARCHIVO(), JSON.stringify(datos, null, 2) + '\n');
  return datos;
}

/** Aplica un cambio sobre el archivo completo. */
export function actualizar(fn) {
  const datos = leer();
  fn(datos);
  return escribir(datos);
}

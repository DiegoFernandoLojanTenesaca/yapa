import { todasLasPromos, idsFavoritas, corridas, estaVigente, esLocal } from './almacen.js';
import { valorRebaja } from './rebaja.js';
import { slugComercio } from './comercios.js';
import { ORDENES } from './ordenes.js';
import { normalizar } from './texto.js';

export { idsFavoritas, corridas, esLocal, ORDENES };

const hoy = () => new Date().toISOString().slice(0, 10);

// Los dos lados normalizados: buscar "pacifico" tiene que encontrar "Pacífico".
const contiene = (p, q) =>
  normalizar(
    `${p.comercio} ${p.titulo} ${p.detalle ?? ''} ${p.categoria} ${p.banco ?? ''} ${p.codigo ?? ''}`
  ).includes(q);

const visible = (p) => p.publicada !== false && p.activa !== false && estaVigente(p);

/** Orden por defecto: destacadas primero, después lo que vence antes. */
const porUrgencia = (a, b) =>
  Number(!!b.destacada) - Number(!!a.destacada) ||
  (a.vence ?? '9999').localeCompare(b.vence ?? '9999') ||
  a.comercio.localeCompare(b.comercio);

const CRITERIOS = {
  // Las que no tienen fecha no “vencen primero”: van al final.
  vence: (a, b) => (a.vence ?? '9999').localeCompare(b.vence ?? '9999'),
  descuento: (a, b) => valorRebaja(b) - valorRebaja(a),
  nuevas: (a, b) => (b.actualizada ?? '').localeCompare(a.actualizada ?? ''),
  az: (a, b) => a.comercio.localeCompare(b.comercio, 'es'),
};

const ordenar = (lista, orden) => lista.sort(CRITERIOS[orden] ?? porUrgencia);

/** Nombre lindo de cada fuente, declarado por su propio scraper. */
async function etiquetasDeFuente() {
  const { FUENTES } = await import('./scraping.js');
  const mapa = Object.fromEntries(FUENTES.map((f) => [f.fuente, f.origen ?? f.banco ?? f.fuente]));
  return { ...mapa, manual: 'Cargada a mano' };
}

export async function promosPublicas({
  q, categoria, ciudad, favoritas, soloConCodigo, comercio, orden, usuarioId,
} = {}) {
  const todas = (await todasLasPromos()).filter(visible);
  const favs = favoritas ? await idsFavoritas(usuarioId) : null;
  const texto = q ? normalizar(q.trim()) : null;

  const filtradas = todas
    .filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!comercio || slugComercio(p.comercio) === comercio) &&
        (!ciudad || p.ciudad === ciudad || p.ciudad === 'todo_el_pais') &&
        (!soloConCodigo || !!p.codigo) &&
        (!favs || favs.has(p.id)) &&
        (!texto || contiene(p, texto))
    );

  return ordenar(filtradas, orden);
}

export async function catalogos() {
  const todas = (await todasLasPromos()).filter(visible);
  const etiquetas = await etiquetasDeFuente();
  const unicos = (c) => [...new Set(todas.map((p) => p[c]).filter(Boolean))].sort();

  return {
    categorias: unicos('categoria'),
    bancos: unicos('banco'),
    ciudades: unicos('ciudad'),
    etiquetas,
    origenes: unicos('fuente').map((f) => ({ valor: f, nombre: etiquetas[f] ?? f })),
    conCodigo: todas.filter((p) => p.codigo).length,
    porCategoria: Object.fromEntries(
      unicos('categoria').map((c) => [c, todas.filter((p) => p.categoria === c).length])
    ),
  };
}

/* ─────────────────────────── panel ─────────────────────────── */

export async function promosAdmin({ q, fuente, estado } = {}) {
  const todas = await todasLasPromos();
  const texto = q ? normalizar(q.trim()) : null;

  const cumpleEstado = (p) =>
    ({
      ocultas: p.publicada === false,
      vencidas: p.vence && p.vence < hoy(),
      inactivas: p.activa === false,
      editadas: p.editada === true,
      destacadas: p.destacada === true,
      conCodigo: !!p.codigo,
    }[estado] ?? true);

  return todas
    .filter((p) => (!fuente || p.fuente === fuente) && cumpleEstado(p) && (!texto || contiene(p, texto)))
    .sort((a, b) => (b.actualizada ?? '').localeCompare(a.actualizada ?? ''));
}

export async function estadoFuentes() {
  const { FUENTES } = await import('./scraping.js');
  const [todas, ultimas] = await Promise.all([todasLasPromos(), corridas(60)]);

  return FUENTES.map((f) => {
    const suyas = todas.filter((p) => p.fuente === f.fuente);
    return {
      fuente: f.fuente,
      nombre: f.origen ?? f.banco ?? f.fuente,
      url: f.url,
      total: suyas.length,
      activas: suyas.filter((p) => p.activa !== false).length,
      conCodigo: suyas.filter((p) => p.codigo).length,
      ultima: ultimas.find((c) => c.fuente === f.fuente) ?? null,
    };
  });
}

/**
 * Promos relacionadas para la ficha. Primero las del mismo comercio, que son
 * las que de verdad le sirven a quien está mirando; después las de su categoría.
 */
export async function promosParecidas(promo, n = 4) {
  const otras = (await todasLasPromos()).filter((p) => visible(p) && p.id !== promo.id);

  const mismoComercio = otras.filter((p) => p.comercio === promo.comercio);
  const mismaCategoria = otras.filter(
    (p) => p.categoria === promo.categoria && p.comercio !== promo.comercio
  );

  return [...mismoComercio, ...mismaCategoria.sort(porUrgencia)].slice(0, n);
}

/** Directorio de comercios con promos vigentes, para /comercios. */
export async function comercios() {
  const todas = (await todasLasPromos()).filter(visible);
  const porNombre = new Map();

  for (const p of todas) {
    const actual = porNombre.get(p.comercio) ?? {
      nombre: p.comercio,
      slug: slugComercio(p.comercio),
      total: 0,
      conCodigo: 0,
      categorias: new Set(),
      // Sirve para sacarle el logo aunque la promo no traiga imagen.
      url: p.url,
    };
    actual.total++;
    if (p.codigo) actual.conCodigo++;
    actual.categorias.add(p.categoria);
    porNombre.set(p.comercio, actual);
  }

  return [...porNombre.values()]
    .map((c) => ({ ...c, categorias: [...c.categorias] }))
    .sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es'));
}

/** Un comercio por su slug, o null si no existe o no tiene promos vigentes. */
export async function comercioPorSlug(slug) {
  return (await comercios()).find((c) => c.slug === slug) ?? null;
}

/** Los comercios que más aparecen: sirve para ver de qué está lleno el catálogo. */
export async function topComercios(n = 8) {
  const todas = (await todasLasPromos()).filter(visible);
  const cuenta = todas.reduce((a, p) => ({ ...a, [p.comercio]: (a[p.comercio] ?? 0) + 1 }), {});

  return Object.entries(cuenta)
    .map(([comercio, total]) => ({ comercio, total }))
    .sort((a, b) => b.total - a.total || a.comercio.localeCompare(b.comercio))
    .slice(0, n);
}

export async function resumen() {
  const todas = await todasLasPromos();
  const t = hoy();

  return {
    total: todas.length,
    visibles: todas.filter(visible).length,
    conCodigo: todas.filter((p) => p.codigo && visible(p)).length,
    ocultas: todas.filter((p) => p.publicada === false).length,
    vencidas: todas.filter((p) => p.vence && p.vence < t).length,
    manuales: todas.filter((p) => p.fuente === 'manual').length,
  };
}

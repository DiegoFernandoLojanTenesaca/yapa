import { todasLasPromos, idsFavoritas, corridas, estaVigente, esLocal } from './almacen.js';

export { idsFavoritas, corridas, esLocal };

const hoy = () => new Date().toISOString().slice(0, 10);
const contiene = (p, q) =>
  `${p.comercio} ${p.titulo} ${p.detalle ?? ''} ${p.categoria} ${p.banco ?? ''}`
    .toLowerCase()
    .includes(q);

const visible = (p) => p.publicada !== false && p.activa !== false && estaVigente(p);

/** Orden del sitio: destacadas primero, después lo que vence antes. */
const porUrgencia = (a, b) =>
  Number(!!b.destacada) - Number(!!a.destacada) ||
  (a.vence ?? '9999').localeCompare(b.vence ?? '9999') ||
  a.comercio.localeCompare(b.comercio);

export async function promosPublicas({ q, categoria, banco, ciudad, favoritas, usuarioId } = {}) {
  const todas = (await todasLasPromos()).filter(visible);
  const favs = favoritas ? await idsFavoritas(usuarioId) : null;
  const texto = q?.trim().toLowerCase();

  return todas
    .filter(
      (p) =>
        (!categoria || p.categoria === categoria) &&
        (!banco || p.banco === banco) &&
        (!ciudad || p.ciudad === ciudad || p.ciudad === 'todo_el_pais') &&
        (!favs || favs.has(p.id)) &&
        (!texto || contiene(p, texto))
    )
    .sort(porUrgencia);
}

export async function catalogos() {
  const todas = (await todasLasPromos()).filter(visible);
  const unicos = (c) => [...new Set(todas.map((p) => p[c]).filter(Boolean))].sort();

  return {
    categorias: unicos('categoria'),
    bancos: unicos('banco'),
    ciudades: unicos('ciudad'),
    // Para las fichas de categoría del inicio.
    porCategoria: Object.fromEntries(
      unicos('categoria').map((c) => [c, todas.filter((p) => p.categoria === c).length])
    ),
  };
}

/* ─────────────────────────── panel ─────────────────────────── */

export async function promosAdmin({ q, fuente, estado } = {}) {
  const todas = await todasLasPromos();
  const texto = q?.trim().toLowerCase();

  const cumpleEstado = (p) =>
    ({
      ocultas: p.publicada === false,
      vencidas: p.vence && p.vence < hoy(),
      inactivas: p.activa === false,
      editadas: p.editada === true,
      destacadas: p.destacada === true,
    }[estado] ?? true);

  return todas
    .filter((p) => (!fuente || p.fuente === fuente) && cumpleEstado(p) && (!texto || contiene(p, texto)))
    .sort((a, b) => (b.actualizada ?? '').localeCompare(a.actualizada ?? ''))
    .slice(0, 400);
}

export async function estadoFuentes() {
  const { FUENTES } = await import('./scraping.js');
  const [todas, ultimas] = await Promise.all([todasLasPromos(), corridas(60)]);

  return FUENTES.map((f) => {
    const suyas = todas.filter((p) => p.fuente === f.fuente);
    return {
      fuente: f.fuente,
      banco: f.banco,
      url: f.url,
      total: suyas.length,
      activas: suyas.filter((p) => p.activa !== false).length,
      ultima: ultimas.find((c) => c.fuente === f.fuente) ?? null,
    };
  });
}

export async function resumen() {
  const todas = await todasLasPromos();
  const t = hoy();

  return {
    total: todas.length,
    visibles: todas.filter(visible).length,
    ocultas: todas.filter((p) => p.publicada === false).length,
    vencidas: todas.filter((p) => p.vence && p.vence < t).length,
    manuales: todas.filter((p) => p.fuente === 'manual').length,
    destacadas: todas.filter((p) => p.destacada).length,
  };
}

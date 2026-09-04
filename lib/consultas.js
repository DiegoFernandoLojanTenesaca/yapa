import { supabaseServidor } from './supabase.js';

const hoy = () => new Date().toISOString().slice(0, 10);

/** Promos visibles al público. RLS ya filtra publicada/activa/vigente. */
export async function promosPublicas({ q, categoria, banco, ciudad, soloFavoritas, usuarioId } = {}) {
  const sb = await supabaseServidor();

  if (soloFavoritas && usuarioId) {
    const { data } = await sb
      .from('favoritos')
      .select('promos(*)')
      .eq('usuario_id', usuarioId);
    return (data ?? []).map((f) => f.promos).filter(Boolean);
  }

  let c = sb.from('promos').select('*');

  if (categoria) c = c.eq('categoria', categoria);
  if (banco) c = c.eq('banco', banco);
  if (ciudad) c = c.in('ciudad', [ciudad, 'todo_el_pais']);
  if (q) {
    const t = `%${q}%`;
    c = c.or(`comercio.ilike.${t},titulo.ilike.${t},detalle.ilike.${t},categoria.ilike.${t}`);
  }

  const { data } = await c
    .order('destacada', { ascending: false })
    .order('vence', { ascending: true, nullsFirst: false })
    .limit(300);

  return data ?? [];
}

/** Valores existentes para poblar los selectores de filtro. */
export async function catalogos() {
  const sb = await supabaseServidor();
  const { data } = await sb.from('promos').select('categoria, banco, ciudad');

  const unicos = (campo) =>
    [...new Set((data ?? []).map((r) => r[campo]).filter(Boolean))].sort();

  return {
    categorias: unicos('categoria'),
    bancos: unicos('banco'),
    ciudades: unicos('ciudad'),
  };
}

export async function idsFavoritas(usuarioId) {
  if (!usuarioId) return new Set();
  const sb = await supabaseServidor();
  const { data } = await sb.from('favoritos').select('promo_id').eq('usuario_id', usuarioId);
  return new Set((data ?? []).map((f) => f.promo_id));
}

/* ─────────────────────────── panel ─────────────────────────── */

export async function promosAdmin({ q, fuente, estado } = {}) {
  const sb = await supabaseServidor();
  let c = sb.from('promos').select('*');

  if (fuente) c = c.eq('fuente', fuente);
  if (estado === 'ocultas') c = c.eq('publicada', false);
  if (estado === 'inactivas') c = c.eq('activa', false);
  if (estado === 'editadas') c = c.eq('editada', true);
  if (estado === 'vencidas') c = c.lt('vence', hoy());
  if (q) c = c.or(`comercio.ilike.%${q}%,titulo.ilike.%${q}%`);

  const { data } = await c.order('actualizada', { ascending: false }).limit(400);
  return data ?? [];
}

/** Estado de cada fuente para el panel: de dónde salen los datos y cómo. */
export async function estadoFuentes() {
  const sb = await supabaseServidor();
  const { FUENTES } = await import('./scraping.js');

  const { data: promos } = await sb.from('promos').select('fuente, activa, publicada');
  const { data: corridas } = await sb
    .from('corridas')
    .select('*')
    .order('fecha', { ascending: false })
    .limit(60);

  return FUENTES.map((f) => {
    const suyas = (promos ?? []).filter((p) => p.fuente === f.fuente);
    return {
      fuente: f.fuente,
      banco: f.banco,
      url: f.url,
      total: suyas.length,
      activas: suyas.filter((p) => p.activa).length,
      ultima: (corridas ?? []).find((c) => c.fuente === f.fuente) ?? null,
    };
  });
}

export async function ultimasCorridas(n = 10) {
  const sb = await supabaseServidor();
  const { data } = await sb.from('corridas').select('*').order('fecha', { ascending: false }).limit(n);
  return data ?? [];
}

export async function usuariosRegistrados() {
  const sb = await supabaseServidor();
  const { data } = await sb
    .from('perfiles')
    .select('id, email, nombre, rol, bancos, creado')
    .order('creado', { ascending: false })
    .limit(200);
  return data ?? [];
}

export async function resumen() {
  const sb = await supabaseServidor();
  const { data: p } = await sb.from('promos').select('publicada, activa, vence, fuente');
  const { count: usuarios } = await sb.from('perfiles').select('*', { count: 'exact', head: true });
  const t = hoy();

  return {
    total: (p ?? []).length,
    visibles: (p ?? []).filter((x) => x.publicada && x.activa && (!x.vence || x.vence >= t)).length,
    ocultas: (p ?? []).filter((x) => !x.publicada).length,
    vencidas: (p ?? []).filter((x) => x.vence && x.vence < t).length,
    manuales: (p ?? []).filter((x) => x.fuente === 'manual').length,
    usuarios: usuarios ?? 0,
  };
}

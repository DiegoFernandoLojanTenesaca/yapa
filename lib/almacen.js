
import { esLocal, leer, actualizar } from './local.js';

// Carga diferida: supabase.js importa next/headers, que solo existe dentro
// de Next. Sin esto el CLI (npm run scrape) no puede ni arrancar.
const clienteServidor = async () => (await import('./supabase.js')).supabaseServidor();
const clienteAdmin = async () => (await import('./supabase.js')).supabaseAdmin();

export { esLocal };

const ahora = () => new Date().toISOString();
const hoy = () => ahora().slice(0, 10);

const CAMPOS = [
  'id', 'fuente', 'banco', 'comercio', 'titulo', 'detalle',
  'categoria', 'ciudad', 'vence', 'codigo', 'url', 'imagen',
];

/**
 * Única capa que sabe dónde viven los datos. Todo lo demás la llama sin
 * enterarse de si detrás hay Supabase o un JSON local.
 *
 * Trae todas las promos y el filtrado se hace en JS. Con unos cientos de
 * filas es más simple y no se nota.
 * ponytail: filtrar en memoria; mover los filtros a la consulta si pasa de ~5k promos.
 */
export async function todasLasPromos() {
  if (esLocal()) return leer().promos;

  const sb = await clienteServidor();
  const { data } = await sb.from('promos').select('*').limit(2000);
  return data ?? []; // RLS ya recorta lo que puede ver quien pregunta.
}

/* ─────────────────────────── sesión ─────────────────────────── */

export async function sesion() {
  if (esLocal()) {
    return {
      local: true,
      esAdmin: true,
      user: { id: 'local', email: 'local@yapa' },
      perfil: { nombre: 'Local', rol: 'admin', bancos: leer().bancos, seguidos: leer().seguidos },
    };
  }

  const sb = await clienteServidor();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  const { data: perfil } = await sb
    .from('perfiles')
    .select('id, email, nombre, rol, bancos, seguidos')
    .eq('id', user.id)
    .single();

  return { local: false, user, perfil, esAdmin: perfil?.rol === 'admin' };
}

/* ────────────────────────── escritura ───────────────────────── */

export async function alternarCampo(id, campo) {
  if (esLocal()) {
    actualizar((d) => {
      const p = d.promos.find((x) => x.id === id);
      if (p) p[campo] = !p[campo];
    });
    return;
  }

  const sb = await clienteServidor();
  const { data } = await sb.from('promos').select(campo).eq('id', id).single();
  await sb.from('promos').update({ [campo]: !data?.[campo] }).eq('id', id);
}

export async function borrarPromo(id) {
  if (esLocal()) {
    actualizar((d) => (d.promos = d.promos.filter((p) => p.id !== id)));
    return;
  }
  const sb = await clienteServidor();
  await sb.from('promos').delete().eq('id', id);
}

export async function guardarPromo(id, datos) {
  const registro = { ...datos, editada: true, actualizada: ahora() };

  if (esLocal()) {
    actualizar((d) => {
      const i = d.promos.findIndex((p) => p.id === id);
      if (i >= 0) d.promos[i] = { ...d.promos[i], ...registro };
      else d.promos.push({ ...registro, id: `manual:${Date.now().toString(36)}`, fuente: 'manual', activa: true });
    });
    return null;
  }

  const sb = await clienteServidor();
  const { error } = id
    ? await sb.from('promos').update(registro).eq('id', id)
    : await sb.from('promos').insert({
        ...registro, fuente: 'manual', activa: true,
        id: `manual:${Date.now().toString(36)}`,
      });

  return error?.message ?? null;
}

export async function obtenerPromo(id) {
  if (esLocal()) return leer().promos.find((p) => p.id === id) ?? null;
  const sb = await clienteServidor();
  const { data } = await sb.from('promos').select('*').eq('id', id).single();
  return data;
}

/* ───────────────────────── favoritos ────────────────────────── */

export async function idsFavoritas(usuarioId) {
  if (esLocal()) return new Set(leer().favoritos);
  if (!usuarioId) return new Set();

  const sb = await clienteServidor();
  const { data } = await sb.from('favoritos').select('promo_id').eq('usuario_id', usuarioId);
  return new Set((data ?? []).map((f) => f.promo_id));
}

export async function alternarFavorito(usuarioId, promoId) {
  if (esLocal()) {
    actualizar((d) => {
      d.favoritos = d.favoritos.includes(promoId)
        ? d.favoritos.filter((x) => x !== promoId)
        : [...d.favoritos, promoId];
    });
    return;
  }

  const sb = await clienteServidor();
  const { data } = await sb
    .from('favoritos').select('promo_id')
    .eq('usuario_id', usuarioId).eq('promo_id', promoId).maybeSingle();

  if (data) await sb.from('favoritos').delete().eq('usuario_id', usuarioId).eq('promo_id', promoId);
  else await sb.from('favoritos').insert({ usuario_id: usuarioId, promo_id: promoId });
}

export async function guardarBancos(usuarioId, bancos) {
  if (esLocal()) {
    actualizar((d) => (d.bancos = bancos));
    return;
  }
  const sb = await clienteServidor();
  await sb.from('perfiles').update({ bancos }).eq('id', usuarioId);
}

/* ──────────────── comercios que sigue el usuario ─────────────── */

export async function comerciosSeguidos(usuarioId) {
  if (esLocal()) return leer().seguidos;
  if (!usuarioId) return [];

  const sb = await clienteServidor();
  const { data } = await sb.from('perfiles').select('seguidos').eq('id', usuarioId).single();
  return data?.seguidos ?? [];
}

export async function alternarSeguido(usuarioId, slug) {
  const actuales = await comerciosSeguidos(usuarioId);
  const nuevos = actuales.includes(slug)
    ? actuales.filter((s) => s !== slug)
    : [...actuales, slug];

  if (esLocal()) {
    actualizar((d) => (d.seguidos = nuevos));
    return;
  }
  const sb = await clienteServidor();
  await sb.from('perfiles').update({ seguidos: nuevos }).eq('id', usuarioId);
}

/* ──────────────────── scraper y su bitácora ─────────────────── */

/**
 * Reglas: nunca pisa una promo editada a mano, conserva `publicada` y
 * `destacada`, y lo que desapareció del origen queda `activa = false`.
 */
export async function sincronizar(fuente, promos) {
  const soloCampos = (p) => Object.fromEntries(CAMPOS.map((c) => [c, p[c] ?? null]));
  const vistos = new Set(promos.map((p) => p.id));

  if (esLocal()) {
    let nuevas = 0, archivadas = 0;
    actualizar((d) => {
      for (const p of d.promos) {
        if (p.fuente === fuente && !vistos.has(p.id) && p.activa !== false) {
          p.activa = false;
          archivadas++;
        }
      }
      for (const p of promos) {
        const i = d.promos.findIndex((x) => x.id === p.id);
        if (i < 0) {
          d.promos.push({ ...soloCampos(p), publicada: true, destacada: false, editada: false, activa: true, actualizada: ahora() });
          nuevas++;
        } else if (d.promos[i].editada) {
          d.promos[i].activa = true;
        } else {
          d.promos[i] = { ...d.promos[i], ...soloCampos(p), activa: true, actualizada: ahora() };
        }
      }
    });
    return { encontradas: promos.length, nuevas, archivadas };
  }

  const sb = await clienteAdmin();
  const { data: previas, error } = await sb
    .from('promos').select('id, editada, publicada, destacada').eq('fuente', fuente);
  if (error) throw new Error(`leyendo previas: ${error.message}`);

  const antes = new Map((previas ?? []).map((p) => [p.id, p]));
  const aEscribir = [], aReactivar = [];

  for (const p of promos) {
    const previa = antes.get(p.id);
    if (previa?.editada) { aReactivar.push(p.id); continue; }
    aEscribir.push({
      ...soloCampos(p), activa: true, actualizada: ahora(),
      publicada: previa ? previa.publicada : true,
      destacada: previa ? previa.destacada : false,
    });
  }

  if (aEscribir.length) {
    const { error } = await sb.from('promos').upsert(aEscribir, { onConflict: 'id' });
    if (error) throw new Error(`guardando: ${error.message}`);
  }
  if (aReactivar.length) await sb.from('promos').update({ activa: true }).in('id', aReactivar);

  const desaparecidas = [...antes.keys()].filter((id) => !vistos.has(id));
  if (desaparecidas.length) await sb.from('promos').update({ activa: false }).in('id', desaparecidas);

  return {
    encontradas: promos.length,
    nuevas: promos.filter((p) => !antes.has(p.id)).length,
    archivadas: desaparecidas.length,
  };
}

export async function registrarCorrida(fila) {
  if (esLocal()) {
    actualizar((d) => {
      d.corridas.unshift({ id: Date.now(), fecha: ahora(), ...fila });
      d.corridas = d.corridas.slice(0, 40);
    });
    return;
  }
  await (await clienteAdmin()).from('corridas').insert(fila);
}

export async function corridas(n = 10) {
  if (esLocal()) return leer().corridas.slice(0, n);
  const sb = await clienteServidor();
  const { data } = await sb.from('corridas').select('*').order('fecha', { ascending: false }).limit(n);
  return data ?? [];
}

export async function usuarios() {
  if (esLocal()) {
    return [{
      id: 'local', email: 'local@yapa', nombre: 'Local',
      rol: 'admin', bancos: leer().bancos, creado: ahora(),
    }];
  }
  const sb = await clienteServidor();
  const { data } = await sb
    .from('perfiles').select('id, email, nombre, rol, bancos, creado')
    .order('creado', { ascending: false }).limit(200);
  return data ?? [];
}

export const estaVigente = (p) => !p.vence || p.vence >= hoy();

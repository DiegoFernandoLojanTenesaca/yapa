'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServidor, sesionActual } from '../lib/supabase.js';
import { correrTodo } from '../lib/scraping.js';

/**
 * Las server actions son endpoints HTTP: cualquiera puede invocarlas.
 * Por eso cada acción del panel vuelve a verificar el rol, aunque el
 * layout de /admin ya lo haya hecho.
 */
async function exigirAdmin() {
  const s = await sesionActual();
  if (!s?.esAdmin) redirect('/entrar');
  return s;
}

/* ─────────────────────────── cuenta ─────────────────────────── */

export async function registrarse(_prev, form) {
  const email = String(form.get('email') ?? '').trim();
  const clave = String(form.get('clave') ?? '');
  const nombre = String(form.get('nombre') ?? '').trim();

  if (clave.length < 8) return { error: 'La contraseña necesita al menos 8 caracteres.' };

  const sb = await supabaseServidor();
  const { error } = await sb.auth.signUp({
    email,
    password: clave,
    options: { data: { nombre } },
  });

  if (error) return { error: error.message };
  return { ok: 'Cuenta creada. Revisá tu correo para confirmarla.' };
}

export async function entrar(_prev, form) {
  const sb = await supabaseServidor();
  const { error } = await sb.auth.signInWithPassword({
    email: String(form.get('email') ?? '').trim(),
    password: String(form.get('clave') ?? ''),
  });

  if (error) return { error: 'Correo o contraseña incorrectos.' };

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function salir() {
  const sb = await supabaseServidor();
  await sb.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function guardarMisBancos(form) {
  const s = await sesionActual();
  if (!s) redirect('/entrar');

  const sb = await supabaseServidor();
  await sb.from('perfiles').update({ bancos: form.getAll('bancos').map(String) }).eq('id', s.user.id);

  revalidatePath('/mi-cuenta');
}

export async function alternarFavorito(form) {
  const s = await sesionActual();
  if (!s) redirect('/entrar');

  const promoId = String(form.get('promoId'));
  const sb = await supabaseServidor();

  const { data } = await sb
    .from('favoritos')
    .select('promo_id')
    .eq('usuario_id', s.user.id)
    .eq('promo_id', promoId)
    .maybeSingle();

  if (data) {
    await sb.from('favoritos').delete().eq('usuario_id', s.user.id).eq('promo_id', promoId);
  } else {
    await sb.from('favoritos').insert({ usuario_id: s.user.id, promo_id: promoId });
  }

  revalidatePath('/');
  revalidatePath('/mi-cuenta');
}

/* ──────────────────────────── panel ─────────────────────────── */

export async function alternarCampo(form) {
  await exigirAdmin();

  const campo = String(form.get('campo'));
  if (!['publicada', 'destacada'].includes(campo)) throw new Error('campo inválido');

  const id = String(form.get('id'));
  const sb = await supabaseServidor();
  const { data } = await sb.from('promos').select(campo).eq('id', id).single();
  await sb.from('promos').update({ [campo]: !data?.[campo] }).eq('id', id);

  revalidatePath('/admin/promos');
  revalidatePath('/');
}

export async function borrarPromo(form) {
  await exigirAdmin();

  const sb = await supabaseServidor();
  await sb.from('promos').delete().eq('id', String(form.get('id')));

  revalidatePath('/admin/promos');
  revalidatePath('/');
}

export async function guardarPromo(_prev, form) {
  await exigirAdmin();

  const campo = (k) => {
    const v = String(form.get(k) ?? '').trim();
    return v === '' ? null : v;
  };

  if (!campo('comercio') || !campo('titulo')) {
    return { error: 'Comercio y título son obligatorios.' };
  }

  const id = campo('id');
  const datos = {
    fuente: id ? undefined : 'manual',
    banco: campo('banco'),
    comercio: campo('comercio'),
    titulo: campo('titulo'),
    detalle: campo('detalle'),
    categoria: campo('categoria') ?? 'otros',
    ciudad: campo('ciudad') ?? 'todo_el_pais',
    vence: campo('vence'),
    codigo: campo('codigo'),
    url: campo('url'),
    imagen: campo('imagen'),
    publicada: form.get('publicada') === 'on',
    destacada: form.get('destacada') === 'on',
    // Marca de mano: el scraper diario ya no la vuelve a pisar.
    editada: true,
    actualizada: new Date().toISOString(),
  };

  const sb = await supabaseServidor();
  const { error } = id
    ? await sb.from('promos').update(datos).eq('id', id)
    : await sb.from('promos').insert({
        ...datos,
        fuente: 'manual',
        id: `manual:${Date.now().toString(36)}`,
        activa: true,
      });

  if (error) return { error: error.message };

  revalidatePath('/admin/promos');
  revalidatePath('/');
  redirect('/admin/promos');
}

export async function correrScraperAhora() {
  await exigirAdmin();

  await correrTodo();

  revalidatePath('/admin');
  revalidatePath('/admin/promos');
  revalidatePath('/');
}

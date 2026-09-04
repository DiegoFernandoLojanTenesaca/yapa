'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServidor } from '../lib/supabase.js';
import { correrTodo } from '../lib/scraping.js';
import * as almacen from '../lib/almacen.js';

/**
 * Las server actions son endpoints HTTP: cualquiera puede invocarlas.
 * Por eso cada acción del panel revalida el rol, aunque el layout de /admin
 * ya lo haya hecho.
 */
async function exigirAdmin() {
  const s = await almacen.sesion();
  if (!s?.esAdmin) redirect('/entrar');
  return s;
}

const refrescar = (...rutas) => rutas.forEach((r) => revalidatePath(r));

/* ─────────────────────────── cuenta ─────────────────────────── */

export async function registrarse(_prev, form) {
  if (almacen.esLocal()) return { error: 'En modo local no hacen falta cuentas: ya entrás como admin.' };

  const clave = String(form.get('clave') ?? '');
  if (clave.length < 8) return { error: 'La contraseña necesita al menos 8 caracteres.' };

  const sb = await supabaseServidor();
  const { error } = await sb.auth.signUp({
    email: String(form.get('email') ?? '').trim(),
    password: clave,
    options: { data: { nombre: String(form.get('nombre') ?? '').trim() } },
  });

  if (error) return { error: error.message };
  return { ok: 'Cuenta creada. Revisá tu correo para confirmarla.' };
}

export async function entrar(_prev, form) {
  if (almacen.esLocal()) redirect('/');

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
  if (!almacen.esLocal()) {
    const sb = await supabaseServidor();
    await sb.auth.signOut();
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function guardarMisBancos(form) {
  const s = await almacen.sesion();
  if (!s) redirect('/entrar');

  await almacen.guardarBancos(s.user.id, form.getAll('bancos').map(String));
  refrescar('/mi-cuenta', '/');
}

export async function alternarFavorito(form) {
  const s = await almacen.sesion();
  if (!s) redirect('/entrar');

  await almacen.alternarFavorito(s.user.id, String(form.get('promoId')));
  refrescar('/', '/mi-cuenta');
}

/* ──────────────────────────── panel ─────────────────────────── */

export async function alternarCampo(form) {
  await exigirAdmin();

  const campo = String(form.get('campo'));
  if (!['publicada', 'destacada'].includes(campo)) throw new Error('campo inválido');

  await almacen.alternarCampo(String(form.get('id')), campo);
  refrescar('/admin/promos', '/');
}

export async function borrarPromo(form) {
  await exigirAdmin();
  await almacen.borrarPromo(String(form.get('id')));
  refrescar('/admin/promos', '/');
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

  const error = await almacen.guardarPromo(campo('id'), {
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
  });

  if (error) return { error };

  refrescar('/admin/promos', '/');
  redirect('/admin/promos');
}

export async function correrScraperAhora() {
  await exigirAdmin();
  await correrTodo();
  refrescar('/admin', '/admin/promos', '/');
}

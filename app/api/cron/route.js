import { timingSafeEqual, createHash } from 'node:crypto';
import { correrTodo } from '../../../lib/scraping.js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const sha = (s) => createHash('sha256').update(String(s)).digest();

/**
 * Actualización diaria. La dispara Vercel Cron (ver vercel.json) o cualquier
 * scheduler con: Authorization: Bearer $CRON_SECRET
 */
export async function GET(request) {
  const secreto = process.env.CRON_SECRET;
  if (!secreto) {
    return Response.json({ error: 'Falta CRON_SECRET' }, { status: 500 });
  }

  const enviado = request.headers.get('authorization')?.replace('Bearer ', '') ?? '';
  if (!timingSafeEqual(sha(enviado), sha(secreto))) {
    return Response.json({ error: 'No autorizado' }, { status: 401 });
  }

  const reporte = await correrTodo();
  return Response.json({ fecha: new Date().toISOString(), reporte });
}

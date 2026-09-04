import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { esLocal } from './lib/local.js';

/**
 * Los tokens de Supabase vencen: sin este refresco, un usuario logueado
 * aparecería como anónimo al volver un rato después.
 */
export async function proxy(request) {
  // En modo local no hay sesión que refrescar.
  if (esLocal()) return NextResponse.next({ request });

  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(lista) {
          for (const { name, value } of lista) request.cookies.set(name, value);
          respuesta = NextResponse.next({ request });
          for (const { name, value, options } of lista) respuesta.cookies.set(name, value, options);
        },
      },
    }
  );

  await supabase.auth.getUser();
  return respuesta;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.svg|api/cron|.*\\.(?:svg|png|jpg|webp)$).*)'],
};

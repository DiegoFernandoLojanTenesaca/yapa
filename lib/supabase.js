import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Cliente para server components y actions: respeta las políticas de seguridad
 * con la sesión del visitante.
 *
 * El cliente de servicio (que las saltea) vive en supabase-admin.js, porque
 * este archivo importa `next/headers` y no se puede usar fuera de Next.
 */
export async function supabaseServidor() {
  const store = await cookies();

  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(lista) {
        // En server components las cookies son de solo lectura; el refresco
        // de sesión lo hace el proxy, así que acá se ignora sin ruido.
        try {
          for (const { name, value, options } of lista) store.set(name, value, options);
        } catch {}
      },
    },
  });
}

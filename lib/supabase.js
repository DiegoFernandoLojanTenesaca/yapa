import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Cliente para server components y actions: respeta RLS con la sesión del visitante. */
export async function supabaseServidor() {
  const store = await cookies();

  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(lista) {
        // En server components las cookies son de solo lectura; el refresco
        // de sesión lo hace el middleware, así que acá se ignora sin ruido.
        try {
          for (const { name, value, options } of lista) store.set(name, value, options);
        } catch {}
      },
    },
  });
}

/**
 * Cliente con service_role: SALTEA RLS.
 * Solo para el scraper. Nunca importar desde un componente de cliente.
 */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');
  return createClient(URL, key, { auth: { persistSession: false } });
}

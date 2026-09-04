import { createClient } from '@supabase/supabase-js';

/**
 * Cliente con la llave de servicio: SALTEA las políticas de seguridad.
 * Solo lo usa el scraper. Nunca importar desde un componente de cliente.
 *
 * Vive aparte de supabase.js a propósito: ese importa `next/headers`, que solo
 * existe dentro de Next, y el scraper corre como script de node suelto.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('Falta NEXT_PUBLIC_SUPABASE_URL');
  if (!key) throw new Error('Falta SUPABASE_SERVICE_ROLE_KEY');

  return createClient(url, key, { auth: { persistSession: false } });
}

import FormularioPromo from './FormularioPromo.jsx';
import { supabaseServidor } from '../../../lib/supabase.js';

export const dynamic = 'force-dynamic';

export default async function EditarPromo({ searchParams }) {
  const { id } = await searchParams;

  let promo = null;
  if (id) {
    const sb = await supabaseServidor();
    const { data } = await sb.from('promos').select('*').eq('id', id).single();
    promo = data;
  }

  return (
    <>
      <h1>{promo ? 'Editar promo' : 'Nueva promo'}</h1>
      <p className="sub">
        {promo
          ? 'Al guardar queda marcada como editada a mano: el scraper diario ya no la pisa.'
          : 'Para las promos que no se pueden scrapear — las que viven dentro de la app de KFC, McDonald’s y compañía.'}
      </p>
      <FormularioPromo promo={promo} />
    </>
  );
}

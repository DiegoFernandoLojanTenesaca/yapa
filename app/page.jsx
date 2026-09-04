import { Suspense } from 'react';
import Filtros from './Filtros.jsx';
import TarjetaPromo from './TarjetaPromo.jsx';
import { sesionActual } from '../lib/supabase.js';
import { promosPublicas, catalogos, idsFavoritas } from '../lib/consultas.js';

export const dynamic = 'force-dynamic';

export default async function Inicio({ searchParams }) {
  const sp = await searchParams;
  const s = await sesionActual();

  const [promos, cat, favoritas] = await Promise.all([
    promosPublicas({
      q: sp.q,
      categoria: sp.categoria,
      banco: sp.banco,
      ciudad: sp.ciudad,
      soloFavoritas: sp.favoritas === '1',
      usuarioId: s?.user.id,
    }),
    catalogos(),
    idsFavoritas(s?.user.id),
  ]);

  return (
    <>
      <h1>Promos de Ecuador</h1>
      <p className="sub">
        Beneficios de bancos y comercios, en un solo lugar.
        {s ? ' Guardá las que te sirven con la estrella.' : ' Creá una cuenta para guardar tus favoritas.'}
      </p>

      <Suspense fallback={null}>
        <Filtros {...cat} haySesion={!!s} />
      </Suspense>

      <p className="sub" style={{ margin: '14px 0 16px' }}>
        {promos.length} {promos.length === 1 ? 'promoción vigente' : 'promociones vigentes'}
      </p>

      {promos.length === 0 ? (
        <p className="vacio">Nada con esos filtros. Probá quitar alguno.</p>
      ) : (
        <div className="grid">
          {promos.map((p) => (
            <TarjetaPromo key={p.id} promo={p} esFavorita={favoritas.has(p.id)} haySesion={!!s} />
          ))}
        </div>
      )}
    </>
  );
}

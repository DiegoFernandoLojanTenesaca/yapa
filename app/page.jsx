import { Suspense } from 'react';
import Filtros from './Filtros.jsx';
import TarjetaPromo from './TarjetaPromo.jsx';
import BarraCategorias from './BarraCategorias.jsx';
import { sesion } from '../lib/almacen.js';
import { promosPublicas, catalogos, idsFavoritas } from '../lib/consultas.js';

export const dynamic = 'force-dynamic';

export default async function Inicio({ searchParams }) {
  const sp = await searchParams;
  const s = await sesion();

  const [promos, cat, favoritas] = await Promise.all([
    promosPublicas({
      q: sp.q,
      categoria: sp.categoria,
      banco: sp.banco,
      ciudad: sp.ciudad,
      favoritas: sp.favoritas === '1',
      usuarioId: s?.user.id,
    }),
    catalogos(),
    idsFavoritas(s?.user.id),
  ]);

  const hayFiltro = !!(sp.q || sp.categoria || sp.banco || sp.ciudad || sp.favoritas);
  const destacadas = hayFiltro ? [] : promos.filter((p) => p.destacada).slice(0, 3);
  const resto = promos.filter((p) => !destacadas.includes(p));

  const tarjeta = (p) => (
    <TarjetaPromo key={p.id} promo={p} esFavorita={favoritas.has(p.id)} haySesion={!!s} />
  );

  return (
    <>
      <BarraCategorias {...cat} activa={sp.categoria} params={sp} />

      <div className="wrap">
        <section className="hero">
          <h1>
            No pagues de más.<br />
            Todas las promos de Ecuador, <em>en un solo lugar</em>.
          </h1>
          <p>
            {cat.bancos.length} {cat.bancos.length === 1 ? 'fuente' : 'fuentes'} ·
            actualizado todos los días
          </p>

          <Suspense fallback={null}>
            <Filtros {...cat} haySesion={!!s} />
          </Suspense>
        </section>

        <p className="conteo">
          {promos.length} {promos.length === 1 ? 'promoción vigente' : 'promociones vigentes'}
          {sp.categoria ? ` en ${sp.categoria}` : ''}
        </p>

        {destacadas.length > 0 && (
          <>
            <h2 className="seccion">Lo mejor de hoy</h2>
            <div className="grid destacadas">{destacadas.map(tarjeta)}</div>
            <h2 className="seccion">Todas las promos</h2>
          </>
        )}

        {promos.length === 0 ? (
          <div className="vacio">
            <b>Acá no hay nada… todavía</b>
            {hayFiltro
              ? 'Probá quitar algún filtro o buscar otra cosa.'
              : 'Corré el scraper desde el panel para traer las promos.'}
          </div>
        ) : (
          <div className="grid">{resto.map(tarjeta)}</div>
        )}
      </div>
    </>
  );
}

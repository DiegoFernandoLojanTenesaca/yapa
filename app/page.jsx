import { Suspense } from 'react';
import Filtros from './Filtros.jsx';
import TarjetaPromo from './TarjetaPromo.jsx';
import BarraCategorias from './BarraCategorias.jsx';
import Paginacion from './Paginacion.jsx';
import Orden from './Orden.jsx';
import PieDePagina from './PieDePagina.jsx';
import { sesion } from '../lib/almacen.js';
import { promosPublicas, catalogos, idsFavoritas } from '../lib/consultas.js';

export const dynamic = 'force-dynamic';

const POR_PAGINA = 24;

export default async function Inicio({ searchParams }) {
  const sp = await searchParams;
  const s = await sesion();

  const [promos, cat, favoritas] = await Promise.all([
    promosPublicas({
      q: sp.q,
      categoria: sp.categoria,
      ciudad: sp.ciudad,
      soloConCodigo: sp.codigo === '1',
      orden: sp.orden,
      favoritas: sp.favoritas === '1',
      usuarioId: s?.user.id,
    }),
    catalogos(),
    idsFavoritas(s?.user.id),
  ]);

  const hayFiltro = !!(sp.q || sp.categoria || sp.ciudad || sp.favoritas || sp.codigo);

  // Las destacadas van fuera del listado, y solo en la primera página sin filtros.
  const destacadas = hayFiltro || sp.p ? [] : promos.filter((p) => p.destacada).slice(0, 3);
  const resto = promos.filter((p) => !destacadas.includes(p));

  const paginas = Math.max(1, Math.ceil(resto.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(sp.p) || 1), paginas);
  const visibles = resto.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const tarjeta = (p) => (
    <TarjetaPromo
      key={p.id}
      promo={p}
      esFavorita={favoritas.has(p.id)}
      haySesion={!!s}
    />
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
  Promos de bancos, comercios y delivery · actualizado todos los días
          </p>

          <Suspense fallback={null}>
            <Filtros {...cat} haySesion={!!s} />
          </Suspense>
        </section>

        <div className="barraOrden">
          <p className="conteo" style={{ margin: 0 }}>
            {promos.length} {promos.length === 1 ? 'promoción vigente' : 'promociones vigentes'}
            {paginas > 1 && ` · página ${pagina} de ${paginas}`}
          </p>
          <Suspense fallback={null}>
            <Orden />
          </Suspense>
        </div>

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
          <>
            <div className="grid">{visibles.map(tarjeta)}</div>
            <Paginacion pagina={pagina} paginas={paginas} params={sp} />
          </>
        )}
      </div>

      <PieDePagina total={promos.length} conCodigo={cat.conCodigo} />
    </>
  );
}

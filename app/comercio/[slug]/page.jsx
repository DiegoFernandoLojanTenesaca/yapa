import Link from 'next/link';
import { notFound } from 'next/navigation';
import TarjetaPromo from '../../TarjetaPromo.jsx';
import PieDePagina from '../../PieDePagina.jsx';
import Paginacion from '../../Paginacion.jsx';
import Icono from '../../Icono.jsx';
import Orden from '../../Orden.jsx';
import { sesion } from '../../../lib/almacen.js';
import { promosPublicas, comercioPorSlug, idsFavoritas, catalogos } from '../../../lib/consultas.js';
import { logoDe } from '../../../lib/logo.js';

export const dynamic = 'force-dynamic';

const POR_PAGINA = 24;

export default async function PaginaComercio({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;

  const comercio = await comercioPorSlug(slug);
  if (!comercio) notFound();

  const [promos, s, cat] = await Promise.all([
    promosPublicas({ comercio: slug, orden: sp.orden }),
    sesion(),
    catalogos(),
  ]);
  const favoritas = await idsFavoritas(s?.user.id);

  const paginas = Math.max(1, Math.ceil(promos.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(sp.p) || 1), paginas);
  const visibles = promos.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  const logo = logoDe(comercio.url);

  return (
    <>
      <div className="wrap">
        <nav className="miga">
          <Link href="/">Promos</Link>
          <span>›</span>
          <Link href="/comercios">Comercios</Link>
          <span>›</span>
          <b>{comercio.nombre}</b>
        </nav>

        <header className="cabComercio">
          {logo && <img className="logoGrande" src={logo} alt="" />}
          <div>
            <h1>{comercio.nombre}</h1>
            <p className="sub">
              {comercio.total} {comercio.total === 1 ? 'promoción vigente' : 'promociones vigentes'}
              {comercio.conCodigo > 0 && ` · ${comercio.conCodigo} con código`}
            </p>
            <div className="meta" style={{ marginTop: 9 }}>
              {comercio.categorias.map((c) => (
                <Link className="pill" key={c} href={`/?categoria=${c}`}>
                  <Icono nombre={c} tamano={11} /> {c}
                </Link>
              ))}
            </div>
          </div>
        </header>

        <div className="barraOrden">
          <Orden base={`/comercio/${slug}`} />
        </div>

        <div className="grid">
          {visibles.map((p) => (
            <TarjetaPromo
              key={p.id}
              promo={p}
              esFavorita={favoritas.has(p.id)}
              haySesion={!!s}
            />
          ))}
        </div>

        <Paginacion pagina={pagina} paginas={paginas} params={sp} base={`/comercio/${slug}`} />
      </div>

      <PieDePagina total={comercio.total} conCodigo={cat.conCodigo} />
    </>
  );
}

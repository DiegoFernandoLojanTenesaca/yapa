import Link from 'next/link';
import PieDePagina from '../PieDePagina.jsx';
import Icono from '../Icono.jsx';
import BuscadorComercios from './BuscadorComercios.jsx';
import { comercios, catalogos } from '../../lib/consultas.js';
import { logoDe } from '../../lib/logo.js';
import { normalizar } from '../../lib/texto.js';

export const dynamic = 'force-dynamic';

export default async function Comercios({ searchParams }) {
  const sp = await searchParams;
  const [todos, cat] = await Promise.all([comercios(), catalogos()]);

  const q = normalizar((sp.q ?? '').trim());
  const lista = q ? todos.filter((c) => normalizar(c.nombre).includes(q)) : todos;

  return (
    <>
      <div className="wrap">
        <nav className="miga">
          <Link href="/">Promos</Link>
          <span>›</span>
          <b>Comercios</b>
        </nav>

        <h1>Comercios</h1>
        <p className="sub">
          {todos.length} comercios con promos vigentes. Entra a cualquiera para ver todo lo suyo junto.
        </p>

        <BuscadorComercios />

        {lista.length === 0 ? (
          <div className="vacio">
            <b>Ningún comercio con ese nombre</b>
            <span>Prueba con menos letras.</span>
          </div>
        ) : (
          <div className="rejillaComercios">
            {lista.map((c) => {
              const logo = logoDe(c.url);
              return (
                <Link className="tarjetaComercio" key={c.slug} href={`/comercio/${c.slug}`}>
                  {logo ? (
                    <img src={logo} alt="" loading="lazy" />
                  ) : (
                    <span className="sinLogo">{c.nombre.charAt(0)}</span>
                  )}
                  <div>
                    <strong>{c.nombre}</strong>
                    <span className="sub">
                      {c.total} {c.total === 1 ? 'promo' : 'promos'}
                      {c.conCodigo > 0 && ` · ${c.conCodigo} con código`}
                    </span>
                  </div>
                  <Icono nombre={c.categorias[0]} tamano={16} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <PieDePagina total={cat.porCategoria ? Object.values(cat.porCategoria).reduce((a, b) => a + b, 0) : 0} conCodigo={cat.conCodigo} />
    </>
  );
}

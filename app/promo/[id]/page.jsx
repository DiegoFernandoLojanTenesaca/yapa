import Link from 'next/link';
import { notFound } from 'next/navigation';
import TarjetaPromo from '../../TarjetaPromo.jsx';
import BotonCodigo from '../../BotonCodigo.jsx';
import Compartir from '../../Compartir.jsx';
import PieDePagina from '../../PieDePagina.jsx';
import Icono from '../../Icono.jsx';
import { alternarFavorito } from '../../acciones.js';
import { sesion, obtenerPromo } from '../../../lib/almacen.js';
import { promosParecidas, idsFavoritas, catalogos } from '../../../lib/consultas.js';
import { rebaja } from '../../../lib/rebaja.js';
import { logoDe } from '../../../lib/logo.js';

export const dynamic = 'force-dynamic';

const enLetras = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

export default async function FichaPromo({ params }) {
  const { id } = await params;
  const promo = await obtenerPromo(decodeURIComponent(id));

  // Una promo despublicada o vencida no debe verse desde afuera.
  const hoy = new Date().toISOString().slice(0, 10);
  const visible = promo && promo.publicada !== false && promo.activa !== false;
  if (!visible) notFound();

  const [s, parecidas, cat] = await Promise.all([
    sesion(),
    promosParecidas(promo, 4),
    catalogos(),
  ]);
  const favoritas = await idsFavoritas(s?.user.id);

  const numero = rebaja(promo);
  const logo = logoDe(promo.url);
  const dias = promo.vence
    ? Math.round((new Date(promo.vence) - new Date(hoy)) / 86400000)
    : null;

  return (
    <>
      <div className="wrap">
        <nav className="miga">
          <Link href="/">Promos</Link>
          <span>›</span>
          <Link href={`/?categoria=${promo.categoria}`}>{promo.categoria}</Link>
          <span>›</span>
          <b>{promo.comercio}</b>
        </nav>

        <article className="ficha">
          <div className="fichaMedia">
            {promo.imagen ? (
              <img src={promo.imagen} alt="" />
            ) : (
              <div className="marcaComercio">
                {logo && <img className="logo" src={logo} alt="" />}
                <span className="inicial">{promo.comercio}</span>
              </div>
            )}
            {numero && <span className="rebajaGrande">{numero}</span>}
          </div>

          <div className="fichaTexto">
            <div className="meta">
              <span className="pill">
                <Icono nombre={promo.categoria} tamano={11} /> {promo.categoria}
              </span>
              {promo.banco && <span className="pill">{promo.banco}</span>}
              {promo.ciudad !== 'todo_el_pais' && (
                <span className="pill">{promo.ciudad.replace(/_/g, ' ')}</span>
              )}
              {promo.destacada && <span className="pill ac">Destacada</span>}
            </div>

            <p className="fichaComercio">{promo.comercio}</p>
            <h1>{promo.titulo}</h1>
            {promo.detalle && <p className="fichaDetalle">{promo.detalle}</p>}

            {promo.codigo && (
              <div className="cajaCodigo">
                <div>
                  <span className="etiquetaCodigo">Código de descuento</span>
                  <strong>{promo.codigo}</strong>
                </div>
                <BotonCodigo codigo={promo.codigo} url={promo.url} />
              </div>
            )}

            <dl className="datos">
              <div>
                <dt>Vigencia</dt>
                <dd className={dias !== null && dias <= 7 ? 'urgente' : ''}>
                  {promo.vence
                    ? dias <= 0
                      ? 'Vence hoy'
                      : `Hasta el ${enLetras(promo.vence)}${dias <= 7 ? ` · quedan ${dias} días` : ''}`
                    : 'Sin fecha publicada'}
                </dd>
              </div>
              <div>
                <dt>Dónde aplica</dt>
                <dd>
                  {promo.ciudad === 'todo_el_pais' ? 'Todo el país' : promo.ciudad.replace(/_/g, ' ')}
                </dd>
              </div>
              {promo.banco && (
                <div>
                  <dt>Cómo pagar</dt>
                  <dd>Con tarjeta {promo.banco}</dd>
                </div>
              )}
            </dl>

            <div className="fichaAcciones">
              <a className="btn" href={promo.url} target="_blank" rel="noopener noreferrer">
                Ir a la promo
              </a>

              {s && (
                <form action={alternarFavorito}>
                  <input type="hidden" name="promoId" value={promo.id} />
                  <button className="btn sec">
                    {favoritas.has(promo.id) ? '★ Guardada' : '☆ Guardar'}
                  </button>
                </form>
              )}
            </div>

            <Compartir titulo={promo.titulo} comercio={promo.comercio} />

            <p className="fichaNota">
              Yapa no canjea la promo: te lleva al comercio. Confirmá condiciones y vigencia
              antes de pagar.
            </p>
          </div>
        </article>

        {parecidas.length > 0 && (
          <>
            <h2 className="seccion">Parecidas a esta</h2>
            <div className="grid">
              {parecidas.map((p) => (
                <TarjetaPromo
                  key={p.id}
                  promo={p}
                  esFavorita={favoritas.has(p.id)}
                  haySesion={!!s}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <PieDePagina total={cat.porCategoria[promo.categoria] ?? 0} conCodigo={cat.conCodigo} />
    </>
  );
}

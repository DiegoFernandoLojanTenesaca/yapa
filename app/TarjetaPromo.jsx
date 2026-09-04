import Link from 'next/link';
import BotonCodigo from './BotonCodigo.jsx';
import { alternarFavorito } from './acciones.js';
import { rebaja } from '../lib/rebaja.js';
import { logoDe } from '../lib/logo.js';

const diasPara = (iso) =>
  iso ? Math.round((new Date(iso) - new Date(new Date().toISOString().slice(0, 10))) / 86400000) : null;

const enLetras = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });

export default function TarjetaPromo({ promo, esFavorita, haySesion }) {
  const d = diasPara(promo.vence);
  const numero = rebaja(promo);
  const logo = promo.imagen ? null : logoDe(promo.url);

  return (
    <article className={`promo${promo.destacada ? ' esDestacada' : ''}`}>
      <div className={`foto${promo.imagen ? '' : ' sinFoto'}`}>
        {promo.imagen ? (
          <img src={promo.imagen} alt="" loading="lazy" />
        ) : (
          // Sin imagen propia: el logo del comercio como portada.
          <div className="marcaComercio">
            {logo && <img className="logo" src={logo} alt="" loading="lazy" />}
            <span className="inicial">{promo.comercio}</span>
          </div>
        )}

        {promo.destacada && <span className="cinta">Destacada</span>}
        {numero && <span className="rebaja">{numero}</span>}

        {haySesion && (
          <form action={alternarFavorito}>
            <input type="hidden" name="promoId" value={promo.id} />
            <button
              className={`fav${esFavorita ? ' on' : ''}`}
              title={esFavorita ? 'Quitar de favoritas' : 'Guardar'}
              aria-label={esFavorita ? 'Quitar de favoritas' : 'Guardar'}
            >
              {esFavorita ? '★' : '☆'}
            </button>
          </form>
        )}
      </div>

      <div className="cuerpo">
        <div className="comercio">{promo.comercio}</div>
        <Link className="titulo" href={`/promo/${encodeURIComponent(promo.id)}`}>
          {promo.titulo}
        </Link>
        {promo.detalle && <div className="detalle">{promo.detalle}</div>}

        <div className="meta">
          <span className="pill">{promo.categoria}</span>
          {/* Solo el banco, que le dice al usuario qué tarjeta necesita. */}
          {promo.banco && <span className="pill">{promo.banco}</span>}
          {promo.ciudad !== 'todo_el_pais' && (
            <span className="pill">{promo.ciudad.replace(/_/g, ' ')}</span>
          )}
        </div>

        <div className="pie">
          <span className={`vence${d !== null && d <= 7 ? ' pronto' : ''}`}>
            {promo.vence
              ? d <= 0 ? 'vence hoy' : d <= 7 ? `vence en ${d}d` : `hasta ${enLetras(promo.vence)}`
              : 'sin fecha'}
          </span>

          {promo.codigo ? (
            <BotonCodigo codigo={promo.codigo} url={promo.url} />
          ) : (
            <a className="btn sec chico" href={promo.url} target="_blank" rel="noopener noreferrer">
              Ver promo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

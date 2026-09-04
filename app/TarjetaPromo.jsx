import BotonCodigo from './BotonCodigo.jsx';
import { alternarFavorito } from './acciones.js';

const diasPara = (iso) =>
  iso ? Math.round((new Date(iso) - new Date(new Date().toISOString().slice(0, 10))) / 86400000) : null;

const enLetras = (iso) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('es-EC', { day: 'numeric', month: 'short' });

export default function TarjetaPromo({ promo, esFavorita, haySesion }) {
  const d = diasPara(promo.vence);

  return (
    <article className={`promo${promo.destacada ? ' destacada' : ''}`}>
      {promo.imagen && <img src={promo.imagen} alt="" loading="lazy" />}

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

      <div className="cuerpo">
        <div className="meta">
          {promo.destacada && <span className="pill ac">Destacada</span>}
          <span className="pill">{promo.categoria}</span>
          {promo.banco && <span className="pill">{promo.banco}</span>}
        </div>

        <div className="comercio">{promo.comercio}</div>
        <div className="titulo">{promo.titulo}</div>
        {promo.detalle && <div className="detalle">{promo.detalle}</div>}

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

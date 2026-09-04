import Link from 'next/link';

const ETIQUETAS = {
  restaurantes: '🍔 Restaurantes',
  supermercados: '🛒 Supermercados',
  compras: '🛍️ Compras',
  viajes: '✈️ Viajes',
  entretenimiento: '🎬 Entretenimiento',
  salud: '💊 Salud',
  educacion: '🎓 Educación',
  hogar: '🛋️ Hogar',
  vehiculos: '🚗 Vehículos',
  delivery: '🛵 Delivery',
  otros: '✨ Otros',
};

/** Barra horizontal fija bajo la cabecera: navegación por categoría. */
export default function BarraCategorias({ categorias, porCategoria, activa, params }) {
  const conservar = (extra) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...params, ...extra })) if (v) q.set(k, String(v));
    return q.toString() ? `/?${q}` : '/';
  };

  return (
    <div className="barra">
      <div className="wrap">
        <div className="pista">
          <Link href={conservar({ categoria: '' })} className={`chip${activa ? '' : ' on'}`}>
            <b>Todas</b>
          </Link>

          {categorias.map((c) => (
            <Link
              key={c}
              href={conservar({ categoria: c })}
              className={`chip${activa === c ? ' on' : ''}`}
            >
              <b>{ETIQUETAS[c] ?? c}</b>
              <span className="n">{porCategoria[c]}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

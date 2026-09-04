'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Icono from './Icono.jsx';

const ETIQUETAS = {
  restaurantes: 'Restaurantes',
  supermercados: 'Supermercados',
  compras: 'Compras',
  delivery: 'Delivery',
  juegos: 'Juegos',
  viajes: 'Viajes',
  entretenimiento: 'Entretenimiento',
  salud: 'Salud',
  educacion: 'Educación',
  hogar: 'Hogar',
  vehiculos: 'Vehículos',
  otros: 'Otros',
};

/** Barra horizontal fija bajo la cabecera, con flechas para recorrerla. */
export default function BarraCategorias({ categorias, porCategoria, activa, params }) {
  const pista = useRef(null);
  const [puede, setPuede] = useState({ izq: false, der: false });

  function medir() {
    const el = pista.current;
    if (!el) return;
    setPuede({
      izq: el.scrollLeft > 4,
      der: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  }

  useEffect(() => {
    medir();
    // Al cambiar el ancho de la ventana pueden dejar de sobrar categorías.
    const obs = new ResizeObserver(medir);
    if (pista.current) obs.observe(pista.current);
    return () => obs.disconnect();
  }, [categorias]);

  const correr = (signo) =>
    pista.current?.scrollBy({ left: signo * pista.current.clientWidth * 0.7, behavior: 'smooth' });

  const conservar = (extra) => {
    const q = new URLSearchParams();
    // `p` se descarta: al cambiar de categoría volvés a la página 1.
    for (const [k, v] of Object.entries({ ...params, ...extra })) if (v && k !== 'p') q.set(k, String(v));
    return q.toString() ? `/?${q}` : '/';
  };

  return (
    <div className="barra">
      <div className="wrap barraCaja">
        <button
          className={`flecha izq${puede.izq ? '' : ' oculta'}`}
          onClick={() => correr(-1)}
          aria-label="Ver categorías anteriores"
          type="button"
        >
          ‹
        </button>

        <div className="pista" ref={pista} onScroll={medir}>
          <Link href={conservar({ categoria: '' })} className={`chip${activa ? '' : ' on'}`}>
            <b>Todas</b>
          </Link>

          {categorias.map((c) => (
            <Link
              key={c}
              href={conservar({ categoria: c })}
              className={`chip${activa === c ? ' on' : ''}`}
            >
              <Icono nombre={c} />
              <b>{ETIQUETAS[c] ?? c}</b>
              <span className="n">{porCategoria[c]}</span>
            </Link>
          ))}
        </div>

        <button
          className={`flecha der${puede.der ? '' : ' oculta'}`}
          onClick={() => correr(1)}
          aria-label="Ver más categorías"
          type="button"
        >
          ›
        </button>
      </div>
    </div>
  );
}

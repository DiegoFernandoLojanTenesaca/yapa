'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function Filtros({ origenes, ciudades, conCodigo, haySesion }) {
  const router = useRouter();
  const params = useSearchParams();
  const form = useRef(null);

  function aplicar() {
    const q = new URLSearchParams();
    // La categoría la maneja la barra de arriba: acá se conserva.
    if (params.get('categoria')) q.set('categoria', params.get('categoria'));
    for (const [k, v] of new FormData(form.current).entries()) if (v) q.set(k, v);
    router.push(q.toString() ? `/?${q}` : '/'); // sin `p`: cualquier filtro vuelve a la página 1
  }

  return (
    <form
      ref={form}
      className="buscador"
      onSubmit={(e) => {
        e.preventDefault();
        aplicar();
      }}
    >
      <input
        name="q"
        type="search"
        defaultValue={params.get('q') ?? ''}
        placeholder="Buscar comercio, promo o código…  ej: KFC, hotel, 2x1"
      />

      <select name="origen" defaultValue={params.get('origen') ?? ''} onChange={aplicar}>
        <option value="">Todas las fuentes</option>
        {origenes.map(({ valor, nombre }) => (
          <option key={valor} value={valor}>
            {nombre}
          </option>
        ))}
      </select>

      {ciudades.length > 1 && (
        <select name="ciudad" defaultValue={params.get('ciudad') ?? ''} onChange={aplicar}>
          <option value="">Todo Ecuador</option>
          {ciudades.map((c) => (
            <option key={c} value={c}>
              {c.replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      )}

      <div className="interruptores">
        {conCodigo > 0 && (
          <label className="check">
            <input
              type="checkbox"
              name="codigo"
              value="1"
              defaultChecked={params.get('codigo') === '1'}
              onChange={aplicar}
            />
            Con código ({conCodigo})
          </label>
        )}

        {haySesion && (
          <label className="check">
            <input
              type="checkbox"
              name="favoritas"
              value="1"
              defaultChecked={params.get('favoritas') === '1'}
              onChange={aplicar}
            />
            Mis favoritas
          </label>
        )}
      </div>

      <button className="btn" type="submit">
        Buscar
      </button>
    </form>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function Filtros({ categorias, bancos, ciudades, haySesion }) {
  const router = useRouter();
  const params = useSearchParams();
  const form = useRef(null);

  function aplicar() {
    const datos = new FormData(form.current);
    const q = new URLSearchParams();
    for (const [k, v] of datos.entries()) if (v) q.set(k, v);
    router.push(q.toString() ? `/?${q}` : '/');
  }

  const opciones = (lista) =>
    lista.map((v) => (
      <option key={v} value={v}>
        {v.replace(/_/g, ' ')}
      </option>
    ));

  return (
    <form ref={form} className="fila" style={{ margin: '20px 0 4px' }} onSubmit={(e) => (e.preventDefault(), aplicar())}>
      <input
        name="q"
        type="search"
        defaultValue={params.get('q') ?? ''}
        placeholder="Buscar comercio o promo…  ej: restaurante, viajes"
        style={{ flex: '3 1 240px' }}
      />

      <select name="categoria" defaultValue={params.get('categoria') ?? ''} onChange={aplicar}>
        <option value="">Todas las categorías</option>
        {opciones(categorias)}
      </select>

      <select name="banco" defaultValue={params.get('banco') ?? ''} onChange={aplicar}>
        <option value="">Todos los bancos</option>
        {opciones(bancos)}
      </select>

      {ciudades.length > 1 && (
        <select name="ciudad" defaultValue={params.get('ciudad') ?? ''} onChange={aplicar}>
          <option value="">Todo Ecuador</option>
          {opciones(ciudades)}
        </select>
      )}

      {haySesion && (
        <label className="check" style={{ flex: '0 0 auto', padding: '0 4px' }}>
          <input
            type="checkbox"
            name="favoritas"
            value="1"
            defaultChecked={params.get('favoritas') === '1'}
            onChange={aplicar}
          />
          Solo mis favoritas
        </label>
      )}

      <button className="btn sec" type="submit" style={{ flex: '0 0 auto' }}>
        Buscar
      </button>
    </form>
  );
}

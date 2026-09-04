'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useRef } from 'react';

export default function Filtros({ bancos, ciudades, haySesion }) {
  const router = useRouter();
  const params = useSearchParams();
  const form = useRef(null);

  function aplicar() {
    const q = new URLSearchParams();
    // La categoría la maneja la barra de arriba: acá se conserva.
    if (params.get('categoria')) q.set('categoria', params.get('categoria'));
    for (const [k, v] of new FormData(form.current).entries()) if (v) q.set(k, v);
    router.push(q.toString() ? `/?${q}` : '/');
  }

  const opciones = (lista) =>
    lista.map((v) => (
      <option key={v} value={v}>
        {v.replace(/_/g, ' ')}
      </option>
    ));

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
        placeholder="Buscar comercio o promo…  ej: KFC, hotel, supermercado"
      />

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
          Mis favoritas
        </label>
      )}

      <button className="btn" type="submit" style={{ flex: '0 0 auto' }}>
        Buscar
      </button>
    </form>
  );
}

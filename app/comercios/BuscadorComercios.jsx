'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function BuscadorComercios() {
  const router = useRouter();
  const params = useSearchParams();

  return (
    <form
      className="buscador"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get('q')?.toString().trim();
        router.push(q ? `/comercios?q=${encodeURIComponent(q)}` : '/comercios');
      }}
    >
      <input
        name="q"
        type="search"
        defaultValue={params.get('q') ?? ''}
        placeholder="Buscar comercio…  ej: KFC, Coral, Holiday Inn"
      />
      <button className="btn" type="submit">
        Buscar
      </button>
    </form>
  );
}

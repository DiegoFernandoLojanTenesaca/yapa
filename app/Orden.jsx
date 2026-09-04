'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ORDENES } from '../lib/ordenes.js';

export default function Orden({ base = '/' }) {
  const router = useRouter();
  const params = useSearchParams();

  function cambiar(valor) {
    const q = new URLSearchParams(params);
    if (valor) q.set('orden', valor);
    else q.delete('orden');
    q.delete('p'); // reordenar vuelve a la página 1
    router.push(q.toString() ? `${base}?${q}` : base);
  }

  return (
    <label className="orden">
      <span>Ordenar por</span>
      <select defaultValue={params.get('orden') ?? ''} onChange={(e) => cambiar(e.target.value)}>
        {ORDENES.map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>
    </label>
  );
}

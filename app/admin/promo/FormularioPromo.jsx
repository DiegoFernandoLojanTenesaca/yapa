'use client';

import { useActionState } from 'react';
import { guardarPromo } from '../../acciones.js';

const CATEGORIAS = [
  'restaurantes', 'compras', 'viajes', 'entretenimiento',
  'salud', 'educacion', 'delivery', 'otros',
];
const CIUDADES = ['todo_el_pais', 'quito', 'guayaquil', 'cuenca'];

export default function FormularioPromo({ promo }) {
  const [estado, enviar, pendiente] = useActionState(guardarPromo, null);
  const v = promo ?? {};

  return (
    <form action={enviar} className="caja" style={{ marginTop: 18, maxWidth: 680 }}>
      {estado?.error && <div className="aviso mal">{estado.error}</div>}
      {promo && <input type="hidden" name="id" value={promo.id} />}

      <div className="fila">
        <div className="campo">
          <label htmlFor="comercio">Comercio *</label>
          <input id="comercio" name="comercio" required defaultValue={v.comercio ?? ''} placeholder="KFC" />
        </div>
        <div className="campo">
          <label htmlFor="banco">Banco o fuente del beneficio</label>
          <input id="banco" name="banco" defaultValue={v.banco ?? ''} placeholder="Banco Pichincha" />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="titulo">Título *</label>
        <input id="titulo" name="titulo" required defaultValue={v.titulo ?? ''} placeholder="60% de descuento en combos" />
      </div>

      <div className="campo">
        <label htmlFor="detalle">Detalle</label>
        <input id="detalle" name="detalle" defaultValue={v.detalle ?? ''} placeholder="de lunes a jueves, solo en la app" />
      </div>

      <div className="fila">
        <div className="campo">
          <label htmlFor="categoria">Categoría</label>
          <select id="categoria" name="categoria" defaultValue={v.categoria ?? 'restaurantes'}>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="ciudad">Ciudad</label>
          <select id="ciudad" name="ciudad" defaultValue={v.ciudad ?? 'todo_el_pais'}>
            {CIUDADES.map((c) => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="vence">Vence</label>
          <input id="vence" name="vence" type="date" defaultValue={v.vence ?? ''} />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="codigo">Código de descuento</label>
        <input id="codigo" name="codigo" defaultValue={v.codigo ?? ''} placeholder="YAPA60" />
        <p className="sub" style={{ marginTop: 5 }}>
          Si lo llenás, la tarjeta muestra “Copiar código” y abre el enlace de abajo.
        </p>
      </div>

      <div className="campo">
        <label htmlFor="url">Enlace</label>
        <input id="url" name="url" type="url" defaultValue={v.url ?? ''} placeholder="https://…" />
      </div>

      <div className="campo">
        <label htmlFor="imagen">Imagen (URL)</label>
        <input id="imagen" name="imagen" type="url" defaultValue={v.imagen ?? ''} />
      </div>

      <div className="fila" style={{ margin: '4px 0 16px' }}>
        <label className="check" style={{ flex: '0 0 auto', marginRight: 18 }}>
          <input type="checkbox" name="publicada" defaultChecked={v.publicada ?? true} />
          Publicada
        </label>
        <label className="check" style={{ flex: '0 0 auto' }}>
          <input type="checkbox" name="destacada" defaultChecked={v.destacada ?? false} />
          Destacada
        </label>
      </div>

      <button className="btn" disabled={pendiente}>
        {pendiente ? 'Guardando…' : 'Guardar promo'}
      </button>
    </form>
  );
}

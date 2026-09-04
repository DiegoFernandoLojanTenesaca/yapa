import Link from 'next/link';
import { alternarCampo, borrarPromo } from '../../acciones.js';
import Paginacion from '../../Paginacion.jsx';
import { promosAdmin } from '../../../lib/consultas.js';
import { FUENTES } from '../../../lib/scraping.js';

export const dynamic = 'force-dynamic';

const ESTADOS = [
  ['', 'Todas'], ['ocultas', 'Ocultas'], ['vencidas', 'Vencidas'],
  ['inactivas', 'Ya no están en el origen'], ['editadas', 'Editadas a mano'], ['conCodigo', 'Con código'],
];

export default async function Promos({ searchParams }) {
  const sp = await searchParams;
  const todas = await promosAdmin({ q: sp.q, fuente: sp.fuente, estado: sp.estado });

  const POR_PAGINA = 40;
  const paginas = Math.max(1, Math.ceil(todas.length / POR_PAGINA));
  const pagina = Math.min(Math.max(1, Number(sp.p) || 1), paginas);
  const promos = todas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <>
      <h1>Promos</h1>
      <p className="sub">{todas.length} resultados{paginas > 1 && ` · página ${pagina} de ${paginas}`}</p>

      <form className="fila" style={{ margin: '18px 0' }}>
        <input name="q" defaultValue={sp.q ?? ''} placeholder="Buscar comercio o título…" />

        <select name="fuente" defaultValue={sp.fuente ?? ''}>
          <option value="">Todas las fuentes</option>
          <option value="manual">manual</option>
          {FUENTES.map((f) => <option key={f.fuente} value={f.fuente}>{f.fuente}</option>)}
        </select>

        <select name="estado" defaultValue={sp.estado ?? ''}>
          {ESTADOS.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
        </select>

        <button className="btn sec" style={{ flex: '0 0 auto' }}>Filtrar</button>
      </form>

      <div className="caja scroll">
        <table className="tabla">
          <thead>
            <tr><th>Comercio</th><th>Promo</th><th>Fuente</th><th>Vence</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            {promos.length === 0 && (
              <tr><td colSpan={6} className="sub">Nada con esos filtros.</td></tr>
            )}

            {promos.map((p) => (
              <tr key={p.id}>
                <td><strong>{p.comercio}</strong><br /><span className="mono">{p.banco ?? '—'}</span></td>
                <td style={{ maxWidth: 300 }}>{p.titulo}</td>
                <td className="mono">{p.fuente}</td>
                <td className="mono">{p.vence ?? '—'}</td>
                <td>
                  <div className="meta">
                    <span className="pill">{p.publicada ? 'publicada' : 'oculta'}</span>
                    {p.destacada && <span className="pill ac">destacada</span>}
                    {!p.activa && <span className="pill alerta">fuera del origen</span>}
                    {p.editada && <span className="pill">a mano</span>}
                  </div>
                </td>
                <td>
                  <div className="acciones">
                    <form action={alternarCampo}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="campo" value="publicada" />
                      <button className="btn sec chico">{p.publicada ? 'Ocultar' : 'Publicar'}</button>
                    </form>

                    <form action={alternarCampo}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="campo" value="destacada" />
                      <button className="btn sec chico">{p.destacada ? 'Quitar ★' : 'Destacar'}</button>
                    </form>

                    <Link className="btn sec chico" href={`/admin/promo?id=${encodeURIComponent(p.id)}`}>
                      Editar
                    </Link>

                    <form action={borrarPromo}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="btn mal chico">Borrar</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Paginacion pagina={pagina} paginas={paginas} params={sp} base="/admin/promos" />
    </>
  );
}

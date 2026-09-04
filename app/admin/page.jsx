import { correrScraperAhora } from '../acciones.js';
import { resumen, estadoFuentes, corridas as ultimasCorridas } from '../../lib/consultas.js';

export const dynamic = 'force-dynamic';

const cuando = (iso) =>
  iso ? new Date(iso).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export default async function Resumen() {
  const [r, fuentes, corridas] = await Promise.all([resumen(), estadoFuentes(), ultimasCorridas(10)]);

  const kpis = [
    ['Visibles', r.visibles], ['Total', r.total], ['Ocultas', r.ocultas],
    ['Vencidas', r.vencidas], ['Manuales', r.manuales], ['Usuarios', r.usuarios],
  ];

  return (
    <>
      <h1>Resumen</h1>
      <p className="sub">Estado del catálogo y de las fuentes de donde salen los datos.</p>

      <div className="tarjetas" style={{ marginTop: 18 }}>
        {kpis.map(([e, n]) => (
          <div className="kpi" key={e}>
            <div className="n">{n}</div>
            <div className="e">{e}</div>
          </div>
        ))}
      </div>

      <div className="seccion">De dónde salen los datos</div>

      {fuentes.map((f) => (
        <div className="caja" key={f.fuente}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <h2 style={{ marginRight: 'auto' }}>{f.banco}</h2>
            <span className={`pill${f.ultima?.error ? ' alerta' : ''}`}>
              {f.ultima?.error ? 'con error' : 'ok'}
            </span>
          </div>

          <p className="mono" style={{ margin: '7px 0 10px', wordBreak: 'break-all' }}>{f.url}</p>

          <p className="sub">
            {f.activas} activas de {f.total} guardadas · última corrida {cuando(f.ultima?.fecha)}
            {f.ultima && !f.ultima.error &&
              ` · ${f.ultima.encontradas} encontradas, ${f.ultima.nuevas} nuevas`}
          </p>

          {f.ultima?.error && <div className="aviso mal" style={{ marginTop: 10 }}>{f.ultima.error}</div>}
        </div>
      ))}

      <form action={correrScraperAhora} style={{ marginTop: 4 }}>
        <button className="btn">Actualizar promos ahora</button>
      </form>

      <div className="seccion">Últimas corridas</div>
      <div className="caja scroll">
        <table className="tabla">
          <thead>
            <tr><th>Fecha</th><th>Fuente</th><th>Encontradas</th><th>Nuevas</th><th>Archivadas</th><th>Resultado</th></tr>
          </thead>
          <tbody>
            {corridas.length === 0 && (
              <tr><td colSpan={6} className="sub">Todavía no corrió el scraper.</td></tr>
            )}
            {corridas.map((c) => (
              <tr key={c.id}>
                <td className="mono">{cuando(c.fecha)}</td>
                <td>{c.fuente}</td>
                <td>{c.encontradas}</td>
                <td>{c.nuevas}</td>
                <td>{c.archivadas}</td>
                <td>{c.error ? <span style={{ color: 'var(--mal)' }}>{c.error}</span> : 'ok'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

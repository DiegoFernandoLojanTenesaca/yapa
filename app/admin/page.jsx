import Link from 'next/link';
import { correrScraperAhora } from '../acciones.js';
import { resumen, estadoFuentes, corridas as ultimasCorridas, topComercios } from '../../lib/consultas.js';

export const dynamic = 'force-dynamic';

const cuando = (iso) =>
  iso ? new Date(iso).toLocaleString('es-EC', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca';

const haceCuanto = (iso) => {
  if (!iso) return null;
  const horas = Math.floor((Date.now() - new Date(iso)) / 3600000);
  if (horas < 1) return 'recién';
  if (horas < 24) return `hace ${horas} h`;
  return `hace ${Math.floor(horas / 24)} d`;
};

export default async function Resumen() {
  const [r, fuentes, corridas, top] = await Promise.all([
    resumen(),
    estadoFuentes(),
    ultimasCorridas(12),
    topComercios(8),
  ]);

  const kpis = [
    ['Visibles', r.visibles, 'lo que ve la gente'],
    ['Con código', r.conCodigo, 'canjeables'],
    ['Total', r.total, 'en la base'],
    ['Ocultas', r.ocultas, 'despublicadas'],
    ['Vencidas', r.vencidas, 'ya no sirven'],
    ['A mano', r.manuales, 'cargadas por vos'],
  ];

  const conError = fuentes.filter((f) => f.ultima?.error);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ marginRight: 'auto' }}>
          <h1>Resumen</h1>
          <p className="sub">Estado del catálogo y de las fuentes.</p>
        </div>
        <form action={correrScraperAhora}>
          <button className="btn">Actualizar promos ahora</button>
        </form>
      </div>

      {conError.length > 0 && (
        <div className="aviso mal" style={{ marginTop: 16 }}>
          {conError.length === 1
            ? `La fuente ${conError[0].nombre} falló en su última corrida.`
            : `${conError.length} fuentes fallaron en su última corrida.`}{' '}
          Suele significar que cambiaron su sitio.
        </div>
      )}

      <div className="tarjetas" style={{ marginTop: 18 }}>
        {kpis.map(([e, n, nota]) => (
          <div className="kpi" key={e}>
            <div className="n">{n}</div>
            <div className="e">{e}</div>
            <div className="nota">{nota}</div>
          </div>
        ))}
      </div>

      <h2 className="seccion">De dónde salen los datos</h2>

      <div className="fuentes">
        {fuentes.map((f) => (
          <div className={`caja fuente${f.ultima?.error ? ' malFuente' : ''}`} key={f.fuente}>
            <div className="cabFuente">
              <h2>{f.nombre}</h2>
              <span className={`pill${f.ultima?.error ? ' alerta' : ' ac'}`}>
                {f.ultima?.error ? 'con error' : 'ok'}
              </span>
            </div>

            <div className="numFuente">
              <span>
                <b>{f.activas}</b> activas
              </span>
              {f.conCodigo > 0 && (
                <span>
                  <b>{f.conCodigo}</b> con código
                </span>
              )}
              <span>
                <b>{f.total}</b> guardadas
              </span>
            </div>

            <p className="sub">
              Última corrida {haceCuanto(f.ultima?.fecha) ?? 'nunca'}
              {f.ultima && !f.ultima.error && ` · ${f.ultima.encontradas} encontradas, ${f.ultima.nuevas} nuevas`}
            </p>

            {f.ultima?.error && <div className="aviso mal" style={{ marginTop: 10 }}>{f.ultima.error}</div>}

            <Link className="btn sec chico" href={`/admin/promos?fuente=${f.fuente}`} style={{ marginTop: 12 }}>
              Ver sus promos
            </Link>
          </div>
        ))}
      </div>

      <div className="dosCol">
        <div>
          <h2 className="seccion">Comercios con más promos</h2>
          <div className="caja">
            {top.length === 0 && <p className="sub">Todavía no hay datos.</p>}
            {top.map((c) => (
              <div className="barraComercio" key={c.comercio}>
                <Link href={`/admin/promos?q=${encodeURIComponent(c.comercio)}`}>{c.comercio}</Link>
                <div className="riel">
                  <div className="relleno" style={{ width: `${(c.total / top[0].total) * 100}%` }} />
                </div>
                <b>{c.total}</b>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="seccion">Últimas corridas</h2>
          <div className="caja scroll">
            <table className="tabla">
              <thead>
                <tr><th>Cuándo</th><th>Fuente</th><th>Halladas</th><th>Nuevas</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {corridas.length === 0 && (
                  <tr><td colSpan={5} className="sub">Todavía no corrió el scraper.</td></tr>
                )}
                {corridas.map((c) => (
                  <tr key={c.id}>
                    <td className="mono">{cuando(c.fecha)}</td>
                    <td>{c.fuente}</td>
                    <td>{c.encontradas}</td>
                    <td>{c.nuevas}</td>
                    <td>
                      {c.error
                        ? <span className="pill alerta">error</span>
                        : <span className="pill">ok</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

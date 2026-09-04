import Link from 'next/link';

/** Ventana de páginas alrededor de la actual, para no imprimir 40 números. */
function ventana(actual, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, actual, actual - 1, actual + 1]);
  if (actual <= 3) [2, 3, 4].forEach((p) => paginas.add(p));
  if (actual >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => paginas.add(p));

  return [...paginas].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
}

export default function Paginacion({ pagina, paginas, params, base = '/' }) {
  if (paginas <= 1) return null;

  const enlace = (p) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v && k !== 'p') q.set(k, String(v));
    if (p > 1) q.set('p', String(p));
    return q.toString() ? `${base}?${q}` : base;
  };

  const lista = ventana(pagina, paginas);

  return (
    <nav className="paginacion" aria-label="Paginación">
      {pagina > 1 && (
        <Link className="pag" href={enlace(pagina - 1)} rel="prev">
          ← Anterior
        </Link>
      )}

      {lista.map((p, i) => (
        <span key={p} style={{ display: 'contents' }}>
          {i > 0 && lista[i - 1] !== p - 1 && <span className="salto">…</span>}
          <Link className={`pag num${p === pagina ? ' on' : ''}`} href={enlace(p)}>
            {p}
          </Link>
        </span>
      ))}

      {pagina < paginas && (
        <Link className="pag" href={enlace(pagina + 1)} rel="next">
          Siguiente →
        </Link>
      )}
    </nav>
  );
}

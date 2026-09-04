'use client';

import { useState } from 'react';

/**
 * Compartir la promo. Usa el menú nativo del teléfono si existe, y si no
 * cae a WhatsApp, que es por donde de verdad circulan las promos acá.
 */
export default function Compartir({ titulo, comercio }) {
  const [copiado, setCopiado] = useState(false);

  const texto = `${comercio}: ${titulo}`;
  const enlace = typeof window === 'undefined' ? '' : window.location.href;

  async function nativo() {
    try {
      await navigator.share({ title: 'Yapa', text: texto, url: enlace });
    } catch {
      // El usuario canceló el menú: no es un error que valga mostrar.
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(`${texto} — ${enlace}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {}
  }

  return (
    <div className="compartir">
      <span className="etiquetaCompartir">Compartir</span>

      <a
        className="btn sec chico"
        href={`https://wa.me/?text=${encodeURIComponent(`${texto}\n${enlace}`)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        WhatsApp
      </a>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button className="btn sec chico" onClick={nativo} type="button">
          Más…
        </button>
      )}

      <button className="btn sec chico" onClick={copiar} type="button">
        {copiado ? '¡Copiado!' : 'Copiar enlace'}
      </button>
    </div>
  );
}

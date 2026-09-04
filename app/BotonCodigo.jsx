'use client';

import { useState } from 'react';

/**
 * Lo más cerca de "aplicar el descuento directo" que se puede llegar sin ser
 * socio comercial del local: copiamos el código y abrimos su sitio o app.
 */
export default function BotonCodigo({ codigo, url }) {
  const [copiado, setCopiado] = useState(false);

  async function copiarYAbrir() {
    try {
      await navigator.clipboard.writeText(codigo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2200);
    } catch {
      // Sin permiso de portapapeles: al menos abrimos la promo.
    }
    if (url) setTimeout(() => window.open(url, '_blank', 'noopener'), 350);
  }

  return (
    <button className="btn chico" onClick={copiarYAbrir}>
      {copiado ? '¡Copiado!' : `Copiar ${codigo}`}
    </button>
  );
}

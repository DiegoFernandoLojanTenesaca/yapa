/**
 * El gancho de una promo es el número. Lo sacamos del texto para mostrarlo
 * grande en la tarjeta, en vez de esconderlo dentro del título.
 */
export function rebaja({ titulo, detalle }) {
  const texto = `${titulo ?? ''} ${detalle ?? ''}`;

  const porcentaje = /(\d{1,3})\s*%/.exec(texto);
  if (porcentaje) return `${porcentaje[1]}%`;

  const dosPorUno = /\b(\d)\s*x\s*(\d)\b/i.exec(texto);
  if (dosPorUno) return `${dosPorUno[1]}x${dosPorUno[2]}`;

  const dolares = /\$\s?(\d+(?:[.,]\d+)?)/.exec(texto);
  if (dolares) return `$${dolares[1]}`;

  return null;
}

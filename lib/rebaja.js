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

/**
 * La rebaja como número, solo para ordenar. Un "2x1" vale 50 porque es lo que
 * te ahorrás; los montos en dólares no se pueden comparar sin saber el precio
 * original, así que van al fondo.
 */
export function valorRebaja(promo) {
  const texto = rebaja(promo);
  if (!texto) return -1;

  if (texto.endsWith('%')) return Number(texto.slice(0, -1));

  const nxn = /^(\d)x(\d)$/.exec(texto);
  if (nxn) return Math.round((1 - Number(nxn[2]) / Number(nxn[1])) * 100);

  return 0;
}

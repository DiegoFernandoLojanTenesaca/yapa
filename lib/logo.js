/**
 * Logo del comercio a partir del dominio al que apunta la promo.
 *
 * Se usa el servicio de iconos de DuckDuckGo en vez de colgarse de las
 * imágenes del sitio de origen. Devuelve null si la URL no sirve, y en ese
 * caso la tarjeta cae al nombre del comercio.
 */
export function logoDe(url) {
  if (!url) return null;

  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    return `https://icons.duckduckgo.com/ip3/${host}.ico`;
  } catch {
    return null;
  }
}

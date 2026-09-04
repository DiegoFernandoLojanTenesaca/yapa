import * as cheerio from 'cheerio';

export const fuente = 'cuponesecuador';
export const origen = 'CuponesEcuador';
export const url = 'https://www.cuponesecuador.com.ec/';

// Es un agregador, no un banco: sus promos no dependen de ninguna tarjeta.
export const banco = null;

/**
 * El sitio no clasifica sus cupones, así que los ordenamos por palabras clave
 * del comercio y del título. Sin esto todo cae en "otros" y la barra de
 * categorías queda inservible.
 */
const REGLAS = [
  [/pedidosya|rappi|uber\s?eats|domicilio|delivery/i, 'delivery'],
  [/pizza|burger|kfc|mcdonald|sushi|pollo|resta|caf[eé]|helad/i, 'restaurantes'],
  [/despegar|vuelo|hotel|viaj|booking|avianca|latam|holafly|turismo/i, 'viajes'],
  [/farmac|pharmac|salud|cl[ií]nic|[oó]ptic|dental/i, 'salud'],
  [/supermerc|comisariato|coral|santa\s?mar[ií]a|mi\s?tienda|akí/i, 'supermercados'],
  [/kywi|promart|constru|mueble|hogar|ferreter|electrodom|artefacta/i, 'hogar'],
  [/llanta|neum[aá]tic|automot|taller|veh[ií]cul/i, 'vehiculos'],
  [/edx|curso|udemy|coursera|academ|idioma|universidad/i, 'educacion'],
  [/netflix|disney|cine|spotify|gaming|kinguin|juego|streaming/i, 'entretenimiento'],
  [/nordvpn|norton|hostinger|vpn|antivirus|dominio|software/i, 'compras'],
];

const clasificar = (texto) => REGLAS.find(([re]) => re.test(texto))?.[1] ?? 'compras';

const ACRONIMOS = new Set(['kfc', 'hm', 'bk', 'ups', 'dhl']);

const nombreComercio = (slug) =>
  slug
    .replace(/-ecuador$/, '')
    .split('-')
    .map((p) => (ACRONIMOS.has(p) ? p.toUpperCase() : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');

const aISO = (texto) => {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(texto ?? '');
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

const REDIRECTORES = /(^|\.)(linksprf|awin1|awin|shareasale|tradedoubler|admitad|dpbolvw|anrdoezrs|kqzyfj|jdoqocy)\.(com|net)$/i;

/**
 * El botón apunta a un redirector de afiliado con la clave de ELLOS. Sacamos
 * el destino real para no monetizarle el clic a un tercero. Si el enlace no
 * expone el destino, mandamos a su propia página del cupón: es su dato y así
 * queda acreditado, en vez de pasar por su enlace de afiliado.
 */
const destinoReal = (deeplink, paginaFuente) => {
  if (!deeplink) return paginaFuente;

  try {
    const u = new URL(deeplink.replace(/&#0?38;/g, '&'));
    const destino = u.searchParams.get('url');
    if (destino && !REDIRECTORES.test(new URL(destino).hostname)) return destino;
    return REDIRECTORES.test(u.hostname) ? paginaFuente : deeplink;
  } catch {
    return paginaFuente;
  }
};

export function scrape(html) {
  const $ = cheerio.load(html);
  const vistos = new Set();

  return $('div.coupon')
    .map((_, el) => {
      const $el = $(el);
      const $titulo = $el.find('.coupon-title a').first();
      const $boton = $el.find('a.coupon-btn').first();

      const id = $titulo.attr('data-id') ?? $boton.attr('data-id');
      const titulo = ($titulo.attr('data-title') ?? $titulo.text()).trim();
      if (!id || !titulo) return null;

      const tienda = /\/tienda\/([a-z0-9-]+)\//i.exec($el.find('.coupon-store-link a').attr('href') ?? '')?.[1];
      const comercio = tienda ? nombreComercio(tienda) : 'Varios';
      const codigo = ($titulo.attr('data-code') ?? $boton.attr('data-code') ?? '').trim() || null;
      const detalle = ($titulo.attr('data-terms') ?? $el.find('.coupon-desc p').first().text()).trim();

      return {
        id: `${fuente}:${id}`,
        fuente,
        banco,
        comercio,
        titulo,
        detalle: detalle || null,
        categoria: clasificar(`${comercio} ${titulo} ${detalle}`),
        ciudad: 'todo_el_pais',
        vence: aISO($el.find('.coupon-expiry').text()),
        codigo,
        url: destinoReal($boton.attr('data-deeplink'), $titulo.attr('href')),
        imagen: null, // Solo publican el logo de la tienda, no una imagen de la promo.
      };
    })
    .get()
    .filter((p) => {
      if (!p || vistos.has(p.id)) return false;
      vistos.add(p.id);
      return true;
    });
}

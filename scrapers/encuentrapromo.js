import * as cheerio from 'cheerio';

export const fuente = 'encuentrapromo';
export const origen = 'EncuentraPromo';
export const url = 'https://encuentrapromo.com.ec/';

// Agregador de comunidad, no un banco: sus promos no dependen de una tarjeta.
export const banco = null;

const BASE = 'https://encuentrapromo.com.ec';

const REGLAS = [
  [/pedidosya|rappi|uber\s?eats|domicilio|delivery/i, 'delivery'],
  [/pizza|burger|kfc|mcdonald|sushi|pollo|resta|caf[eé]|helad|alitas|combo/i, 'restaurantes'],
  [/vuelo|hotel|viaj|avianca|latam|despegar|turismo|hoster/i, 'viajes'],
  [/farmac|salud|cl[ií]nic|[oó]ptic|dental|fybeca|sana\s?sana/i, 'salud'],
  [/supermerc|comisariato|coral|santa\s?mar[ií]a|akí|tía/i, 'supermercados'],
  [/constru|mueble|hogar|ferreter|electrodom|kywi|promart/i, 'hogar'],
  [/llanta|neum[aá]tic|automot|taller|veh[ií]cul/i, 'vehiculos'],
  [/curso|academ|idioma|universidad|colegio|matr[ií]cula/i, 'educacion'],
  [/netflix|disney|cine|spotify|gaming|juego|streaming|concierto/i, 'entretenimiento'],
];

const clasificar = (texto) => REGLAS.find(([re]) => re.test(texto))?.[1] ?? 'compras';

export function scrape(html) {
  const $ = cheerio.load(html);
  const vistos = new Set();

  return $('.grid-item')
    .map((_, el) => {
      const $el = $(el);
      const $enlace = $el.find('a.product-title-link').first();
      const titulo = $enlace.find('.field-item, .field-name').first().text().trim() || $enlace.text().trim();
      const href = $enlace.attr('href');
      if (!titulo || !href) return null;

      // El id estable es el del nodo de Drupal, que asoma en el botón de favorito.
      const id =
        /js-flag-epromo-wishlist-(\d+)/.exec($el.html() ?? '')?.[1] ??
        href.split('/').filter(Boolean).pop();

      const comercio = $el.find('.product-attribute a').first().text().trim();
      // La insignia trae el número: "Descuento 60%". Alimenta la rebaja grande.
      const insignia = $el.find('.product-badge .badge').first().text().trim();
      const imagen = $el.find('.product-image img').first().attr('src');

      return {
        id: `${fuente}:${id}`,
        fuente,
        banco,
        comercio: comercio || 'Varios',
        titulo,
        detalle: insignia || null,
        categoria: clasificar(`${comercio} ${titulo}`),
        ciudad: 'todo_el_pais',
        vence: null, // No lo publican en el listado.
        codigo: null, // El código vive en la página de detalle.
        url: new URL(href, BASE).href,
        imagen: imagen ? new URL(imagen, BASE).href : null,
      };
    })
    .get()
    .filter((p) => {
      if (!p || vistos.has(p.id)) return false;
      vistos.add(p.id);
      return true;
    });
}

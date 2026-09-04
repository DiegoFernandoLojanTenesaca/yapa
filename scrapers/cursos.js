import * as cheerio from 'cheerio';

export const fuente = 'cursos';
export const origen = 'Cursos con cupón';
export const banco = null;
export const url = 'https://www.discudemy.com/all';

const IDIOMAS = { english: 'inglés', spanish: 'español', portuguese: 'portugués' };

/** "$64->$0" en la meta de la tarjeta: normal y rebajado, en ese orden. */
function descuento(texto) {
  const montos = [...texto.matchAll(/\$\s*([\d.,]+)/g)].map((m) => Number(m[1].replace(',', '')));
  if (montos.length < 2 || !Number.isFinite(montos[0]) || montos[0] <= 0) return null;

  const [normal, rebajado] = montos;
  if (rebajado === 0) return `Gratis · antes $${normal}`;

  const off = Math.round((1 - rebajado / normal) * 100);
  return off >= 20 ? `${off}% OFF · de $${normal} a $${rebajado}` : null;
}

export function scrape(html) {
  const $ = cheerio.load(html);
  const vistos = new Set();

  return $('section.card')
    .map((_, el) => {
      const $el = $(el);
      const $titulo = $el.find('a.card-header').first();
      const titulo = $titulo.text().trim();
      const href = $titulo.attr('href');
      if (!titulo || !href) return null;

      const detalle = descuento($el.find('.meta').text());
      // Sin rebaja legible no hay promo que mostrar.
      if (!detalle) return null;

      const idioma = IDIOMAS[$el.find('label.disc-fee').text().trim().toLowerCase()];
      const slug = href.split('/').filter(Boolean).pop();

      return {
        id: `${fuente}:${slug}`,
        fuente,
        banco,
        comercio: 'Udemy',
        titulo,
        detalle: idioma ? `${detalle} · en ${idioma}` : detalle,
        categoria: 'educacion',
        ciudad: 'todo_el_pais',
        // Los cupones de cursos vuelan en horas, pero no publican la hora exacta.
        vence: null,
        codigo: null,
        url: href,
        imagen: null,
      };
    })
    .get()
    .filter((p) => {
      if (!p || vistos.has(p.id)) return false;
      vistos.add(p.id);
      return true;
    });
}

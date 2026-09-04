import * as cheerio from 'cheerio';

export const fuente = 'produbanco';
export const banco = 'Produbanco';
export const origen = 'Produbanco';
export const url = 'https://www.produbanco.com.ec/banca-personas/promociones/';

// El nombre del comercio no está en ningún campo propio: viene en el alt de la
// imagen, siempre como "<comercio> produbanco <DDMMYY> p".
const comercio = (alt) =>
  alt
    .replace(/\s*produbanco\s*\d{4,8}\s*p?\s*$/i, '')
    // Palabras de maquetación que se cuelan en el nombre del archivo.
    .replace(/\s+(portada|banner|slider|home)\s*$/i, '')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const aISO = (s) => {
  const m = /(\d{2})\/(\d{2})\/(\d{4})/.exec(s || '');
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
};

export function scrape(html) {
  const $ = cheerio.load(html);

  return $('section.filter_item > article > article')
    .map((_, el) => {
      const $el = $(el);
      const href = $el.find('a').attr('href') || '';
      const id = /[?&]=(\d+)/.exec(href)?.[1];
      const alt = $el.find('img').attr('alt') || '';

      return {
        id: `${fuente}:${id ?? alt.replace(/\s+/g, '-')}`,
        fuente,
        banco,
        comercio: comercio(alt),
        titulo: $el.find('h4').first().text().trim(),
        detalle: $el.find('p').first().text().trim(),
        categoria: ($el.attr('class') || '').trim().split(/\s+/)[0] || 'otros',
        // Produbanco no segmenta por ciudad: todas sus promos son nacionales.
        ciudad: 'todo_el_pais',
        vence: aISO($el.find('span').first().text()),
        codigo: null,
        url: href ? new URL(href, url).href : url,
        imagen: new URL($el.find('img').attr('src') || '/', url).href,
      };
    })
    .get()
    .filter((p) => p.titulo);
}

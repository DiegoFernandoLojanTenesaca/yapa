import * as cheerio from 'cheerio';

export const fuente = 'pacifico';
export const banco = 'Banco del Pacífico';
export const url = 'https://www.bancodelpacifico.com/promociones/beneficios-pacificard';

const BASE = 'https://www.bancodelpacifico.com';

// Cada banco usa su propia taxonomía. Sin este mapeo los filtros del sitio
// se parten en vocabularios incompatibles.
const CATEGORIAS = {
  'e-commerce': 'compras',
  supermercados: 'supermercados',
  centros_medicos: 'salud',
  farmacias: 'salud',
  hoteles: 'viajes',
  aerolineas: 'viajes',
  agencias_de_viaje: 'viajes',
  restaurantes: 'restaurantes',
  muebleria: 'hogar',
  hogar: 'hogar',
  zapaterias: 'compras',
  ropa: 'compras',
  llanteras: 'vehiculos',
  automotriz: 'vehiculos',
  entretenimiento: 'entretenimiento',
  educacion: 'educacion',
};

const sinTildes = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const normalizarCategoria = (texto) => {
  const clave = sinTildes(texto.toLowerCase()).trim().replace(/\s+/g, '_');
  return CATEGORIAS[clave] ?? CATEGORIAS[clave.replace(/s$/, '')] ?? 'otros';
};

// El comercio no tiene campo propio: es el nombre del archivo de imagen.
// "/…/Establecimientos/Coral-Hipermercados.jpg" -> "Coral Hipermercados"
const comercioDesdeImagen = (src) => {
  const archivo = /\/([^/?]+)\.(?:jpg|jpeg|png|webp)/i.exec(src ?? '')?.[1];
  if (!archivo) return null;

  return archivo
    .replace(/_\d+$/, '') // sufijo de versión: mi-comisariato_1
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((p) => (p.length <= 3 && p === p.toUpperCase() ? p : p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()))
    .join(' ');
};

export function scrape(html) {
  const $ = cheerio.load(html);
  const vistos = new Set();

  return $('div.itemPromos')
    .map((_, el) => {
      const $el = $(el);
      const href = $el.find('a[href]').first().attr('href') ?? '';
      const titulo = $el.find('.contentPromo a').first().text().trim();
      const src = $el.find('img').first().attr('src') ?? '';

      // El id sale del slug del enlace: estable entre corridas.
      const slug = href.split('/').filter(Boolean).pop();
      if (!titulo || !slug) return null;

      return {
        id: `${fuente}:${slug}`,
        fuente,
        banco,
        comercio: comercioDesdeImagen(src) ?? titulo,
        titulo,
        detalle: null,
        categoria: normalizarCategoria($el.find('.markCategory').text()),
        // El listado general no segmenta por ciudad.
        ciudad: 'todo_el_pais',
        vence: null, // Pacífico no publica la vigencia en el listado.
        codigo: null,
        url: new URL(href, BASE).href,
        imagen: src ? new URL(src, BASE).href : null,
      };
    })
    .get()
    .filter((p) => {
      // La misma promo aparece repetida en varias franjas de la página.
      if (!p || vistos.has(p.id)) return false;
      vistos.add(p.id);
      return true;
    });
}

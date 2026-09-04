/** Hace la app instalable en el teléfono ("Agregar a pantalla de inicio"). */
export default function manifest() {
  return {
    name: 'Yapa — promos y descuentos de Ecuador',
    short_name: 'Yapa',
    description:
      'Todas las promociones y descuentos de Ecuador en un solo lugar. No pagues de más.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e1013',
    theme_color: '#da291c',
    lang: 'es-EC',
    categories: ['shopping', 'food', 'lifestyle'],
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

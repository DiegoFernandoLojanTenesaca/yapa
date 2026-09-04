/**
 * Órdenes del listado. Vive aparte de consultas.js porque el selector es un
 * componente de cliente: importarlo desde ahí arrastraría el acceso a datos
 * al navegador.
 */
export const ORDENES = [
  ['', 'Recomendadas'],
  ['vence', 'Vencen primero'],
  ['descuento', 'Mayor descuento'],
  ['nuevas', 'Recién agregadas'],
  ['az', 'Comercio A–Z'],
];

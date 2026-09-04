/**
 * Texto comparable: sin tildes y en minúsculas.
 *
 * Se aplica a los dos lados de la búsqueda. Sin esto, buscar "pacifico" no
 * encuentra "Banco del Pacífico" y buscar "Educación" no encuentra nada,
 * porque las categorías se guardan sin tilde.
 */
export const normalizar = (s) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

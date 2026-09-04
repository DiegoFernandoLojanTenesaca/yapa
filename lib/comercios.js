/**
 * Nombre de comercio a fragmento de URL. "Banco del Pacífico" -> "banco-del-pacifico".
 * Se usa para armar los enlaces y también para resolverlos, así que tiene que
 * dar siempre el mismo resultado.
 */
export const slugComercio = (nombre) =>
  (nombre ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

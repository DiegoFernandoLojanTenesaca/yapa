import { normalizar } from './texto.js';

/**
 * Nombre de comercio a fragmento de URL. "Banco del Pacífico" -> "banco-del-pacifico".
 * Se usa para armar los enlaces y también para resolverlos, así que tiene que
 * dar siempre el mismo resultado.
 */
export const slugComercio = (nombre) =>
  normalizar(nombre)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Etapa de la versión que se publica (Fase 9).
 *
 * Fernando decidió el 2026-11-03 publicar una primera versión BETA con el arte
 * temporal de uso gratuito, aclarando que no es un producto terminado y que
 * ese arte no es nuestro. Cuando todo el arte y el audio sean definitivos,
 * esto pasa a `'final'` y el aviso del menú desaparece.
 */
/**
 * Nombre público del juego (decisión de Fernando, 2026-11-04: antes se llamaba
 * "PAC-BIG-MAN"). Se usa en el menú, en los créditos y en el nombre del .zip,
 * así que cambiarlo aquí lo cambia en todas partes a la vez.
 */
export const GAME_TITLE = 'Search and Run';

/** El mismo nombre en minúsculas y con guiones, para nombres de archivo. */
export const GAME_SLUG = 'search-and-run';

export type ReleaseStage = 'beta' | 'final';

export const RELEASE_STAGE: ReleaseStage = 'beta';

/** Aviso que se muestra en el menú mientras la versión es beta (una línea por elemento). */
export const BETA_NOTICE: readonly string[] = [
  'Versión BETA: no es un producto terminado.',
  'Arte temporal de terceros, de uso gratuito (ver créditos).',
];

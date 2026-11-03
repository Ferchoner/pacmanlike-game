/**
 * Etapa de la versión que se publica (Fase 9).
 *
 * Fernando decidió el 2026-11-03 publicar una primera versión BETA con el arte
 * temporal de uso gratuito, aclarando que no es un producto terminado y que
 * ese arte no es nuestro. Cuando todo el arte y el audio sean definitivos,
 * esto pasa a `'final'` y el aviso del menú desaparece.
 */
export type ReleaseStage = 'beta' | 'final';

export const RELEASE_STAGE: ReleaseStage = 'beta';

/** Aviso que se muestra en el menú mientras la versión es beta (una línea por elemento). */
export const BETA_NOTICE: readonly string[] = [
  'Versión BETA: no es un producto terminado.',
  'Arte temporal de terceros, de uso gratuito (ver créditos).',
];

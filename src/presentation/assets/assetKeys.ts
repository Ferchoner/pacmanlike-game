/**
 * Nombres que el CÓDIGO espera encontrar en el manifest.
 *
 * Es el "contrato" entre los datos y el juego: el manifest dice dónde está
 * el archivo y cómo se corta; aquí se dice qué papel cumple en el juego.
 * Si un nombre no está cargado, la vista correspondiente usa su TEMP.
 */

/** Personajes animados (`load.actor`, o la `key` si no hay actor). */
export const Actors = {
  /** R-001…R-004: idle, walk, damage, death (pueden ir en uno o varios PNG). */
  player: 'player',
  /** R-005 (y R-006 si llega). */
  hunter: 'hunter',
  /** R-007 (y R-008). */
  patrol: 'patrol',
} as const;

/**
 * Frames sueltos con nombre (`load.namedFrames` de un spritesheet, o una
 * imagen cuya `key` sea este nombre).
 */
export const Frames = {
  /** R-009: suelo; las variantes son opcionales y se reparten por el mapa. */
  floor: 'floor',
  floorVariants: ['floor-2', 'floor-3', 'floor-4'],
  /** R-010: pared vista desde arriba y cara frontal (pared con suelo debajo). */
  wallTop: 'wall-top',
  wallSide: 'wall-side',
  /** R-012. */
  gem: 'gem',
  /** R-013 / R-014. */
  exitClosed: 'exit-closed',
  exitOpen: 'exit-open',
  /** R-015. */
  heartFull: 'heart-full',
  heartEmpty: 'heart-empty',
} as const;

/**
 * Eventos del juego que suenan. La clave del audio en el manifest es el
 * mismo nombre que ya usa su columna `animation_or_event` (R-020…R-024),
 * así la tabla de recursos y el código hablan el mismo idioma.
 */
export const SoundEvents = [
  'gem:collected',
  'player:damaged',
  'player:died',
  'exit:unlocked',
  'level:completed',
] as const;
export type SoundEvent = (typeof SoundEvents)[number];

/** R-019: música del nivel (bucle). */
export const MUSIC_LEVEL_KEY = 'music:level';

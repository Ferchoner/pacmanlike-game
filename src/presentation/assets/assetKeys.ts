/**
 * Claves que el CÓDIGO espera encontrar en `load.key` del manifest.
 *
 * Es el "contrato" entre los datos y el juego: el manifest dice dónde está
 * el archivo y cómo se corta; aquí se dice qué papel cumple en el juego.
 * Si una clave no está cargada, la vista correspondiente usa su TEMP.
 */
export const TextureKeys = {
  /** R-001…R-004: un spritesheet con idle, walk, damage y death (las 4 entradas comparten clave y archivo). */
  player: 'player',
  /** R-005 (y R-006 si llega). */
  hunter: 'hunter',
  /** R-007 (y R-008 si llega). */
  patrol: 'patrol',
  /** R-012. Imagen o spritesheet (si es sheet, puede tener animación `shine`). */
  gem: 'gem',
  /** R-013 / R-014. */
  exitClosed: 'exit-closed',
  exitOpen: 'exit-open',
  /** R-015: dos imágenes (o dos frames de un sheet; ver docs). */
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

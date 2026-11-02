/**
 * Constantes técnicas del juego (no de diseño de un nivel concreto).
 *
 * Este archivo NO importa Phaser a propósito: así se puede probar con Vitest
 * sin navegador y cualquier módulo puede usarlo sin arrastrar el motor.
 */

/** Cuadrícula lógica del Nivel 1 (CONTEXTO_MAESTRO: 24×18, celda 32 px). */
export const GRID = {
  columns: 24,
  rows: 18,
  /** Tamaño de una celda lógica del mapa, en píxeles. */
  cellSize: 32,
  /** Tamaño de un tile visual (pixel art base), en píxeles. */
  tileSize: 16,
} as const;

/** Cuántos tiles visuales caben por lado en una celda lógica (32 / 16 = 2). */
export const TILES_PER_CELL = GRID.cellSize / GRID.tileSize;

/** Resolución lógica del juego: el mapa completo cabe en pantalla. */
export const VIEW = {
  width: GRID.columns * GRID.cellSize, // 768
  height: GRID.rows * GRID.cellSize, // 576
} as const;

/** Color de fondo mientras no haya arte externo. TEMP. */
export const BACKGROUND_COLOR = '#000000';

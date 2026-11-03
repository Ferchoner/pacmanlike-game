import type { CellKind } from '../world/LevelTypes';

/**
 * Qué pieza del tileset va en cada celda (PURO, con pruebas).
 *
 * En una vista cenital "3/4" las paredes tienen dos caras:
 * - `wall-side`: la cara frontal, la que se ve cuando hay SUELO justo debajo
 *   (miras la pared desde el pasillo).
 * - `wall-top`: la parte de arriba, para el resto de celdas de pared.
 * Es la regla más simple de "autotiling": decidir el tile mirando a los vecinos.
 * Un autotiling completo (esquinas, uniones…) necesitaría un tileset con esas
 * piezas; este tileset temporal solo trae arriba y frente.
 *
 * El suelo alterna variantes de forma DETERMINISTA (misma celda = misma
 * variante siempre), para que no "parpadee" al reiniciar ni dependa del azar.
 */
export type TileRole = 'wall-top' | 'wall-side' | 'floor' | `floor-${number}`;

export function tileRole(
  cells: readonly (readonly CellKind[])[],
  x: number,
  y: number,
  floorVariants: number,
): TileRole {
  const cell = cells[y]?.[x];
  if (cell === 'wall') return cells[y + 1]?.[x] === 'floor' ? 'wall-side' : 'wall-top';
  if (floorVariants <= 0) return 'floor';
  // Una variante en ~1 de cada 4 celdas, elegida por un "hash" de (x, y).
  const h = (x * 73856093) ^ (y * 19349663);
  const n = Math.abs(h) % (floorVariants * 4);
  return n < floorVariants ? `floor-${n + 2}` : 'floor';
}

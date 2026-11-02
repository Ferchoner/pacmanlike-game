import { GRID } from '../core/GameConstants';
import type { GridPoint } from './LevelTypes';

/** Píxel de la esquina superior izquierda de una celda. */
export function cellToWorld(
  point: GridPoint,
  cellSize: number = GRID.cellSize,
): { x: number; y: number } {
  return { x: point.x * cellSize, y: point.y * cellSize };
}

/**
 * Píxel del centro de una celda. Los personajes se colocan en el centro:
 * así un cuerpo de colisión menor que 32 px queda con margen a ambos lados.
 */
export function cellCenter(
  point: GridPoint,
  cellSize: number = GRID.cellSize,
): { x: number; y: number } {
  return { x: point.x * cellSize + cellSize / 2, y: point.y * cellSize + cellSize / 2 };
}

/** Celda que contiene un píxel (útil en la Fase 3 para saber dónde está el jugador). */
export function worldToCell(x: number, y: number, cellSize: number = GRID.cellSize): GridPoint {
  return { x: Math.floor(x / cellSize), y: Math.floor(y / cellSize) };
}

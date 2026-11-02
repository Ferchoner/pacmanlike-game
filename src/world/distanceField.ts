import type { CellKind, GridPoint } from './LevelTypes';
import { isWalkable } from './gridSearch';

/**
 * Mapa de distancias ("distance field" o "flow field").
 *
 * Es el mismo BFS de `gridSearch.reachableFrom`, pero en vez de anotar solo
 * "se puede llegar", anota CUÁNTOS PASOS hay desde cada celda hasta un
 * objetivo. Con ese mapa, encontrar el camino es trivial: desde donde estés,
 * muévete a la vecina con el número más pequeño, y repite.
 *
 * Ventaja frente a calcular un camino completo por enemigo: un solo mapa
 * hacia el jugador sirve para TODOS los Hunters a la vez, y también responde
 * "¿a cuántos pasos estoy?" (lo usamos para el rango de detección).
 */

/** Orden fijo de vecinas. Fijo = el desempate es siempre igual (predecible y testeable). */
const NEIGHBOURS: readonly GridPoint[] = [
  { x: 0, y: -1 }, // arriba
  { x: -1, y: 0 }, // izquierda
  { x: 0, y: 1 }, // abajo
  { x: 1, y: 0 }, // derecha
];

export class DistanceField {
  /** `steps[y][x]`: pasos hasta el objetivo; `Infinity` si no se puede llegar. */
  private readonly steps: number[][];

  constructor(
    cells: readonly (readonly CellKind[])[],
    readonly target: GridPoint,
  ) {
    this.steps = cells.map((row) => row.map(() => Infinity));
    if (!isWalkable(cells, target)) return;

    this.steps[target.y]![target.x] = 0;
    const queue: GridPoint[] = [target];
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i]!;
      const next = this.distanceTo(current) + 1;
      for (const step of NEIGHBOURS) {
        const n = { x: current.x + step.x, y: current.y + step.y };
        if (isWalkable(cells, n) && this.distanceTo(n) === Infinity) {
          this.steps[n.y]![n.x] = next;
          queue.push(n);
        }
      }
    }
  }

  /** Pasos (celdas) desde `point` hasta el objetivo, siguiendo pasillos. */
  distanceTo(point: GridPoint): number {
    return this.steps[point.y]?.[point.x] ?? Infinity;
  }

  /**
   * Siguiente celda para acercarse al objetivo desde `from`, o `null` si ya
   * estás en él o no hay camino. Nunca devuelve una pared: las paredes valen
   * `Infinity` y no pueden ser "más pequeñas" que nada.
   */
  nextStep(from: GridPoint): GridPoint | null {
    let best: GridPoint | null = null;
    let bestDistance = this.distanceTo(from);
    for (const step of NEIGHBOURS) {
      const n = { x: from.x + step.x, y: from.y + step.y };
      const d = this.distanceTo(n);
      if (d < bestDistance) {
        best = n;
        bestDistance = d;
      }
    }
    return best;
  }
}


import type { CellKind, GridPoint } from './LevelTypes';

/** Las 4 direcciones del movimiento (sin diagonales para la conectividad). */
const NEIGHBOURS: readonly GridPoint[] = [
  { x: 1, y: 0 },
  { x: -1, y: 0 },
  { x: 0, y: 1 },
  { x: 0, y: -1 },
];

/** Clave de texto para guardar puntos en un Set ("x,y"). */
export function pointKey(point: GridPoint): string {
  return `${point.x},${point.y}`;
}

export function samePoint(a: GridPoint, b: GridPoint): boolean {
  return a.x === b.x && a.y === b.y;
}

/** ¿Se puede pisar esta celda? Fuera del mapa cuenta como pared. */
export function isWalkable(cells: readonly (readonly CellKind[])[], point: GridPoint): boolean {
  return cells[point.y]?.[point.x] === 'floor';
}

/**
 * Búsqueda en anchura (BFS, "Breadth-First Search"): desde una celda, visita
 * todas las vecinas transitables, luego las vecinas de esas, y así. Devuelve el
 * conjunto de celdas alcanzables. Es la base de "¿se puede llegar a X?" y, en
 * la Fase 5, de cómo el Hunter encuentra caminos sin atravesar paredes.
 */
export function reachableFrom(
  cells: readonly (readonly CellKind[])[],
  start: GridPoint,
): Set<string> {
  const visited = new Set<string>();
  if (!isWalkable(cells, start)) return visited;

  const queue: GridPoint[] = [start];
  visited.add(pointKey(start));
  // Usamos un índice en vez de queue.shift(): shift() es lento en arrays grandes.
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i]!;
    for (const step of NEIGHBOURS) {
      const next = { x: current.x + step.x, y: current.y + step.y };
      const key = pointKey(next);
      if (!visited.has(key) && isWalkable(cells, next)) {
        visited.add(key);
        queue.push(next);
      }
    }
  }
  return visited;
}

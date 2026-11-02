import { describe, expect, it } from 'vitest';
import { cellCenter, cellToWorld, worldToCell } from '../../src/world/gridMath';
import { reachableFrom } from '../../src/world/gridSearch';
import { parseMap } from '../../src/world/parseMap';

describe('gridMath (celdas de 32 px)', () => {
  it('convierte celda a píxeles', () => {
    expect(cellToWorld({ x: 2, y: 2 })).toEqual({ x: 64, y: 64 });
    expect(cellCenter({ x: 2, y: 2 })).toEqual({ x: 80, y: 80 });
  });

  it('convierte píxeles a celda', () => {
    expect(worldToCell(80, 80)).toEqual({ x: 2, y: 2 });
    expect(worldToCell(95.9, 64)).toEqual({ x: 2, y: 2 });
    expect(worldToCell(96, 64)).toEqual({ x: 3, y: 2 });
  });
});

describe('parseMap y reachableFrom', () => {
  const map = parseMap(['#####', '#P#g#', '#.#.#', '#...#', '#####']);

  it('encuentra cada símbolo', () => {
    expect(map.players).toEqual([{ x: 1, y: 1 }]);
    expect(map.gems).toEqual([{ x: 3, y: 1 }]);
    expect(map.cells[1]).toEqual(['wall', 'floor', 'wall', 'floor', 'wall']);
  });

  it('BFS rodea las paredes y no las cruza', () => {
    const reachable = reachableFrom(map.cells, { x: 1, y: 1 });
    expect(reachable.has('3,1')).toBe(true); // se llega dando la vuelta por abajo
    expect(reachable.has('2,1')).toBe(false); // pared
    expect(reachable.size).toBe(7);
  });

  it('desde una pared no se alcanza nada', () => {
    expect(reachableFrom(map.cells, { x: 0, y: 0 }).size).toBe(0);
  });
});

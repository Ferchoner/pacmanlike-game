import { describe, expect, it } from 'vitest';
import { tileRole } from '../../src/presentation/levelTiles';
import type { CellKind } from '../../src/world/LevelTypes';

const W: CellKind = 'wall';
const F: CellKind = 'floor';
const cells: CellKind[][] = [
  [W, W, W],
  [W, F, W],
  [W, W, W],
];

describe('Pieza del tileset por celda', () => {
  it('una pared con suelo debajo muestra su cara frontal', () => {
    expect(tileRole(cells, 1, 0, 0)).toBe('wall-side');
  });

  it('el resto de paredes se ven desde arriba (también la fila inferior del borde)', () => {
    expect(tileRole(cells, 0, 0, 0)).toBe('wall-top');
    expect(tileRole(cells, 1, 2, 0)).toBe('wall-top');
  });

  it('sin variantes, el suelo es siempre el mismo', () => {
    expect(tileRole(cells, 1, 1, 0)).toBe('floor');
  });

  it('las variantes de suelo son deterministas y existen', () => {
    const big: CellKind[][] = Array.from({ length: 18 }, () => Array<CellKind>(24).fill(F));
    const roles = big.flatMap((row, y) => row.map((_, x) => tileRole(big, x, y, 3)));
    expect(new Set(roles)).toEqual(new Set(['floor', 'floor-2', 'floor-3', 'floor-4']));
    // Mayoría de suelo liso: las variantes son el "condimento".
    expect(roles.filter((r) => r === 'floor').length).toBeGreaterThan(roles.length / 2);
    expect(tileRole(big, 5, 7, 3)).toBe(tileRole(big, 5, 7, 3));
  });
});

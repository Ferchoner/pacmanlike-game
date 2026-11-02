import { describe, expect, it } from 'vitest';
import { GridWalker } from '../../src/enemies/GridWalker';

const center = (cell: number) => cell * 32 + 16;

describe('GridWalker', () => {
  it('empieza en el centro de su celda, parado', () => {
    const w = new GridWalker({ x: 2, y: 3 }, 100, 32);
    expect({ x: w.x, y: w.y, moving: w.moving }).toEqual({ x: center(2), y: center(3), moving: false });
  });

  it('avanza a la velocidad pedida hacia la celda elegida', () => {
    const w = new GridWalker({ x: 2, y: 3 }, 100, 32);
    w.advance(0.1, () => ({ x: 3, y: 3 }));
    expect(w.x).toBeCloseTo(center(2) + 10);
    expect(w.facing).toBe('right');
    expect(w.moving).toBe(true);
  });

  it('al llegar a un centro usa lo que sobra para seguir (sin tirones)', () => {
    const w = new GridWalker({ x: 1, y: 1 }, 100, 32);
    // 0.5 s × 100 px/s = 50 px = 1 celda completa (32) + 18 px de la siguiente.
    w.advance(0.5, (c) => ({ x: c.x + 1, y: c.y }));
    expect(w.x).toBeCloseTo(center(1) + 50);
    expect(w.cell).toEqual({ x: 2, y: 1 });
  });

  it('si no hay siguiente celda, se queda en el centro', () => {
    const w = new GridWalker({ x: 1, y: 1 }, 100, 32);
    w.advance(1, () => null);
    expect({ x: w.x, y: w.y, moving: w.moving }).toEqual({ x: center(1), y: center(1), moving: false });
  });

  it('ignora celdas que no son vecinas (nunca salta ni va en diagonal)', () => {
    const w = new GridWalker({ x: 1, y: 1 }, 100, 32);
    w.advance(1, () => ({ x: 2, y: 2 }));
    expect({ x: w.x, y: w.y }).toEqual({ x: center(1), y: center(1) });
  });
});

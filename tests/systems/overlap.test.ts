import { describe, expect, it } from 'vitest';
import { boxesOverlap, separation } from '../../src/systems/overlap';

describe('boxesOverlap', () => {
  const a = { x: 0, y: 0, half: 10 };

  it('detecta cajas que se solapan', () => {
    expect(boxesOverlap(a, { x: 15, y: 5, half: 10 })).toBe(true);
  });

  it('cajas solo pegadas por el borde NO se solapan', () => {
    expect(boxesOverlap(a, { x: 20, y: 0, half: 10 })).toBe(false);
  });

  it('hace falta solaparse en X y en Y a la vez', () => {
    expect(boxesOverlap(a, { x: 5, y: 40, half: 10 })).toBe(false);
    expect(boxesOverlap(a, { x: 40, y: 5, half: 10 })).toBe(false);
  });
});

describe('separation', () => {
  const obstacle = { x: 0, y: 0, half: 11 };
  it('sin solape no empuja', () => {
    expect(separation({ x: 22, y: 0, half: 11 }, obstacle)).toEqual({ x: 0, y: 0 });
  });
  it('empuja por el eje de menor penetración, alejándose', () => {
    expect(separation({ x: 15, y: 3, half: 11 }, obstacle)).toEqual({ x: 7, y: 0 });
    expect(separation({ x: -2, y: -18, half: 11 }, obstacle)).toEqual({ x: 0, y: -4 });
  });
  it('tras empujar quedan pegados pero ya no se solapan', () => {
    const mover = { x: 15, y: 3, half: 11 };
    const push = separation(mover, obstacle);
    expect(boxesOverlap({ ...mover, x: mover.x + push.x, y: mover.y + push.y }, obstacle)).toBe(false);
  });
});

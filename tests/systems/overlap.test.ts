import { describe, expect, it } from 'vitest';
import { boxesOverlap } from '../../src/systems/overlap';

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

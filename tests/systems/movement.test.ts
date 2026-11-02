import { describe, expect, it } from 'vitest';
import { axisFromKeys, velocityFromInput } from '../../src/systems/movement';

describe('axisFromKeys', () => {
  it('una tecla da su dirección; ninguna o las dos se anulan', () => {
    expect(axisFromKeys(true, false)).toBe(-1);
    expect(axisFromKeys(false, true)).toBe(1);
    expect(axisFromKeys(false, false)).toBe(0);
    expect(axisFromKeys(true, true)).toBe(0);
  });
});

describe('velocityFromInput', () => {
  it('sin teclas no hay velocidad', () => {
    expect(velocityFromInput({ x: 0, y: 0 }, 160)).toEqual({ x: 0, y: 0 });
  });

  it('en las 4 direcciones avanza exactamente a la velocidad dada', () => {
    expect(velocityFromInput({ x: 1, y: 0 }, 160)).toEqual({ x: 160, y: 0 });
    expect(velocityFromInput({ x: 0, y: -1 }, 160)).toEqual({ x: 0, y: -160 });
  });

  it('la diagonal está normalizada: misma rapidez, no √2 veces más', () => {
    const v = velocityFromInput({ x: 1, y: 1 }, 160);
    expect(Math.hypot(v.x, v.y)).toBeCloseTo(160, 10);
    expect(v.x).toBeCloseTo(v.y, 10);
  });
});

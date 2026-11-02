import { describe, expect, it } from 'vitest';
import { GemCollection } from '../../src/systems/gemCollection';

const CELL = 32;
const gems = [
  { x: 1, y: 1 },
  { x: 3, y: 1 },
];
/** Cuerpo del jugador (22 px) centrado en una celda. */
const bodyAt = (x: number, y: number) => ({ x: x * CELL + 16, y: y * CELL + 16, half: 11 });

describe('GemCollection', () => {
  it('empieza sin gemas recogidas', () => {
    const c = new GemCollection(gems, 16, CELL);
    expect(c.total).toBe(2);
    expect(c.count).toBe(0);
  });

  it('recoge la gema que toca y devuelve su índice', () => {
    const c = new GemCollection(gems, 16, CELL);
    expect(c.collectTouching(bodyAt(3, 1))).toEqual([1]);
    expect(c.count).toBe(1);
    expect(c.isCollected(1)).toBe(true);
    expect(c.isCollected(0)).toBe(false);
  });

  it('una gema se recoge UNA sola vez aunque el jugador se quede encima', () => {
    const c = new GemCollection(gems, 16, CELL);
    c.collectTouching(bodyAt(1, 1));
    expect(c.collectTouching(bodyAt(1, 1))).toEqual([]);
    expect(c.count).toBe(1);
  });

  it('estar en la celda vecina no recoge la gema', () => {
    const c = new GemCollection(gems, 16, CELL);
    expect(c.collectTouching(bodyAt(2, 1))).toEqual([]);
  });
});

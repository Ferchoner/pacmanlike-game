import { describe, expect, it } from 'vitest';
import { LEVEL_1 } from '../../src/data/levels';
import { DistanceField } from '../../src/world/distanceField';
import { loadLevel } from '../../src/world/loadLevel';
import { parseMap } from '../../src/world/parseMap';

const { level } = loadLevel(LEVEL_1);

describe('DistanceField', () => {
  // Una pared en medio obliga a rodear: la distancia es por pasillo, no en línea recta.
  const cells = parseMap(['#####', '#...#', '#.#.#', '#...#', '#####']).cells;
  const field = new DistanceField(cells, { x: 1, y: 2 });

  it('el objetivo está a 0 pasos y las vecinas a 1', () => {
    expect(field.distanceTo({ x: 1, y: 2 })).toBe(0);
    expect(field.distanceTo({ x: 1, y: 1 })).toBe(1);
  });

  it('mide pasos por pasillo, rodeando paredes', () => {
    // (3,2) está a 2 celdas en línea recta, pero hay pared en (2,2): son 4 pasos.
    expect(field.distanceTo({ x: 3, y: 2 })).toBe(4);
  });

  it('paredes y fuera del mapa son inalcanzables', () => {
    expect(field.distanceTo({ x: 2, y: 2 })).toBe(Infinity);
    expect(field.distanceTo({ x: -5, y: 99 })).toBe(Infinity);
  });

  it('nextStep acerca un paso y nunca entra en una pared', () => {
    const step = field.nextStep({ x: 3, y: 2 });
    expect(step).not.toBeNull();
    expect(field.distanceTo(step!)).toBe(3);
    expect(field.nextStep({ x: 1, y: 2 })).toBeNull(); // ya está en el objetivo
  });

  it('siguiendo nextStep se llega al objetivo en exactamente distanceTo pasos', () => {
    let p = { x: 3, y: 3 };
    let steps = 0;
    while (field.nextStep(p)) {
      p = field.nextStep(p)!;
      steps++;
    }
    expect(p).toEqual({ x: 1, y: 2 });
    expect(steps).toBe(new DistanceField(cells, { x: 1, y: 2 }).distanceTo({ x: 3, y: 3 }));
  });

  it('en el Nivel 1 todo el suelo llega al jugador (mapa conectado)', () => {
    const toStart = new DistanceField(level.cells, level.playerStart);
    level.cells.forEach((row, y) =>
      row.forEach((cell, x) => {
        if (cell === 'floor') expect(toStart.distanceTo({ x, y })).toBeLessThan(Infinity);
      }),
    );
    // Mismos números que la auditoría: Hunter1 a 7 pasos, Hunter2 a 17.
    expect(toStart.distanceTo(level.hunters[0]!)).toBe(7);
    expect(toStart.distanceTo(level.hunters[1]!)).toBe(17);
  });
});

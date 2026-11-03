import { describe, expect, it } from 'vitest';
import { Hunter, nextHunterState } from '../../src/enemies/Hunter';
import { DistanceField } from '../../src/world/distanceField';
import type { GridPoint } from '../../src/world/LevelTypes';
import { centerOf, isOnFloor, level, TUNING } from './helpers';

const config = {
  speed: TUNING.hunterSpeed,
  bodySize: TUNING.enemyBodySize,
  cellSize: TUNING.cellSize,
  detectionCells: TUNING.hunterDetectionCells,
  giveUpCells: TUNING.hunterGiveUpCells,
};
const hunter1Home = level.hunters[0]!; // (6,5)
const towards = (p: GridPoint) => new DistanceField(level.cells, p);

/** Simula `seconds` a 60 fps con el jugador quieto en `player`. */
function run(h: Hunter, player: GridPoint, seconds: number, check?: () => void): void {
  const field = towards(player);
  for (let i = 0; i < Math.round(seconds * 60); i++) {
    h.update(1 / 60, field);
    check?.();
  }
}

describe('nextHunterState (histéresis)', () => {
  const cfg = { detectionCells: 5, giveUpCells: 8 };
  it('vigilando: detecta a 5 pasos o menos', () => {
    expect(nextHunterState('idle', 6, cfg)).toBe('idle');
    expect(nextHunterState('idle', 5, cfg)).toBe('chasing');
  });
  it('persiguiendo: sigue hasta pasar de 8 pasos', () => {
    expect(nextHunterState('chasing', 7, cfg)).toBe('chasing');
    expect(nextHunterState('chasing', 8, cfg)).toBe('chasing');
    expect(nextHunterState('chasing', 9, cfg)).toBe('returning');
  });
  it('volviendo: si el jugador se acerca otra vez, vuelve a perseguir', () => {
    expect(nextHunterState('returning', 9, cfg)).toBe('returning');
    expect(nextHunterState('returning', 4, cfg)).toBe('chasing');
  });
  it('un jugador inalcanzable (Infinity) nunca se detecta', () => {
    expect(nextHunterState('idle', Infinity, cfg)).toBe('idle');
  });
});

describe('Hunter del Nivel 1', () => {
  it('el inicio es seguro: con el jugador en (2,2) Hunter1 no se mueve', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    run(h, level.playerStart, 3);
    expect(h.state).toBe('idle');
    expect({ x: h.x, y: h.y }).toEqual(centerOf(hunter1Home));
  });

  it('persigue al jugador cercano por los pasillos y llega a su celda', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    const player = { x: 4, y: 3 }; // a 5 pasos de (6,5)
    run(h, player, 3, () => expect(isOnFloor(h.x, h.y)).toBe(true));
    expect(h.state).toBe('chasing');
    expect({ x: h.x, y: h.y }).toEqual(centerOf(player));
  });

  it('si el jugador se aleja, vuelve a casa y se queda vigilando', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    run(h, { x: 4, y: 3 }, 3);
    run(h, { x: 20, y: 15 }, 0.1); // lejísimos: en el siguiente centro se rinde
    expect(h.state).toBe('returning');
    run(h, { x: 20, y: 15 }, 5, () => expect(isOnFloor(h.x, h.y)).toBe(true));
    expect(h.state).toBe('idle');
    expect({ x: h.x, y: h.y }).toEqual(centerOf(hunter1Home));
  });

  it('se mueve a la velocidad configurada (más lento que el jugador)', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    const field = towards({ x: 4, y: 3 });
    h.update(0.1, field);
    const moved = Math.abs(h.x - centerOf(hunter1Home).x) + Math.abs(h.y - centerOf(hunter1Home).y);
    expect(moved).toBeCloseTo(TUNING.hunterSpeed * 0.1);
  });
});

describe('Hunter tras golpear (Fase 6)', () => {
  const near = { x: 4, y: 3 }; // a 5 pasos de casa: lo detecta

  it('si el jugador es invulnerable, lo pierde de vista al instante y vuelve a casa', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    run(h, near, 0.5);
    expect(h.state).toBe('chasing');
    const field = towards(near);
    h.update(1 / 60, field, false);
    expect(h.state).toBe('returning');
    for (let i = 0; i < 300; i++) {
      h.update(1 / 60, field, false);
      expect(h.state).not.toBe('chasing');
    }
    expect(h.state).toBe('idle');
    expect({ x: h.x, y: h.y }).toEqual(centerOf(hunter1Home));
  });

  it('vigilando, no detecta a un jugador invulnerable aunque esté cerca', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    const field = towards(near);
    for (let i = 0; i < 120; i++) h.update(1 / 60, field, false);
    expect(h.state).toBe('idle');
    h.update(1 / 60, field, true); // vuelve a ser vulnerable: ahora sí
    expect(h.state).toBe('chasing');
  });

  it('goHome: vuelve a casa sin perseguir aunque el jugador siga cerca y visible', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    run(h, near, 3); // lo alcanza
    h.goHome();
    expect(h.isRetreating).toBe(true);
    const field = towards(near);
    let reachedHome = false;
    for (let i = 0; i < 600 && !reachedHome; i++) {
      h.update(1 / 60, field, true);
      if (h.state === 'idle' || !h.isRetreating) reachedHome = true;
      else expect(h.state).toBe('returning');
    }
    expect(reachedHome).toBe(true);
    expect({ x: h.x, y: h.y }).toEqual(centerOf(hunter1Home));
    // Ya en casa vuelve a vigilar con normalidad: el jugador cercano se detecta.
    h.update(1 / 60, field, true);
    expect(h.state).toBe('chasing');
  });

  it('freeze: se queda inmóvil el tiempo indicado y luego sigue', () => {
    const h = new Hunter(hunter1Home, level.cells, config);
    run(h, near, 0.2);
    const before = { x: h.x, y: h.y };
    h.freeze(0.5);
    run(h, near, 0.45);
    expect({ x: h.x, y: h.y }).toEqual(before);
    expect(h.moving).toBe(false);
    run(h, near, 0.2);
    expect({ x: h.x, y: h.y }).not.toEqual(before);
  });
});

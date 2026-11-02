import { describe, expect, it } from 'vitest';
import { firstTargetIndex, Patrol } from '../../src/enemies/Patrol';
import { samePoint } from '../../src/world/gridSearch';
import { centerOf, isOnFloor, level, TUNING } from './helpers';

const def = level.patrols[0]!;
const newPatrol = () =>
  new Patrol(def, level.cells, {
    speed: TUNING.patrolSpeed,
    bodySize: TUNING.enemyBodySize,
    cellSize: TUNING.cellSize,
  });

describe('Patrol del Nivel 1', () => {
  it('empieza en (18,12) y sale hacia (21,12), siguiendo el sentido del circuito', () => {
    const p = newPatrol();
    expect({ x: p.x, y: p.y }).toEqual(centerOf({ x: 18, y: 12 }));
    expect(p.currentWaypoint).toEqual({ x: 21, y: 12 });
    p.update(0.1);
    expect(p.facing).toBe('right');
  });

  it('recorre los 4 waypoints en orden y vuelve a empezar', () => {
    const p = newPatrol();
    // Cada vez que cambia de objetivo es que acaba de llegar al anterior.
    const order: number[] = [];
    let previous = p.currentWaypoint;
    // El circuito mide 4+2+4+2 = 12 celdas = 384 px; 15 s a 80 px/s dan 3 vueltas.
    for (let i = 0; i < 15 * 60; i++) {
      p.update(1 / 60);
      if (!samePoint(previous, p.currentWaypoint)) {
        order.push(def.waypoints.findIndex((w) => samePoint(w, previous)));
        previous = p.currentWaypoint;
      }
    }
    expect(order.slice(0, 9)).toEqual([1, 2, 3, 0, 1, 2, 3, 0, 1]);
  });

  it('nunca pisa una pared ni se sale de su circuito', () => {
    const p = newPatrol();
    for (let i = 0; i < 20 * 60; i++) {
      p.update(1 / 60);
      expect(isOnFloor(p.x, p.y)).toBe(true);
      // Circuito: filas 12 y 14 entre x 17..21, columnas 17 y 21 entre y 12..14.
      const col = (p.x - 16) / 32;
      const row = (p.y - 16) / 32;
      expect(col).toBeGreaterThanOrEqual(17);
      expect(col).toBeLessThanOrEqual(21);
      expect(row).toBeGreaterThanOrEqual(12);
      expect(row).toBeLessThanOrEqual(14);
    }
  });

  it('se mueve a la velocidad configurada', () => {
    const p = newPatrol();
    p.update(0.5);
    expect(p.x - centerOf({ x: 18, y: 12 }).x).toBeCloseTo(TUNING.patrolSpeed * 0.5);
  });
});

describe('firstTargetIndex', () => {
  const waypoints = [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 4, y: 2 },
  ];
  it('desde el medio de un tramo, va al final del tramo', () => {
    expect(firstTargetIndex({ start: { x: 2, y: 0 }, waypoints })).toBe(1);
  });
  it('si empieza sobre un waypoint, va al siguiente', () => {
    expect(firstTargetIndex({ start: { x: 4, y: 0 }, waypoints })).toBe(2);
  });
  it('fuera del circuito, va al waypoint 0', () => {
    expect(firstTargetIndex({ start: { x: 9, y: 9 }, waypoints })).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { isWall, moveAndCollide, overlapsWall, type WallGrid } from '../../src/systems/wallCollision';
import { parseMap } from '../../src/world/parseMap';

/** Rejilla de prueba con celdas de 32 px a partir de un mini-mapa ASCII. */
function grid(rows: string[]): WallGrid {
  return { cells: parseMap(rows).cells, cellSize: 32 };
}

const HALF = 11; // cuerpo de 22 px, como el jugador

// Pasillo horizontal de 3 celdas libres (x = 1..3) en la fila 1.
const corridor = grid(['#####', '#...#', '#####']);
const center = (cell: number) => cell * 32 + 16;

describe('overlapsWall e isWall', () => {
  it('fuera del mapa cuenta como pared', () => {
    expect(isWall(corridor, -1, 1)).toBe(true);
    expect(isWall(corridor, 99, 1)).toBe(true);
  });

  it('un cuerpo centrado en su celda no toca paredes', () => {
    expect(overlapsWall(corridor, center(1), center(1), HALF)).toBe(false);
  });

  it('tocar el borde exacto de una pared no cuenta como pisarla', () => {
    // Borde derecho en x = 128 (inicio de la pared de la columna 4).
    expect(overlapsWall(corridor, 128 - HALF, center(1), HALF)).toBe(false);
    expect(overlapsWall(corridor, 128 - HALF + 0.01, center(1), HALF)).toBe(true);
  });
});

describe('moveAndCollide', () => {
  it('se mueve libremente si no hay pared', () => {
    const r = moveAndCollide(corridor, { x: center(1), y: center(1) }, { x: 10, y: 0 }, HALF);
    expect(r).toEqual({ x: center(1) + 10, y: center(1), blockedX: false, blockedY: false });
  });

  it('se detiene pegado a la pared, sin hueco', () => {
    const r = moveAndCollide(corridor, { x: center(3), y: center(1) }, { x: 20, y: 0 }, HALF);
    expect(r.x).toBe(128 - HALF);
    expect(r.blockedX).toBe(true);
  });

  it('nunca atraviesa una pared aunque el paso sea enorme (tunneling)', () => {
    // Columna 2 es pared; detrás hay suelo en la 3.
    const g = grid(['#####', '#.#.#', '#####']);
    const r = moveAndCollide(g, { x: center(1), y: center(1) }, { x: 500, y: 0 }, HALF);
    expect(r.x).toBe(64 - HALF);
  });

  it('en diagonal contra una pared se desliza por el eje libre', () => {
    // Empuja hacia arriba-derecha: arriba hay pared, a la derecha suelo.
    const r = moveAndCollide(corridor, { x: center(1), y: center(1) }, { x: 10, y: -10 }, HALF);
    expect(r.x).toBe(center(1) + 10);
    expect(r.y).toBe(32 + HALF); // pegado al techo
    expect(r.blockedY).toBe(true);
    expect(r.blockedX).toBe(false);
  });

  describe('asistencia en esquinas', () => {
    // Pasillo vertical (columna 1) con una salida lateral a la derecha en la fila 2.
    const junction = grid(['#####', '#.###', '#...#', '#.###', '#####']);
    // Ya pegado al lado derecho del pasillo vertical (x = 64 - HALF) y con el
    // centro 8 px por encima del centro de la fila 2.
    const start = { x: 64 - HALF, y: center(2) - 8 };

    it('sin asistencia, el jugador desalineado se traba en la esquina', () => {
      const r = moveAndCollide(junction, start, { x: 4, y: 0 }, HALF, 0);
      expect(r).toEqual({ ...start, blockedX: true, blockedY: false });
    });

    it('con asistencia, se acerca al centro del carril y luego entra', () => {
      let pos = start;
      for (let i = 0; i < 10; i++) pos = moveAndCollide(junction, pos, { x: 4, y: 0 }, HALF, 12);
      // Solo lo acerca lo justo para que el cuerpo quepa en la fila 2...
      expect(pos.y - HALF).toBeGreaterThanOrEqual(64);
      expect(pos.y + HALF).toBeLessThanOrEqual(96);
      // ...y a partir de ahí ya avanza por la salida lateral.
      expect(pos.x).toBeGreaterThan(center(2));
    });

    it('no empuja si delante, en su carril, hay pared', () => {
      // Fila 1 de la columna 2 es pared: empujar a la derecha desde la fila 1 no hace nada.
      const p = { x: 64 - HALF, y: center(1) + 4 };
      const r = moveAndCollide(junction, p, { x: 4, y: 0 }, HALF, 12);
      expect(r.y).toBe(p.y);
      expect(r.x).toBe(p.x);
    });

    it('no ayuda si la desalineación supera el límite', () => {
      const p = { x: 64 - HALF, y: center(2) - 14 };
      const r = moveAndCollide(junction, p, { x: 4, y: 0 }, HALF, 12);
      expect(r.y).toBe(p.y);
    });
  });
});

import { describe, expect, it } from 'vitest';
import { GRID, TILES_PER_CELL, VIEW } from '../src/core/GameConstants';
import { SceneKeys } from '../src/core/SceneKeys';
import { GAME_TUNING } from '../src/data/gameTuning';

// Estas pruebas no abren navegador: comprueban que la base respeta los docs.
describe('Constantes técnicas (CONTEXTO_MAESTRO)', () => {
  it('la cuadrícula es 24×18 con celdas de 32 px', () => {
    expect(GRID.columns).toBe(24);
    expect(GRID.rows).toBe(18);
    expect(GRID.cellSize).toBe(32);
  });

  it('la resolución lógica es 768×576', () => {
    expect(VIEW).toEqual({ width: 768, height: 576 });
  });

  it('cada celda lógica equivale a 2×2 tiles de 16 px', () => {
    expect(GRID.tileSize).toBe(16);
    expect(TILES_PER_CELL).toBe(2);
  });
});

describe('Escenas', () => {
  it('existen las cinco escenas base con claves únicas', () => {
    const keys = Object.values(SceneKeys);
    expect(keys).toEqual(['Boot', 'Preload', 'Menu', 'Game', 'GameOver']);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('Valores de ajuste provisionales', () => {
  it('coinciden con los documentados', () => {
    expect(GAME_TUNING).toEqual({
      startingHearts: 3,
      playerSpeed: 160,
      hunterSpeed: 120,
      invulnerabilitySeconds: 0.8,
    });
  });
});

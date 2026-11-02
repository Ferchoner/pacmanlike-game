import { describe, expect, it } from 'vitest';
import { GRID } from '../../src/core/GameConstants';
import { GAME_TUNING } from '../../src/data/gameTuning';
import { LEVEL_1 } from '../../src/data/levels';
import { facingFromInput, Player } from '../../src/player/Player';
import { NO_INPUT } from '../../src/systems/movement';
import { loadLevel } from '../../src/world/loadLevel';

const { level } = loadLevel(LEVEL_1);
const config = {
  speed: GAME_TUNING.playerSpeed,
  bodySize: GAME_TUNING.playerBodySize,
  cornerAssistPx: GAME_TUNING.cornerAssistPx,
};
const walls = { cells: level.cells, cellSize: GRID.cellSize };
const newPlayer = () => new Player(level.playerStart, config, walls);
const HALF = GAME_TUNING.playerBodySize / 2;

/** Simula `seconds` de juego a 60 fps con la misma tecla pulsada. */
function hold(player: Player, input: { x: -1 | 0 | 1; y: -1 | 0 | 1 }, seconds: number): void {
  const frames = Math.round(seconds * 60);
  for (let i = 0; i < frames; i++) player.update(input, 1 / 60);
}

describe('Player en el Nivel 1', () => {
  it('empieza en el centro de la celda P (2,2)', () => {
    const p = newPlayer();
    expect({ x: p.x, y: p.y }).toEqual({ x: 80, y: 80 });
    expect(p.moving).toBe(false);
  });

  it('el cuerpo de colisión cabe en un pasillo de 1 celda', () => {
    expect(GAME_TUNING.playerBodySize).toBeLessThan(GRID.cellSize);
  });

  it('avanza a 160 px/s', () => {
    const p = newPlayer();
    hold(p, { x: 1, y: 0 }, 0.5);
    expect(p.x).toBeCloseTo(80 + 80, 5);
    expect(p.moving).toBe(true);
    expect(p.facing).toBe('right');
  });

  it('se detiene en la pared de la columna 8 de la fila 2', () => {
    const p = newPlayer();
    hold(p, { x: 1, y: 0 }, 3);
    expect(p.x).toBe(8 * 32 - HALF);
    expect(p.moving).toBe(false); // empujando contra la pared ya no se desplaza
  });

  it('no sale por el borde superior ni izquierdo del mapa', () => {
    const p = newPlayer();
    hold(p, { x: -1, y: -1 }, 3);
    expect({ x: p.x, y: p.y }).toEqual({ x: 32 + HALF, y: 32 + HALF });
  });

  it('sin teclas no se mueve', () => {
    const p = newPlayer();
    p.update(NO_INPUT, 1);
    expect({ x: p.x, y: p.y, moving: p.moving }).toEqual({ x: 80, y: 80, moving: false });
  });
});

describe('facingFromInput', () => {
  it('mira hacia donde se empuja', () => {
    expect(facingFromInput({ x: 0, y: -1 }, 'down')).toBe('up');
    expect(facingFromInput({ x: -1, y: 0 }, 'down')).toBe('left');
  });

  it('sin teclas conserva la dirección', () => {
    expect(facingFromInput({ x: 0, y: 0 }, 'left')).toBe('left');
  });

  it('en diagonal conserva la anterior si sigue pulsada; si no, la horizontal', () => {
    expect(facingFromInput({ x: 1, y: 1 }, 'down')).toBe('down');
    expect(facingFromInput({ x: 1, y: 1 }, 'up')).toBe('right');
  });
});

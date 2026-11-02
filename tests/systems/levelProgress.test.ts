import { describe, expect, it } from 'vitest';
import { GRID } from '../../src/core/GameConstants';
import { GAME_TUNING } from '../../src/data/gameTuning';
import { LEVEL_1 } from '../../src/data/levels';
import { Player } from '../../src/player/Player';
import { LevelProgress, type ProgressEvent } from '../../src/systems/levelProgress';
import type { GridPoint } from '../../src/world/LevelTypes';
import { cellCenter } from '../../src/world/gridMath';
import { loadLevel } from '../../src/world/loadLevel';

const { level } = loadLevel(LEVEL_1);
const config = {
  gemPickupSize: GAME_TUNING.gemPickupSize,
  exitTriggerSize: GAME_TUNING.exitTriggerSize,
  cellSize: GRID.cellSize,
};
const HALF = GAME_TUNING.playerBodySize / 2;
const bodyAt = (p: GridPoint) => ({ ...cellCenter(p), half: HALF });
const types = (events: ProgressEvent[]) => events.map((e) => e.type);

/** Recoge las primeras `n` gemas del nivel "teletransportando" el cuerpo. */
function collect(progress: LevelProgress, n: number): ProgressEvent[] {
  return level.gems.slice(0, n).flatMap((g) => progress.update(bodyAt(g)));
}

describe('LevelProgress en el Nivel 1', () => {
  it('empieza con 0 gemas, 20 requeridas, puerta cerrada y sin completar', () => {
    const p = new LevelProgress(level, config);
    expect(p.gems.count).toBe(0);
    expect(p.gems.total).toBe(25);
    expect(p.gemsRequired).toBe(20);
    expect(p.exitState).toBe('closed');
    expect(p.isCompleted).toBe(false);
  });

  it('el inicio no toca ninguna gema ni la puerta', () => {
    const p = new LevelProgress(level, config);
    expect(p.update(bodyAt(level.playerStart))).toEqual([]);
  });

  it('con 19 gemas la puerta sigue cerrada', () => {
    const p = new LevelProgress(level, config);
    const events = collect(p, 19);
    expect(p.gems.count).toBe(19);
    expect(types(events)).not.toContain('exitOpened');
    expect(p.exitState).toBe('closed');
  });

  it('la gema 20 abre la puerta (una sola vez)', () => {
    const p = new LevelProgress(level, config);
    collect(p, 19);
    expect(types(p.update(bodyAt(level.gems[19]!)))).toEqual(['gemCollected', 'exitOpened']);
    expect(p.exitState).toBe('open');
    // La 21 suma, pero ya no "vuelve a abrir".
    expect(types(p.update(bodyAt(level.gems[20]!)))).toEqual(['gemCollected']);
    expect(p.gems.count).toBe(21);
  });

  it('tocar la puerta CERRADA no completa el nivel', () => {
    const p = new LevelProgress(level, config);
    collect(p, 10);
    expect(p.update(bodyAt(level.exit))).toEqual([]);
    expect(p.isCompleted).toBe(false);
  });

  it('abrir la puerta NO completa el nivel; hay que tocarla', () => {
    const p = new LevelProgress(level, config);
    collect(p, 20);
    expect(p.isCompleted).toBe(false);
    expect(types(p.update(bodyAt(level.exit)))).toEqual(['levelCompleted']);
    expect(p.isCompleted).toBe(true);
  });

  it('pasar junto a la puerta abierta (celda vecina) no la toca', () => {
    const p = new LevelProgress(level, config);
    collect(p, 20);
    expect(p.update(bodyAt({ x: level.exit.x - 1, y: level.exit.y }))).toEqual([]);
  });

  it('tras completar ya no emite más eventos', () => {
    const p = new LevelProgress(level, config);
    collect(p, 20);
    p.update(bodyAt(level.exit));
    expect(p.update(bodyAt(level.gems[22]!))).toEqual([]);
    expect(p.gems.count).toBe(20);
  });

  it('cada LevelProgress nuevo empieza de cero (reinicio de la run)', () => {
    const first = new LevelProgress(level, config);
    collect(first, 20);
    const second = new LevelProgress(level, config);
    expect(second.gems.count).toBe(0);
    expect(second.exitState).toBe('closed');
  });

  it('el evento de gema lleva el índice y el total acumulado', () => {
    const p = new LevelProgress(level, config);
    expect(p.update(bodyAt(level.gems[3]!))).toEqual([{ type: 'gemCollected', index: 3, count: 1 }]);
  });
});

describe('Integración: el jugador caminando recoge gemas', () => {
  it('ir a la derecha desde (2,2) recoge las gemas (4,2) y (6,2), una vez cada una', () => {
    const player = new Player(
      level.playerStart,
      {
        speed: GAME_TUNING.playerSpeed,
        bodySize: GAME_TUNING.playerBodySize,
        cornerAssistPx: GAME_TUNING.cornerAssistPx,
      },
      { cells: level.cells, cellSize: GRID.cellSize },
    );
    const p = new LevelProgress(level, config);
    const picked: number[] = [];
    for (let i = 0; i < 180; i++) {
      player.update({ x: 1, y: 0 }, 1 / 60);
      for (const e of p.update(player.body)) if (e.type === 'gemCollected') picked.push(e.index);
    }
    const cells = picked.map((i) => level.gems[i]);
    expect(cells).toEqual([
      { x: 4, y: 2 },
      { x: 6, y: 2 },
    ]);
  });
});

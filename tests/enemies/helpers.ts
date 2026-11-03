import { GRID } from '../../src/core/GameConstants';
import { GAME_TUNING } from '../../src/data/gameTuning';
import { LEVEL_1 } from '../../src/data/levels';
import type { EnemyTuning } from '../../src/enemies/EnemyGroup';
import { worldToCell } from '../../src/world/gridMath';
import { isWalkable } from '../../src/world/gridSearch';
import { loadLevel } from '../../src/world/loadLevel';

export const { level } = loadLevel(LEVEL_1);

export const TUNING: EnemyTuning = {
  cellSize: GRID.cellSize,
  enemyBodySize: GAME_TUNING.enemyBodySize,
  hunterSpeed: GAME_TUNING.hunterSpeed,
  hunterDetectionCells: GAME_TUNING.hunterDetectionCells,
  hunterGiveUpCells: GAME_TUNING.hunterGiveUpCells,
  patrolSpeed: GAME_TUNING.patrolSpeed,
  enemyHitFreezeSeconds: GAME_TUNING.enemyHitFreezeSeconds,
};

/** Un enemigo en marcha va por la línea entre dos centros: su centro siempre está en suelo. */
export function isOnFloor(x: number, y: number): boolean {
  return isWalkable(level.cells, worldToCell(x, y));
}

/** Centro de una celda en px. */
export const centerOf = (p: { x: number; y: number }) => ({ x: p.x * 32 + 16, y: p.y * 32 + 16 });

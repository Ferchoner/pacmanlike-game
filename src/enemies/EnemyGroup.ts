import { boxesOverlap, type CenteredBox } from '../systems/overlap';
import { DistanceField } from '../world/distanceField';
import { samePoint } from '../world/gridSearch';
import { worldToCell } from '../world/gridMath';
import type { Level } from '../world/LevelTypes';
import { Hunter } from './Hunter';
import { Patrol } from './Patrol';

export type Enemy = Hunter | Patrol;

export interface EnemyTuning {
  readonly cellSize: number;
  readonly enemyBodySize: number;
  readonly hunterSpeed: number;
  readonly hunterDetectionCells: number;
  readonly hunterGiveUpCells: number;
  readonly patrolSpeed: number;
  /** Segundos que un enemigo se queda inmóvil tras golpear al jugador. */
  readonly enemyHitFreezeSeconds: number;
}

/**
 * Todos los enemigos de un nivel, creados desde los datos del nivel (no
 * escritos a mano en la escena). La escena solo llama a `update` cada
 * fotograma y pregunta `touching` (lo usa el sistema de daño).
 */
export class EnemyGroup {
  readonly hunters: readonly Hunter[];
  readonly patrols: readonly Patrol[];
  private towardPlayer: DistanceField | null = null;

  constructor(
    private readonly level: Level,
    private readonly tuning: EnemyTuning,
  ) {
    const { cells } = level;
    this.hunters = level.hunters.map(
      (home) =>
        new Hunter(home, cells, {
          speed: tuning.hunterSpeed,
          bodySize: tuning.enemyBodySize,
          cellSize: tuning.cellSize,
          detectionCells: tuning.hunterDetectionCells,
          giveUpCells: tuning.hunterGiveUpCells,
        }),
    );
    this.patrols = level.patrols.map(
      (def) =>
        new Patrol(def, cells, {
          speed: tuning.patrolSpeed,
          bodySize: tuning.enemyBodySize,
          cellSize: tuning.cellSize,
        }),
    );
  }

  get all(): readonly Enemy[] {
    return [...this.hunters, ...this.patrols];
  }

  /**
   * `playerVisible`: false mientras el jugador es invulnerable; los Hunters lo
   * pierden de vista (el Patrol no persigue, así que no le afecta).
   */
  update(dtSeconds: number, player: CenteredBox, playerVisible = true): void {
    // El mapa hacia el jugador solo se recalcula cuando el jugador cambia de
    // celda (no cada fotograma): mismo resultado, mucho menos trabajo.
    const playerCell = worldToCell(player.x, player.y, this.tuning.cellSize);
    if (!this.towardPlayer || !samePoint(this.towardPlayer.target, playerCell)) {
      this.towardPlayer = new DistanceField(this.level.cells, playerCell);
    }
    for (const hunter of this.hunters) hunter.update(dtSeconds, this.towardPlayer, playerVisible);
    for (const patrol of this.patrols) patrol.update(dtSeconds);
  }

  /**
   * El jugador acaba de recibir daño de `hitters`: se quedan inmóviles un
   * momento (el jugador sale empujado, ellos no se mueven) y los Hunters
   * "cumplieron": al terminar vuelven a casa.
   */
  onPlayerHit(hitters: readonly Enemy[]): void {
    for (const enemy of hitters) {
      enemy.freeze(this.tuning.enemyHitFreezeSeconds);
      if (enemy.kind === 'hunter') enemy.goHome();
    }
  }

  /** Enemigos cuyo cuerpo toca `body` ahora mismo (AABB). */
  touching(body: CenteredBox): Enemy[] {
    return this.all.filter((enemy) => boxesOverlap(enemy.body, body));
  }
}

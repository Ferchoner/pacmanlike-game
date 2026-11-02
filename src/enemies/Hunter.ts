import type { CenteredBox } from '../systems/overlap';
import { DistanceField } from '../world/distanceField';
import { samePoint } from '../world/gridSearch';
import type { CellKind, GridPoint } from '../world/LevelTypes';
import { GridWalker } from './GridWalker';

export interface HunterConfig {
  /** px/s */
  readonly speed: number;
  /** Lado del cuerpo de colisión, px. */
  readonly bodySize: number;
  readonly cellSize: number;
  /** Empieza a perseguir si el jugador está a esta distancia (en pasos por pasillo) o menos. */
  readonly detectionCells: number;
  /** Deja de perseguir si el jugador se aleja MÁS de esta distancia. */
  readonly giveUpCells: number;
}

/**
 * Estados del Hunter (una pequeña "máquina de estados"):
 *
 *   idle ──(jugador cerca)──▶ chasing ──(jugador lejos)──▶ returning
 *    ▲                          ▲                              │
 *    └──────(llegó a casa)──────┼──────(jugador cerca)─────────┘
 *
 * - idle: quieto en su celda de inicio ("casa"), vigilando.
 * - chasing: baja por el mapa de distancias del jugador.
 * - returning: baja por el mapa de distancias de su casa.
 */
export type HunterState = 'idle' | 'chasing' | 'returning';

/**
 * Hunter: detecta al jugador dentro de un rango y lo persigue por los
 * pasillos, sin atravesar paredes (GDD).
 *
 * La distancia se mide EN PASOS POR PASILLO, no en línea recta: un jugador al
 * otro lado de una pared delgada puede estar a 2 celdas "en el aire" pero a
 * 20 pasos de camino. Así el Hunter no "huele" a través de los muros.
 */
export class Hunter {
  readonly kind = 'hunter' as const;
  state: HunterState = 'idle';
  readonly home: GridPoint;
  private readonly walker: GridWalker;
  private readonly homeField: DistanceField;

  constructor(
    home: GridPoint,
    cells: readonly (readonly CellKind[])[],
    private readonly config: HunterConfig,
  ) {
    this.home = home;
    this.walker = new GridWalker(home, config.speed, config.cellSize);
    this.homeField = new DistanceField(cells, home);
  }

  get x(): number {
    return this.walker.x;
  }
  get y(): number {
    return this.walker.y;
  }
  get facing() {
    return this.walker.facing;
  }
  get moving(): boolean {
    return this.walker.moving;
  }
  get bodyHalf(): number {
    return this.config.bodySize / 2;
  }
  get body(): CenteredBox {
    return { x: this.x, y: this.y, half: this.bodyHalf };
  }

  /** `towardPlayer`: mapa de distancias hacia la celda del jugador (compartido por todos los Hunters). */
  update(dtSeconds: number, towardPlayer: DistanceField): void {
    this.walker.advance(dtSeconds, (cell) => this.chooseNext(cell, towardPlayer));
  }

  /** Solo se decide en el centro de una celda: ahí se cambia de estado y de rumbo. */
  private chooseNext(cell: GridPoint, towardPlayer: DistanceField): GridPoint | null {
    this.state = nextHunterState(this.state, towardPlayer.distanceTo(cell), this.config);
    if (this.state === 'returning' && samePoint(cell, this.home)) this.state = 'idle';

    switch (this.state) {
      case 'chasing':
        return towardPlayer.nextStep(cell);
      case 'returning':
        return this.homeField.nextStep(cell);
      case 'idle':
        return null;
    }
  }
}

/**
 * Transición de estado según la distancia al jugador. Usa DOS umbrales
 * ("histéresis"): con uno solo, un jugador justo en el borde del rango haría
 * que el Hunter cambiara de idea cada fotograma (perseguir, soltar, perseguir...).
 */
export function nextHunterState(
  state: HunterState,
  distanceToPlayer: number,
  config: Pick<HunterConfig, 'detectionCells' | 'giveUpCells'>,
): HunterState {
  if (state === 'chasing') return distanceToPlayer > config.giveUpCells ? 'returning' : 'chasing';
  return distanceToPlayer <= config.detectionCells ? 'chasing' : state;
}

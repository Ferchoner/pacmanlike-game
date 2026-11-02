import { cellCenter } from '../world/gridMath';
import type { GridPoint } from '../world/LevelTypes';
import { type DirectionInput, velocityFromInput } from '../systems/movement';
import { moveAndCollide, type WallGrid } from '../systems/wallCollision';

/** Hacia dónde mira el jugador. Lo usará la animación en la Fase 8. */
export type Facing = 'up' | 'down' | 'left' | 'right';

export interface PlayerConfig {
  /** px/s */
  readonly speed: number;
  /** Lado del cuerpo de colisión, px. */
  readonly bodySize: number;
  /** px; 0 = sin asistencia en esquinas. */
  readonly cornerAssistPx: number;
}

/**
 * El jugador como DATOS + REGLAS, sin Phaser. La escena le pasa la intención
 * (teclas) y el tiempo; él calcula dónde termina. Cómo se dibuja es cosa de
 * `presentation/` (TempPlayerView), que solo lee `x`, `y`, `facing`, `moving`.
 */
export class Player {
  /** Centro del cuerpo, en px del mundo. */
  x: number;
  y: number;
  facing: Facing = 'down';
  /** true si en el último fotograma se desplazó de verdad. */
  moving = false;

  constructor(
    start: GridPoint,
    private readonly config: PlayerConfig,
    private readonly walls: WallGrid,
  ) {
    const c = cellCenter(start, walls.cellSize);
    this.x = c.x;
    this.y = c.y;
  }

  get bodyHalf(): number {
    return this.config.bodySize / 2;
  }

  update(input: DirectionInput, dtSeconds: number): void {
    const velocity = velocityFromInput(input, this.config.speed);
    const result = moveAndCollide(
      this.walls,
      { x: this.x, y: this.y },
      { x: velocity.x * dtSeconds, y: velocity.y * dtSeconds },
      this.bodyHalf,
      this.config.cornerAssistPx,
    );
    this.moving = result.x !== this.x || result.y !== this.y;
    this.x = result.x;
    this.y = result.y;
    this.facing = facingFromInput(input, this.facing);
  }
}

/**
 * Mira hacia donde se empuja (aunque haya pared). En diagonal conserva la
 * dirección anterior si sigue pulsada, para que el sprite no "parpadee"
 * entre dos direcciones; si no, prioriza la horizontal.
 */
export function facingFromInput(input: DirectionInput, previous: Facing): Facing {
  const horizontal: Facing | null = input.x < 0 ? 'left' : input.x > 0 ? 'right' : null;
  const vertical: Facing | null = input.y < 0 ? 'up' : input.y > 0 ? 'down' : null;
  if (previous === horizontal || previous === vertical) return previous;
  return horizontal ?? vertical ?? previous;
}

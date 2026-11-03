import { cellCenter } from '../world/gridMath';
import type { GridPoint } from '../world/LevelTypes';
import { type DirectionInput, velocityFromInput } from '../systems/movement';
import type { CenteredBox } from '../systems/overlap';
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
  /** Distancia total del empujón al recibir un golpe, px (0 = sin empujón). */
  readonly knockbackPx: number;
  /** Duración del empujón, s. Durante él las teclas no mandan. */
  readonly knockbackSeconds: number;
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
  /** Empujón en curso (px/s) y tiempo que le queda. */
  private knockback = { x: 0, y: 0, secondsLeft: 0 };

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

  /** Cuerpo de colisión actual, para los sistemas de recogida y puerta. */
  get body(): CenteredBox {
    return { x: this.x, y: this.y, half: this.bodyHalf };
  }

  get isKnockedBack(): boolean {
    return this.knockback.secondsLeft > 0;
  }

  update(input: DirectionInput, dtSeconds: number): void {
    if (this.isKnockedBack) {
      // Durante el empujón el golpe manda, no las teclas (si no, se anularía
      // empujando hacia el enemigo). Choca con paredes como siempre.
      const t = Math.min(dtSeconds, this.knockback.secondsLeft);
      this.knockback.secondsLeft -= dtSeconds;
      this.moveBy(this.knockback.x * t, this.knockback.y * t, 0);
      return; // no cambia hacia dónde mira: retrocede "de espaldas"
    }
    const velocity = velocityFromInput(input, this.config.speed);
    this.moveBy(velocity.x * dtSeconds, velocity.y * dtSeconds, this.config.cornerAssistPx);
    this.facing = facingFromInput(input, this.facing);
  }

  /**
   * Golpe recibido desde (fromX, fromY): empujón alejándose, por el eje
   * dominante (en pasillos de 1 celda, un empujón diagonal solo rozaría la pared).
   */
  applyKnockback(fromX: number, fromY: number): void {
    const { knockbackPx, knockbackSeconds } = this.config;
    if (knockbackPx <= 0 || knockbackSeconds <= 0) return;
    let dx = this.x - fromX;
    let dy = this.y - fromY;
    if (dx === 0 && dy === 0) {
      // Centros exactamente encima: retrocede contra hacia donde mira.
      const back = FACING_BACK[this.facing];
      dx = back.x;
      dy = back.y;
    }
    const speed = knockbackPx / knockbackSeconds;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    this.knockback = {
      x: horizontal ? Math.sign(dx) * speed : 0,
      y: horizontal ? 0 : Math.sign(dy) * speed,
      secondsLeft: knockbackSeconds,
    };
  }

  /** Desplaza el cuerpo respetando paredes (lo usa también la separación de enemigos). */
  pushBy(dx: number, dy: number): void {
    this.moveBy(dx, dy, 0);
  }

  private moveBy(dx: number, dy: number, cornerAssistPx: number): void {
    const result = moveAndCollide(this.walls, { x: this.x, y: this.y }, { x: dx, y: dy }, this.bodyHalf, cornerAssistPx);
    this.moving = result.x !== this.x || result.y !== this.y;
    this.x = result.x;
    this.y = result.y;
  }
}

const FACING_BACK: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: 1 },
  down: { x: 0, y: -1 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
};

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

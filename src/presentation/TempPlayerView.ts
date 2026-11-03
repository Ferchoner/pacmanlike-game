import type Phaser from 'phaser';
import { GAME_TUNING } from '../data/gameTuning';
import type { Facing, Player } from '../player/Player';
import type { PlayerView } from './PlayerView';

/**
 * TEMP: representación provisional del jugador (círculo verde + muesca que
 * indica hacia dónde mira). Se usa mientras el spritesheet externo del
 * jugador (R-001…R-004) no esté aprobado; ver `PlayerView.ts`.
 *
 * A propósito el círculo (28 px) es MÁS GRANDE que el cuerpo de colisión
 * (22 px): lo que se ve y lo que choca son cosas distintas. Con B se muestra
 * el cuerpo real (caja magenta) para poder comprobarlo.
 */
const VISUAL_RADIUS = 14;
const COLOR = 0x33cc66;
const HITBOX_COLOR = 0xff00ff;
/** Parpadeo TEMP durante la invulnerabilidad: cada cuánto alterna, y la opacidad "apagada". */
const BLINK_PERIOD_S = 0.1;
const BLINK_DIM_ALPHA = 0.25;

const FACING_VECTOR: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export class TempPlayerView implements PlayerView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private showHitbox = false;
  private lastFacing: Facing | null = null;

  constructor(scene: Phaser.Scene, private readonly player: Player) {
    this.graphics = scene.add.graphics();
    this.sync();
  }

  toggleHitbox(): void {
    this.showHitbox = !this.showHitbox;
    this.lastFacing = null; // fuerza redibujar
    this.sync();
  }

  /**
   * Parpadeo mientras dura la invulnerabilidad: es la forma clásica de decir
   * "ahora no te pueden dañar". Se calcula desde el tiempo RESTANTE del sistema
   * de daño, así la vista no lleva su propio reloj y nunca se desincroniza.
   * No se vuelve invisible del todo: el jugador siempre debe verse a sí mismo.
   */
  setInvulnerable(secondsLeft: number): void {
    const dim = secondsLeft > 0 && Math.floor(secondsLeft / BLINK_PERIOD_S) % 2 === 0;
    this.graphics.setAlpha(dim ? BLINK_DIM_ALPHA : 1);
  }

  /** TEMP: sin animación de golpe; el parpadeo de invulnerabilidad ya lo indica. */
  playHurt(): void {}

  /**
   * TEMP: "animación" de muerte provisional: el círculo se encoge y se
   * desvanece. NO es arte: es un marcador técnico que ocupa el hueco de la
   * animación externa R-004 (`death`). Dura `deathSequenceSeconds`.
   */
  playDeath(scene: Phaser.Scene): number {
    const seconds = GAME_TUNING.deathSequenceSeconds;
    this.graphics.setAlpha(1); // por si murió en mitad del parpadeo
    scene.tweens.add({
      targets: this.graphics,
      alpha: 0,
      scale: 0.2,
      duration: seconds * 1000,
      ease: 'Quad.easeIn',
    });
    return seconds;
  }

  /** Copia la posición del modelo a la vista. Se llama cada fotograma. */
  sync(): void {
    this.graphics.setPosition(this.player.x, this.player.y);
    // Solo redibujamos la forma si cambió la dirección (dibujar cuesta más que mover).
    if (this.player.facing !== this.lastFacing) this.redraw(this.player.facing);
  }

  private redraw(facing: Facing): void {
    const g = this.graphics;
    const dir = FACING_VECTOR[facing];
    g.clear();
    g.fillStyle(COLOR, 1);
    g.fillCircle(0, 0, VISUAL_RADIUS);
    g.fillStyle(0x000000, 1);
    g.fillCircle(dir.x * (VISUAL_RADIUS - 5), dir.y * (VISUAL_RADIUS - 5), 3);
    if (this.showHitbox) {
      const half = this.player.bodyHalf;
      g.lineStyle(1, HITBOX_COLOR, 1);
      g.strokeRect(-half, -half, half * 2, half * 2);
    }
    this.lastFacing = facing;
  }
}

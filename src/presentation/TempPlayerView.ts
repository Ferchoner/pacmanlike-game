import type Phaser from 'phaser';
import type { Facing, Player } from '../player/Player';

/**
 * TEMP: representación provisional del jugador (círculo verde + muesca que
 * indica hacia dónde mira). Se sustituirá por el spritesheet externo en la
 * Fase 8; la lógica (`Player`) no cambiará.
 *
 * A propósito el círculo (28 px) es MÁS GRANDE que el cuerpo de colisión
 * (22 px): lo que se ve y lo que choca son cosas distintas. Con B se muestra
 * el cuerpo real (caja magenta) para poder comprobarlo.
 */
const VISUAL_RADIUS = 14;
const COLOR = 0x33cc66;
const HITBOX_COLOR = 0xff00ff;

const FACING_VECTOR: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export class TempPlayerView {
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

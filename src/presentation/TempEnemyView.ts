import type Phaser from 'phaser';
import type { Enemy } from '../enemies/EnemyGroup';
import type { HunterState } from '../enemies/Hunter';
import type { Facing } from '../player/Player';

/**
 * TEMP: representación provisional de un enemigo (círculo de color con su
 * letra del mapa y una muesca hacia donde mira). Se sustituirá por los
 * spritesheets externos en la Fase 8; la lógica (`enemies/`) no cambiará.
 *
 * El color del Hunter muestra su estado para poder VER la máquina de estados:
 * granate = vigilando (idle), rojo = persiguiendo, rosa = volviendo a casa.
 * Con B se ve el cuerpo de colisión (magenta); el borde blanco indica que
 * ahora mismo toca al jugador (si no está invulnerable, eso le quita un corazón).
 */
const VISUAL_RADIUS = 13;
const PATROL_COLOR = 0xff9933;
const HUNTER_COLORS: Record<HunterState, number> = {
  idle: 0x992222,
  chasing: 0xff3333,
  returning: 0xff88aa,
};
const HITBOX_COLOR = 0xff00ff;
const TOUCH_COLOR = 0xffffff;

const FACING_VECTOR: Record<Facing, { x: number; y: number }> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

export class TempEnemyView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly letter: Phaser.GameObjects.Text;
  private showHitbox = false;
  /** Clave del último dibujo: solo se redibuja si cambia algo visible. */
  private lastKey = '';

  constructor(scene: Phaser.Scene, private readonly enemy: Enemy) {
    this.graphics = scene.add.graphics().setDepth(5);
    this.letter = scene.add
      .text(0, 0, enemy.kind === 'hunter' ? 'H' : 'T', {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#000000',
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.sync(false);
  }

  toggleHitbox(): void {
    this.showHitbox = !this.showHitbox;
    this.lastKey = '';
  }

  /** Copia la posición del modelo a la vista. Se llama cada fotograma. */
  sync(touchingPlayer: boolean): void {
    const { enemy } = this;
    this.graphics.setPosition(enemy.x, enemy.y);
    this.letter.setPosition(enemy.x, enemy.y);
    const color = enemy.kind === 'hunter' ? HUNTER_COLORS[enemy.state] : PATROL_COLOR;
    const key = `${color}|${enemy.facing}|${touchingPlayer}|${this.showHitbox}`;
    if (key !== this.lastKey) this.redraw(color, enemy.facing, touchingPlayer);
    this.lastKey = key;
  }

  private redraw(color: number, facing: Facing, touching: boolean): void {
    const g = this.graphics;
    const dir = FACING_VECTOR[facing];
    g.clear();
    g.fillStyle(color, 1);
    g.fillCircle(0, 0, VISUAL_RADIUS);
    g.fillStyle(0x000000, 1);
    g.fillCircle(dir.x * (VISUAL_RADIUS - 3), dir.y * (VISUAL_RADIUS - 3), 2);
    if (touching) {
      g.lineStyle(2, TOUCH_COLOR, 1);
      g.strokeCircle(0, 0, VISUAL_RADIUS + 1);
    }
    if (this.showHitbox) {
      const half = this.enemy.bodyHalf;
      g.lineStyle(1, HITBOX_COLOR, 1);
      g.strokeRect(-half, -half, half * 2, half * 2);
    }
  }
}

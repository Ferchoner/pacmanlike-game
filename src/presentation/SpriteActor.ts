import type Phaser from 'phaser';
import type { Facing } from '../player/Player';
import { animationsOf } from './AnimationManager';
import { animKey, chooseAnimation } from './assets/animationChoice';
import { ART_SCALE, loadSpecFor } from './assets/gameAssets';

/**
 * Un personaje dibujado con su spritesheet externo (jugador o enemigo).
 *
 * Recibe el ESTADO (dirección, si se mueve, acción especial) y elige la
 * animación; no decide nada de reglas. Es la otra mitad de "separar gameplay
 * de presentación": el modelo dice QUÉ pasa, el actor decide CÓMO se ve.
 */
export class SpriteActor {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly names: ReadonlySet<string>;
  private current = '';

  constructor(scene: Phaser.Scene, private readonly textureKey: string, depth: number) {
    const spec = loadSpecFor(textureKey);
    const origin = spec && spec.kind !== 'audio' ? spec.origin : undefined;
    this.sprite = scene.add
      .sprite(0, 0, textureKey, 0)
      .setScale(ART_SCALE)
      .setOrigin(origin?.x ?? 0.5, origin?.y ?? 0.5)
      .setDepth(depth);
    this.names = new Set(animationsOf(textureKey).keys());
  }

  has(name: string): boolean {
    return this.names.has(name);
  }

  /**
   * Muestra `action` hacia `facing` ('walk', 'idle', 'damage'…). Si no hay
   * animación de reposo, se queda quieto en el primer frame de caminar:
   * mejor eso que un personaje que "camina en el sitio".
   */
  show(action: string, facing: Facing): void {
    const choice = chooseAnimation(this.names, action, facing);
    const still = !choice && action === 'idle';
    const pick = choice ?? (still ? chooseAnimation(this.names, 'walk', facing) : null);
    if (!pick) return; // sin animaciones: se ve el frame 0 de la textura
    const id = `${pick.name}|${pick.flipX}|${still}`;
    if (id === this.current) return;
    this.current = id;
    this.sprite.setFlipX(pick.flipX);
    this.sprite.play(animKey(this.textureKey, pick.name));
    if (still) this.sprite.anims.stop();
  }

  /** Reproduce una animación de una sola pasada (muerte) y olvida el estado previo. */
  playOnce(name: string): void {
    this.current = name;
    this.sprite.play(animKey(this.textureKey, name));
  }
}

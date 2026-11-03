import type Phaser from 'phaser';
import type { Facing } from '../player/Player';
import { actorInfo } from './AnimationManager';
import { animKey, chooseAnimation, type AnimationChoice } from './assets/animationChoice';

/**
 * Un personaje dibujado con sus spritesheets externos (jugador o enemigo).
 *
 * Recibe el ESTADO (dirección, si se mueve, acción especial) y elige la
 * animación; no decide nada de reglas. Es la otra mitad de "separar gameplay
 * de presentación": el modelo dice QUÉ pasa, el actor decide CÓMO se ve.
 */
export class SpriteActor {
  readonly sprite: Phaser.GameObjects.Sprite;
  private readonly names: ReadonlySet<string>;
  private current = '';
  /**
   * Último lado al que miró (izquierda/derecha). Los sheets de vista lateral
   * no tienen arriba/abajo: al subir o bajar se sigue mirando a ese lado.
   */
  private lastSide: Facing = 'right';

  constructor(scene: Phaser.Scene, private readonly actor: string, depth: number) {
    const info = actorInfo(actor);
    if (!info) throw new Error(`SpriteActor: "${actor}" no tiene animaciones cargadas`);
    this.sprite = scene.add
      .sprite(0, 0, info.firstTexture, 0)
      .setScale(info.scale)
      .setOrigin(info.origin?.x ?? 0.5, info.origin?.y ?? 0.5)
      .setDepth(depth);
    this.names = new Set(info.animations.keys());
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
    if (facing === 'left' || facing === 'right') this.lastSide = facing;
    const choice = this.choose(action, facing);
    const still = !choice && action === 'idle';
    const pick = choice ?? (still ? this.choose('walk', facing) : null);
    if (!pick) return; // sin animaciones: se ve el frame 0 de la textura
    const id = `${pick.name}|${pick.flipX}|${still}`;
    if (id === this.current) return;
    this.current = id;
    this.sprite.setFlipX(pick.flipX);
    this.sprite.play(animKey(this.actor, pick.name));
    if (still) this.sprite.anims.stop();
  }

  /** Reproduce una animación de una sola pasada (muerte) y olvida el estado previo. */
  playOnce(name: string): void {
    this.current = name;
    this.sprite.play(animKey(this.actor, name));
  }

  /** Dirección exacta; si no existe (sheet lateral subiendo), el último lado. */
  private choose(action: string, facing: Facing): AnimationChoice | null {
    return chooseAnimation(this.names, action, facing) ?? chooseAnimation(this.names, action, this.lastSide);
  }
}

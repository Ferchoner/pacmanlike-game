import type Phaser from 'phaser';
import { GAME_TUNING } from '../data/gameTuning';
import type { Player } from '../player/Player';
import { actorInfo } from './AnimationManager';
import { animationSeconds } from './assets/animationChoice';
import { Actors } from './assets/assetKeys';
import { SpriteActor } from './SpriteActor';
import { TempPlayerView } from './TempPlayerView';

/** Lo que la escena necesita de la vista del jugador, sea TEMP o sprite. */
export interface PlayerView {
  toggleHitbox(): void;
  setInvulnerable(secondsLeft: number): void;
  /** Golpe recibido (perdió un corazón): animación de daño si existe. */
  playHurt(): void;
  /** Empieza la secuencia de muerte y devuelve cuánto dura, en segundos. */
  playDeath(scene: Phaser.Scene): number;
  sync(): void;
}

const HITBOX_COLOR = 0xff00ff;
const BLINK_PERIOD_S = 0.1;
const BLINK_DIM_ALPHA = 0.25;

/** Sprite si las animaciones del jugador (R-001…R-004) se cargaron; si no, TEMP. */
export function createPlayerView(scene: Phaser.Scene, player: Player): PlayerView {
  return actorInfo(Actors.player)
    ? new SpritePlayerView(scene, player)
    : new TempPlayerView(scene, player);
}

/** El jugador con su spritesheet externo. */
class SpritePlayerView implements PlayerView {
  private readonly actor: SpriteActor;
  private readonly hitbox: Phaser.GameObjects.Graphics;
  private dying = false;
  /** true mientras se ve la animación de golpe completa (R-003). */
  private hurting = false;

  constructor(scene: Phaser.Scene, private readonly player: Player) {
    this.actor = new SpriteActor(scene, Actors.player, 6);
    this.hitbox = scene.add.graphics().setDepth(20).setVisible(false);
    const half = player.bodyHalf;
    this.hitbox.lineStyle(1, HITBOX_COLOR, 1).strokeRect(-half, -half, half * 2, half * 2);
    this.sync();
  }

  toggleHitbox(): void {
    this.hitbox.setVisible(!this.hitbox.visible);
  }

  setInvulnerable(secondsLeft: number): void {
    const dim = secondsLeft > 0 && Math.floor(secondsLeft / BLINK_PERIOD_S) % 2 === 0;
    this.actor.sprite.setAlpha(dim ? BLINK_DIM_ALPHA : 1);
  }

  /**
   * R-003: la animación de golpe se ve ENTERA, aunque el empujón (0.15 s)
   * termine antes. Si no, con 4 frames a 12 FPS solo se verían 1 o 2.
   */
  playHurt(): void {
    if (this.dying) return;
    this.hurting = this.actor.playOnce('damage', this.player.facing, () => {
      this.hurting = false;
    });
  }

  playDeath(scene: Phaser.Scene): number {
    this.dying = true;
    this.actor.sprite.setAlpha(1);
    const death = actorInfo(Actors.player)?.animations.get('death')?.spec;
    if (death) {
      // R-004: la secuencia dura EXACTAMENTE lo que dura su animación.
      this.actor.playOnce('death', this.player.facing);
      return animationSeconds(death);
    }
    // Hay sprite pero aún no animación de muerte: desvanecido TEMP.
    const seconds = GAME_TUNING.deathSequenceSeconds;
    scene.tweens.add({ targets: this.actor.sprite, alpha: 0, duration: seconds * 1000 });
    return seconds;
  }

  sync(): void {
    const { player, actor } = this;
    actor.sprite.setPosition(player.x, player.y);
    this.hitbox.setPosition(player.x, player.y);
    if (this.dying || this.hurting) return; // no cortar una animación de una sola pasada
    actor.show(player.moving ? 'walk' : 'idle', player.facing);
  }
}

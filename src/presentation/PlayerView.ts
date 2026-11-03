import type Phaser from 'phaser';
import { GAME_TUNING } from '../data/gameTuning';
import type { Player } from '../player/Player';
import { animationsOf } from './AnimationManager';
import { animationSeconds } from './assets/animationChoice';
import { TextureKeys } from './assets/assetKeys';
import { SpriteActor } from './SpriteActor';
import { TempPlayerView } from './TempPlayerView';

/** Lo que la escena necesita de la vista del jugador, sea TEMP o sprite. */
export interface PlayerView {
  toggleHitbox(): void;
  setInvulnerable(secondsLeft: number): void;
  /** Empieza la secuencia de muerte y devuelve cuánto dura, en segundos. */
  playDeath(scene: Phaser.Scene): number;
  sync(): void;
}

const HITBOX_COLOR = 0xff00ff;
const BLINK_PERIOD_S = 0.1;
const BLINK_DIM_ALPHA = 0.25;

/** Sprite si el spritesheet del jugador (R-001…R-004) se cargó; si no, TEMP. */
export function createPlayerView(scene: Phaser.Scene, player: Player): PlayerView {
  return scene.textures.exists(TextureKeys.player)
    ? new SpritePlayerView(scene, player)
    : new TempPlayerView(scene, player);
}

/** El jugador con su spritesheet externo. */
class SpritePlayerView implements PlayerView {
  private readonly actor: SpriteActor;
  private readonly hitbox: Phaser.GameObjects.Graphics;
  private dying = false;

  constructor(scene: Phaser.Scene, private readonly player: Player) {
    this.actor = new SpriteActor(scene, TextureKeys.player, 6);
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

  playDeath(scene: Phaser.Scene): number {
    this.dying = true;
    this.actor.sprite.setAlpha(1);
    const death = animationsOf(TextureKeys.player).get('death');
    if (death) {
      // R-004: la secuencia dura EXACTAMENTE lo que dura su animación.
      this.actor.playOnce('death');
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
    if (this.dying) return;
    // R-003 (damage) durante el empujón, si existe; si no, sigue caminando/quieto.
    const action = player.isKnockedBack && actor.has('damage') ? 'damage' : player.moving ? 'walk' : 'idle';
    actor.show(action, player.facing);
  }
}

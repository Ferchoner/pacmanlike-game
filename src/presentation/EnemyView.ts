import type Phaser from 'phaser';
import type { Enemy } from '../enemies/EnemyGroup';
import { actorInfo } from './AnimationManager';
import { Actors } from './assets/assetKeys';
import { SpriteActor } from './SpriteActor';
import { TempEnemyView } from './TempEnemyView';

export interface EnemyView {
  toggleHitbox(): void;
  sync(touchingPlayer: boolean): void;
}

const HITBOX_COLOR = 0xff00ff;

/** Sprite si llegaron las animaciones de ese tipo (R-005 Hunter, R-007 Patrol); si no, TEMP. */
export function createEnemyView(scene: Phaser.Scene, enemy: Enemy): EnemyView {
  const actor = enemy.kind === 'hunter' ? Actors.hunter : Actors.patrol;
  return actorInfo(actor) ? new SpriteEnemyView(scene, enemy, actor) : new TempEnemyView(scene, enemy);
}

class SpriteEnemyView implements EnemyView {
  private readonly actor: SpriteActor;
  private readonly hitbox: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, private readonly enemy: Enemy, actor: string) {
    this.actor = new SpriteActor(scene, actor, 5);
    this.hitbox = scene.add.graphics().setDepth(20).setVisible(false);
    const half = enemy.bodyHalf;
    this.hitbox.lineStyle(1, HITBOX_COLOR, 1).strokeRect(-half, -half, half * 2, half * 2);
    this.sync(false);
  }

  toggleHitbox(): void {
    this.hitbox.setVisible(!this.hitbox.visible);
  }

  sync(_touchingPlayer: boolean): void {
    const { enemy, actor } = this;
    actor.sprite.setPosition(enemy.x, enemy.y);
    this.hitbox.setPosition(enemy.x, enemy.y);
    actor.show(enemy.moving ? 'walk' : 'idle', enemy.facing);
  }
}

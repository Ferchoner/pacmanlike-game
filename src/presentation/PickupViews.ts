import type Phaser from 'phaser';
import type { ExitState } from '../systems/levelProgress';
import type { GridPoint } from '../world/LevelTypes';
import { cellCenter } from '../world/gridMath';
import { animationsOf } from './AnimationManager';
import { animKey } from './assets/animationChoice';
import { TextureKeys } from './assets/assetKeys';
import { ART_SCALE } from './assets/gameAssets';
import { TempExitView } from './TempExitView';
import { TempGemsView } from './TempGemsView';

export interface GemsView {
  hide(index: number): void;
}
export interface ExitView {
  show(state: ExitState): void;
}

/** Gemas con el sprite R-012 (y su animación `shine` si la ficha la trae); si no, TEMP. */
export function createGemsView(scene: Phaser.Scene, gems: readonly GridPoint[]): GemsView {
  if (!scene.textures.exists(TextureKeys.gem)) return new TempGemsView(scene, gems);
  const shine = animationsOf(TextureKeys.gem).has('shine');
  const sprites = gems.map((gem) => {
    const c = cellCenter(gem);
    const sprite = scene.add.sprite(c.x, c.y, TextureKeys.gem, 0).setScale(ART_SCALE).setDepth(2);
    if (shine) sprite.play(animKey(TextureKeys.gem, 'shine'));
    return sprite;
  });
  return { hide: (index) => sprites[index]?.setVisible(false) };
}

/** Puerta con R-013 (cerrada) y R-014 (abierta). Hacen falta las DOS; si no, TEMP. */
export function createExitView(scene: Phaser.Scene, cell: GridPoint): ExitView {
  const { exitClosed, exitOpen } = TextureKeys;
  if (!scene.textures.exists(exitClosed) || !scene.textures.exists(exitOpen)) {
    return new TempExitView(scene, cell);
  }
  const c = cellCenter(cell);
  const image = scene.add.image(c.x, c.y, exitClosed).setScale(ART_SCALE).setDepth(2);
  return { show: (state) => image.setTexture(state === 'open' ? exitOpen : exitClosed) };
}

import type Phaser from 'phaser';
import type { ExitState } from '../systems/levelProgress';
import type { GridPoint } from '../world/LevelTypes';
import { cellCenter } from '../world/gridMath';
import { Frames } from './assets/assetKeys';
import { namedFrame, type FrameRef } from './assets/gameAssets';
import { TempExitView } from './TempExitView';
import { TempGemsView } from './TempGemsView';

export interface GemsView {
  hide(index: number): void;
}
export interface ExitView {
  show(state: ExitState): void;
}

/** El frame con ese nombre, solo si su textura se cargó de verdad. */
export function loadedFrame(scene: Phaser.Scene, name: string): FrameRef | undefined {
  const ref = namedFrame(name);
  return ref && scene.textures.exists(ref.key) ? ref : undefined;
}

/** Gemas con el arte R-012; si no hay, TEMP. */
export function createGemsView(scene: Phaser.Scene, gems: readonly GridPoint[]): GemsView {
  const gem = loadedFrame(scene, Frames.gem);
  if (!gem) return new TempGemsView(scene, gems);
  const sprites = gems.map((cell) => {
    const c = cellCenter(cell);
    return scene.add.image(c.x, c.y, gem.key, gem.frame).setScale(gem.scale).setDepth(2);
  });
  return { hide: (index) => sprites[index]?.setVisible(false) };
}

/** Puerta con R-013 (cerrada) y R-014 (abierta). Hacen falta las DOS; si no, TEMP. */
export function createExitView(scene: Phaser.Scene, cell: GridPoint): ExitView {
  const closed = loadedFrame(scene, Frames.exitClosed);
  const open = loadedFrame(scene, Frames.exitOpen);
  if (!closed || !open) return new TempExitView(scene, cell);
  const c = cellCenter(cell);
  const image = scene.add.image(c.x, c.y, closed.key, closed.frame).setScale(closed.scale).setDepth(2);
  return {
    show: (state) => {
      const ref = state === 'open' ? open : closed;
      image.setTexture(ref.key, ref.frame).setScale(ref.scale);
    },
  };
}

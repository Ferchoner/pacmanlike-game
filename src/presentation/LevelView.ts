import type Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import type { Level } from '../world/LevelTypes';
import { Frames } from './assets/assetKeys';
import type { FrameRef } from './assets/gameAssets';
import { tileRole } from './levelTiles';
import { loadedFrame } from './PickupViews';
import { renderTempLevel } from './TempLevelRenderer';

/**
 * Dibuja el mapa con el tileset externo (R-009 suelo, R-010 paredes) si sus
 * piezas están cargadas; si falta alguna, el dibujo TEMP de siempre.
 *
 * Se usa un TILEMAP de Phaser: en vez de 432 imágenes sueltas (24×18), una
 * sola capa que la tarjeta gráfica pinta de una vez. Los datos del mapa no
 * cambian: solo se traduce cada celda (pared/suelo) a un índice del tileset.
 */
export function renderLevel(scene: Phaser.Scene, level: Level): void {
  const floor = loadedFrame(scene, Frames.floor);
  const wallTop = loadedFrame(scene, Frames.wallTop);
  const wallSide = loadedFrame(scene, Frames.wallSide);
  if (!floor || !wallTop || !wallSide || !sameSheet([floor, wallTop, wallSide])) {
    renderTempLevel(scene, level);
    return;
  }
  const variants = Frames.floorVariants
    .map((name) => loadedFrame(scene, name))
    .filter((ref): ref is FrameRef => ref !== undefined && ref.key === floor.key);
  const frameOf = (role: string): number => {
    if (role === 'wall-top') return wallTop.frame;
    if (role === 'wall-side') return wallSide.frame;
    if (role === 'floor') return floor.frame;
    return variants[Number(role.slice('floor-'.length)) - 2]?.frame ?? floor.frame;
  };

  const data = level.cells.map((row, y) => row.map((_, x) => frameOf(tileRole(level.cells, x, y, variants.length))));
  // Tamaño del tile en el PNG; con la escala de la ficha debe medir una celda.
  const source = scene.textures.getFrame(floor.key, floor.frame);
  const tilePx = source.width;
  if (tilePx * floor.scale !== GRID.cellSize) {
    console.warn(`[tileset] ${tilePx} px × ${floor.scale} ≠ celda de ${GRID.cellSize} px: revisa "scale" en el manifest`);
  }
  const map = scene.make.tilemap({ data, tileWidth: tilePx, tileHeight: tilePx });
  const tileset = map.addTilesetImage(floor.key, floor.key, tilePx, tilePx);
  if (!tileset) {
    renderTempLevel(scene, level);
    return;
  }
  map.createLayer(0, tileset, 0, 0)?.setScale(floor.scale).setDepth(0);
}

/** Las piezas deben estar en el mismo PNG para formar un solo tileset. */
function sameSheet(refs: readonly FrameRef[]): boolean {
  return refs.every((r) => r.key === refs[0]!.key && r.scale === refs[0]!.scale);
}

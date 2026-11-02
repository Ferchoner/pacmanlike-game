import type { GridPoint } from '../world/LevelTypes';
import { cellCenter } from '../world/gridMath';
import type Phaser from 'phaser';

/**
 * TEMP: texto técnico de desarrollo, centrado. No es arte ni UI final;
 * se reemplazará en la Fase 7 (UI y escenas) con los recursos externos.
 */
export function addTempLabel(
  scene: Phaser.Scene,
  y: number,
  text: string,
  fontSize = 20,
): Phaser.GameObjects.Text {
  return scene.add
    .text(scene.scale.width / 2, y, text, {
      fontFamily: 'monospace',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      align: 'center',
    })
    .setOrigin(0.5);
}

/** TEMP: una letra centrada en una celda del mapa (marcadores de depuración). */
export function addCellLetter(
  scene: Phaser.Scene,
  point: GridPoint,
  letter: string,
  color: number,
): Phaser.GameObjects.Text {
  const c = cellCenter(point);
  return scene.add
    .text(c.x, c.y, letter, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: `#${color.toString(16).padStart(6, '0')}`,
    })
    .setOrigin(0.5);
}

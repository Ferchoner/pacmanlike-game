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

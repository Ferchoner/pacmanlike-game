import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';
import { addTempLabel } from '../presentation/tempLabel';

/**
 * Game Over (TEMP). Morir reinicia toda la run (CONTEXTO_MAESTRO), así que
 * volvemos al menú y la próxima partida empieza desde cero.
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.GameOver);
  }

  create(): void {
    const { height } = this.scale;
    addTempLabel(this, height / 2 - 20, 'GAME OVER', 36);
    addTempLabel(this, height / 2 + 30, 'Pulsa ENTER para volver al menú');

    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start(SceneKeys.Menu);
    });
  }
}

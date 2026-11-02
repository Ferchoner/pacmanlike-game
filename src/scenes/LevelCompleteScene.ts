import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';
import { addTempLabel } from '../presentation/tempLabel';

/** Datos que la partida le pasa a esta escena al terminar el nivel. */
export interface LevelCompleteData {
  readonly gems: number;
  readonly totalGems: number;
}

/**
 * Nivel completado (TEMP). El MVP solo tiene el Nivel 1, así que de aquí se
 * vuelve al menú. La pantalla final llega en la Fase 7.
 */
export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.LevelComplete);
  }

  create(data: Partial<LevelCompleteData>): void {
    const { height } = this.scale;
    addTempLabel(this, height / 2 - 40, '¡NIVEL COMPLETADO!', 36);
    if (data.gems !== undefined && data.totalGems !== undefined) {
      addTempLabel(this, height / 2 + 10, `Gemas: ${data.gems}/${data.totalGems}`);
    }
    addTempLabel(this, height / 2 + 50, 'Pulsa ENTER para volver al menú');
    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start(SceneKeys.Menu);
    });
  }
}

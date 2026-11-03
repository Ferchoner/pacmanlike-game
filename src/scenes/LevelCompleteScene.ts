import Phaser from 'phaser';
import { nextScene } from '../core/sceneFlow';
import { SceneKeys } from '../core/SceneKeys';
import { GAME_TUNING } from '../data/gameTuning';
import { levelCompleteLines } from '../presentation/ui/screenText';
import { bindScreenControls, renderTempScreen } from '../presentation/ui/TempScreen';
import { isRunSummary } from '../systems/runSummary';
import { showMissingSummary } from './showMissingSummary';

/**
 * Nivel completado (TEMP). El MVP solo tiene el Nivel 1, así que desde aquí
 * se juega otra vez o se vuelve al menú (con Nivel 2, cambiaría `sceneFlow`).
 */
export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.LevelComplete);
  }

  create(data: unknown): void {
    if (isRunSummary(data)) renderTempScreen(this, levelCompleteLines(data));
    else showMissingSummary(this, '¡NIVEL COMPLETADO!');
    bindScreenControls(this, {
      onConfirm: () => this.scene.start(nextScene(SceneKeys.LevelComplete, 'retry')),
      onBack: () => this.scene.start(nextScene(SceneKeys.LevelComplete, 'menu')),
      inputDelaySeconds: GAME_TUNING.screenInputDelaySeconds,
    });
  }
}

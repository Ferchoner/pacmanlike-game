import Phaser from 'phaser';
import { nextScene } from '../core/sceneFlow';
import { SceneKeys } from '../core/SceneKeys';
import { NEW_RUN_DATA } from '../systems/campaign';
import { GAME_TUNING } from '../data/gameTuning';
import { victoryLines } from '../presentation/ui/screenText';
import { bindScreenControls, renderTempScreen } from '../presentation/ui/TempScreen';
import { isRunSummary } from '../systems/runSummary';
import { showMissingSummary } from './showMissingSummary';

/**
 * Victoria (TEMP): se llega al completar el ÚLTIMO nivel de la campaña.
 * Muestra el resumen de toda la run; desde aquí se empieza una run nueva o
 * se vuelve al menú. La pantalla definitiva llegará con su arte (como R-017/R-018).
 */
export class VictoryScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Victory);
  }

  create(data: unknown): void {
    if (isRunSummary(data)) renderTempScreen(this, victoryLines(data));
    else showMissingSummary(this, '¡VICTORIA!');
    bindScreenControls(this, {
      onConfirm: () => this.scene.start(nextScene(SceneKeys.Victory, 'retry'), NEW_RUN_DATA),
      onBack: () => this.scene.start(nextScene(SceneKeys.Victory, 'menu')),
      inputDelaySeconds: GAME_TUNING.screenInputDelaySeconds,
    });
  }
}

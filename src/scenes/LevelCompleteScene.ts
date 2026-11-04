import Phaser from 'phaser';
import { nextScene } from '../core/sceneFlow';
import { SceneKeys } from '../core/SceneKeys';
import { GAME_TUNING } from '../data/gameTuning';
import { isFinalLevel, levelCompleteLines } from '../presentation/ui/screenText';
import { bindScreenControls, renderTempScreen } from '../presentation/ui/TempScreen';
import { NEW_RUN_DATA, nextLevelRun } from '../systems/campaign';
import { isRunSummary } from '../systems/runSummary';
import { showMissingSummary } from './showMissingSummary';

/**
 * Nivel completado (TEMP). Es el "pasillo" entre niveles de la campaña:
 * - si quedan niveles, ENTER arranca el siguiente con los corazones que
 *   te quedaron (`campaign.nextLevelRun`);
 * - si era el último, ENTER lleva a la Victoria con el resumen de la run;
 * - ESC vuelve al menú y la run se pierde.
 */
export class LevelCompleteScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.LevelComplete);
  }

  create(data: unknown): void {
    if (!isRunSummary(data)) {
      showMissingSummary(this, '¡NIVEL COMPLETADO!');
      bindScreenControls(this, {
        onConfirm: () => this.scene.start(SceneKeys.Game, NEW_RUN_DATA), // sin resumen: run nueva
        onBack: () => this.scene.start(nextScene(SceneKeys.LevelComplete, 'menu')),
        inputDelaySeconds: GAME_TUNING.screenInputDelaySeconds,
      });
      return;
    }

    const next = nextLevelRun(data.campaign, {
      maxHearts: data.maxHearts,
      carryHearts: GAME_TUNING.carryHeartsBetweenLevels,
    });
    renderTempScreen(this, levelCompleteLines(data, next.hearts));
    bindScreenControls(this, {
      onConfirm: () =>
        isFinalLevel(data)
          ? this.scene.start(nextScene(SceneKeys.LevelComplete, 'finish'), data)
          : this.scene.start(nextScene(SceneKeys.LevelComplete, 'next'), next),
      onBack: () => this.scene.start(nextScene(SceneKeys.LevelComplete, 'menu')),
      inputDelaySeconds: GAME_TUNING.screenInputDelaySeconds,
    });
  }
}

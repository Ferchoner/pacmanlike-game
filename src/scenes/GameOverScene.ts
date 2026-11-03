import Phaser from 'phaser';
import { nextScene } from '../core/sceneFlow';
import { SceneKeys } from '../core/SceneKeys';
import { GAME_TUNING } from '../data/gameTuning';
import { gameOverLines } from '../presentation/ui/screenText';
import { bindScreenControls, renderTempScreen } from '../presentation/ui/TempScreen';
import { isRunSummary } from '../systems/runSummary';
import { showMissingSummary } from './showMissingSummary';

/**
 * Game Over (TEMP). Muestra cómo terminó la run (dato real que pasa la
 * partida). Morir reinicia TODA la run: "jugar otra vez" llama de nuevo a
 * GameScene.create(), que crea todo desde cero (3 corazones, 0 gemas).
 */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.GameOver);
  }

  create(data: unknown): void {
    if (isRunSummary(data)) renderTempScreen(this, gameOverLines(data));
    else showMissingSummary(this, 'GAME OVER');
    bindScreenControls(this, {
      onConfirm: () => this.scene.start(nextScene(SceneKeys.GameOver, 'retry')),
      onBack: () => this.scene.start(nextScene(SceneKeys.GameOver, 'menu')),
      inputDelaySeconds: GAME_TUNING.screenInputDelaySeconds,
    });
  }
}

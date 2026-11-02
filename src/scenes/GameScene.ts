import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';
import { LEVEL_1 } from '../data/levels';
import { addTempLabel } from '../presentation/tempLabel';
import { renderTempLevel } from '../presentation/TempLevelRenderer';
import { LevelValidationError, loadLevel } from '../world/loadLevel';

/**
 * Game: aquí vive la partida. Se mantiene DELGADA: solo coordina módulos.
 * - `world/` carga y valida el nivel desde datos (el mapa no está escrito aquí).
 * - `presentation/` lo dibuja (hoy con placeholders TEMP).
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    try {
      const { level, warnings } = loadLevel(LEVEL_1);
      for (const w of warnings) console.warn(`[nivel ${level.id}] ${w.message}`);
      renderTempLevel(this, level);
    } catch (error) {
      this.showLevelError(error);
    }

    // TEMP: atajo solo para comprobar el flujo de escenas. Se quita en la Fase 6,
    // cuando el Game Over llegue por perder los 3 corazones.
    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(SceneKeys.GameOver);
    });
  }

  /**
   * Si el nivel no es válido NO lo arreglamos ni lo dibujamos a medias:
   * mostramos los problemas en pantalla para que una persona decida.
   */
  private showLevelError(error: unknown): void {
    if (!(error instanceof LevelValidationError)) throw error;
    console.error(error.message, error.issues);
    addTempLabel(this, 40, 'Nivel inválido (TEMP)', 24);
    error.issues.slice(0, 15).forEach((issue, i) => {
      addTempLabel(this, 90 + i * 24, issue.message, 13);
    });
  }
}

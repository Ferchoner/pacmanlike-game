import Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import { SceneKeys } from '../core/SceneKeys';
import { GAME_TUNING } from '../data/gameTuning';
import { LEVEL_1 } from '../data/levels';
import { KeyboardPlayerInput } from '../player/KeyboardPlayerInput';
import { Player } from '../player/Player';
import { addTempLabel } from '../presentation/tempLabel';
import { renderTempLevel } from '../presentation/TempLevelRenderer';
import { TempPlayerView } from '../presentation/TempPlayerView';
import { LevelValidationError, loadLevel } from '../world/loadLevel';

/**
 * Game: aquí vive la partida. Se mantiene DELGADA: solo coordina módulos.
 * - `world/` carga y valida el nivel desde datos (el mapa no está escrito aquí).
 * - `player/` decide a dónde se mueve el jugador (reglas, sin dibujar).
 * - `presentation/` lo dibuja (hoy con placeholders TEMP).
 *
 * Ciclo de cada fotograma: leer teclas → actualizar reglas → copiar a la vista.
 */
export class GameScene extends Phaser.Scene {
  private player: Player | null = null;
  private playerView: TempPlayerView | null = null;
  private playerInput: KeyboardPlayerInput | null = null;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    // Phaser reutiliza la instancia de la escena al volver a entrar: limpiamos.
    this.player = null;
    this.playerView = null;
    this.playerInput = null;

    try {
      const { level, warnings } = loadLevel(LEVEL_1);
      for (const w of warnings) console.warn(`[nivel ${level.id}] ${w.message}`);
      renderTempLevel(this, level);

      this.player = new Player(
        level.playerStart,
        {
          speed: GAME_TUNING.playerSpeed,
          bodySize: GAME_TUNING.playerBodySize,
          cornerAssistPx: GAME_TUNING.cornerAssistPx,
        },
        { cells: level.cells, cellSize: GRID.cellSize },
      );
      this.playerView = new TempPlayerView(this, this.player);
      if (this.input.keyboard) {
        this.playerInput = new KeyboardPlayerInput(this.input.keyboard);
        // TEMP (depuración): B muestra/oculta el cuerpo de colisión.
        this.input.keyboard.on('keydown-B', () => this.playerView?.toggleHitbox());
      }
    } catch (error) {
      this.showLevelError(error);
    }

    // TEMP: atajo solo para comprobar el flujo de escenas. Se quita en la Fase 6,
    // cuando el Game Over llegue por perder los 3 corazones.
    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(SceneKeys.GameOver);
    });
  }

  /** `delta` llega en milisegundos; las reglas trabajan en segundos. */
  override update(_time: number, delta: number): void {
    if (!this.player || !this.playerView || !this.playerInput) return;
    const dt = Math.min(delta / 1000, GAME_TUNING.maxFrameSeconds);
    this.player.update(this.playerInput.read(), dt);
    this.playerView.sync();
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

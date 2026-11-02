import Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import { SceneKeys } from '../core/SceneKeys';
import { GAME_TUNING } from '../data/gameTuning';
import { LEVEL_1 } from '../data/levels';
import { KeyboardPlayerInput } from '../player/KeyboardPlayerInput';
import { Player } from '../player/Player';
import { addTempLabel } from '../presentation/tempLabel';
import { TempExitView } from '../presentation/TempExitView';
import { TempGemsView } from '../presentation/TempGemsView';
import { TempHud } from '../presentation/TempHud';
import { renderTempLevel } from '../presentation/TempLevelRenderer';
import { TempPlayerView } from '../presentation/TempPlayerView';
import { LevelProgress, type ProgressEvent } from '../systems/levelProgress';
import type { LevelCompleteData } from './LevelCompleteScene';
import { LevelValidationError, loadLevel } from '../world/loadLevel';

/**
 * Game: aquí vive la partida. Se mantiene DELGADA: solo coordina módulos.
 * - `world/` carga y valida el nivel desde datos (el mapa no está escrito aquí).
 * - `player/` decide a dónde se mueve el jugador (reglas, sin dibujar).
 * - `systems/levelProgress` lleva las gemas, la puerta y el fin del nivel.
 * - `presentation/` lo dibuja (hoy con placeholders TEMP).
 *
 * Ciclo de cada fotograma: leer teclas → mover jugador → reglas de progreso
 * → reaccionar a los eventos (vista y HUD) → copiar a la vista.
 */
export class GameScene extends Phaser.Scene {
  private player: Player | null = null;
  private playerView: TempPlayerView | null = null;
  private playerInput: KeyboardPlayerInput | null = null;
  private progress: LevelProgress | null = null;
  private gemsView: TempGemsView | null = null;
  private exitView: TempExitView | null = null;
  private hud: TempHud | null = null;

  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    // Phaser reutiliza la instancia de la escena al volver a entrar: limpiamos.
    this.player = null;
    this.playerView = null;
    this.playerInput = null;
    this.progress = null;
    this.gemsView = null;
    this.exitView = null;
    this.hud = null;

    try {
      const { level, warnings } = loadLevel(LEVEL_1);
      for (const w of warnings) console.warn(`[nivel ${level.id}] ${w.message}`);
      renderTempLevel(this, level);

      // Estado nuevo en cada create(): volver a jugar = 0 gemas y puerta cerrada.
      this.progress = new LevelProgress(level, {
        gemPickupSize: GAME_TUNING.gemPickupSize,
        exitTriggerSize: GAME_TUNING.exitTriggerSize,
        cellSize: GRID.cellSize,
      });
      this.gemsView = new TempGemsView(this, level.gems);
      this.exitView = new TempExitView(this, level.exit);
      this.hud = new TempHud(this);
      this.hud.setGems(0, level.gemsRequired);
      this.hud.setExitOpen(false);

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
    if (!this.player || !this.playerView || !this.playerInput || !this.progress) return;
    if (this.progress.isCompleted) return; // ya terminó: esperando el cambio de escena
    const dt = Math.min(delta / 1000, GAME_TUNING.maxFrameSeconds);
    this.player.update(this.playerInput.read(), dt);
    for (const event of this.progress.update(this.player.body)) this.onProgress(event);
    this.playerView.sync();
  }

  /** Traduce eventos de reglas a cambios de presentación (y, en la Fase 8, sonidos). */
  private onProgress(event: ProgressEvent): void {
    const progress = this.progress!;
    switch (event.type) {
      case 'gemCollected':
        this.gemsView?.hide(event.index);
        this.hud?.setGems(event.count, progress.gemsRequired);
        break;
      case 'exitOpened':
        this.exitView?.show('open');
        this.hud?.setExitOpen(true);
        break;
      case 'levelCompleted': {
        const data: LevelCompleteData = {
          gems: progress.gems.count,
          totalGems: progress.gems.total,
        };
        this.scene.start(SceneKeys.LevelComplete, data);
        break;
      }
    }
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

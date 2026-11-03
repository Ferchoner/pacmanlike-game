import Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import { nextScene } from '../core/sceneFlow';
import { SceneKeys } from '../core/SceneKeys';
import { GAME_TUNING } from '../data/gameTuning';
import { LEVEL_1 } from '../data/levels';
import { EnemyGroup, type Enemy } from '../enemies/EnemyGroup';
import { KeyboardPlayerInput } from '../player/KeyboardPlayerInput';
import { Player } from '../player/Player';
import { addTempLabel } from '../presentation/tempLabel';
import { TempEnemyView } from '../presentation/TempEnemyView';
import { TempExitView } from '../presentation/TempExitView';
import { TempGemsView } from '../presentation/TempGemsView';
import { TempHud } from '../presentation/TempHud';
import { renderTempLevel } from '../presentation/TempLevelRenderer';
import { TempPlayerView } from '../presentation/TempPlayerView';
import { LevelProgress, type ProgressEvent } from '../systems/levelProgress';
import { separation } from '../systems/overlap';
import { PlayerHealth, type HealthEvent } from '../systems/playerHealth';
import type { RunSummary } from '../systems/runSummary';
import { LevelValidationError, loadLevel } from '../world/loadLevel';

/**
 * Game: aquí vive la partida. Se mantiene DELGADA: solo coordina módulos.
 * - `world/` carga y valida el nivel desde datos (el mapa no está escrito aquí).
 * - `player/` decide a dónde se mueve el jugador (reglas, sin dibujar).
 * - `enemies/` mueve a los Hunters y Patrols (reglas, sin dibujar).
 * - `systems/levelProgress` lleva las gemas, la puerta y el fin del nivel.
 * - `systems/playerHealth` lleva los corazones, la invulnerabilidad y la muerte.
 * - `presentation/` lo dibuja (hoy con placeholders TEMP).
 *
 * Ciclo de cada fotograma: leer teclas → mover jugador → mover enemigos → reglas de progreso
 * → reglas de daño → reaccionar a los eventos (vista, HUD, escenas) → copiar a la vista.
 */
export class GameScene extends Phaser.Scene {
  private player: Player | null = null;
  private playerView: TempPlayerView | null = null;
  private playerInput: KeyboardPlayerInput | null = null;
  private progress: LevelProgress | null = null;
  private gemsView: TempGemsView | null = null;
  private exitView: TempExitView | null = null;
  private hud: TempHud | null = null;
  private enemies: EnemyGroup | null = null;
  private enemyViews: TempEnemyView[] = [];
  private health: PlayerHealth | null = null;
  /** true en cuanto la partida termina (ganar o morir): se deja de simular. */
  private ended = false;

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
    this.enemies = null;
    this.enemyViews = [];
    this.health = null;
    this.ended = false;

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

      // Salud nueva en cada create(): morir y volver a jugar = 3 corazones.
      this.health = new PlayerHealth({
        startingHearts: GAME_TUNING.startingHearts,
        invulnerabilitySeconds: GAME_TUNING.invulnerabilitySeconds,
      });
      this.refreshHud();

      this.player = new Player(
        level.playerStart,
        {
          speed: GAME_TUNING.playerSpeed,
          bodySize: GAME_TUNING.playerBodySize,
          cornerAssistPx: GAME_TUNING.cornerAssistPx,
          knockbackPx: GAME_TUNING.knockbackPx,
          knockbackSeconds: GAME_TUNING.knockbackSeconds,
        },
        { cells: level.cells, cellSize: GRID.cellSize },
      );
      this.playerView = new TempPlayerView(this, this.player);

      // Enemigos desde los datos del nivel; la vista de cada uno, aparte.
      this.enemies = new EnemyGroup(level, {
        cellSize: GRID.cellSize,
        enemyBodySize: GAME_TUNING.enemyBodySize,
        hunterSpeed: GAME_TUNING.hunterSpeed,
        hunterDetectionCells: GAME_TUNING.hunterDetectionCells,
        hunterGiveUpCells: GAME_TUNING.hunterGiveUpCells,
        patrolSpeed: GAME_TUNING.patrolSpeed,
        enemyHitFreezeSeconds: GAME_TUNING.enemyHitFreezeSeconds,
      });
      this.enemyViews = this.enemies.all.map((enemy) => new TempEnemyView(this, enemy));
      if (this.input.keyboard) {
        this.playerInput = new KeyboardPlayerInput(this.input.keyboard);
        // TEMP (depuración): B muestra/oculta los cuerpos de colisión.
        this.input.keyboard.on('keydown-B', () => {
          this.playerView?.toggleHitbox();
          for (const view of this.enemyViews) view.toggleHitbox();
        });
      }
    } catch (error) {
      this.showLevelError(error);
    }
  }

  /** `delta` llega en milisegundos; las reglas trabajan en segundos. */
  override update(_time: number, delta: number): void {
    const { player, playerView, playerInput, progress, enemies, health } = this;
    if (!player || !playerView || !playerInput || !progress || !enemies || !health) return;
    if (this.ended) return; // ya terminó: esperando el cambio de escena
    const dt = Math.min(delta / 1000, GAME_TUNING.maxFrameSeconds);
    player.update(playerInput.read(), dt);
    // Invulnerable = invisible para los Hunters: te da tiempo a escapar tras un golpe.
    enemies.update(dt, player.body, !health.isInvulnerable);

    // Progreso ANTES que daño: si en el mismo fotograma tocas la puerta abierta
    // y un enemigo, ganas. Llegar a la salida es lo último que hiciste "bien".
    for (const event of progress.update(player.body)) this.onProgress(event);
    if (this.ended) return;

    const touching = enemies.touching(player.body);
    for (const event of health.update(dt, touching.length > 0)) this.onHealth(event, touching);
    if (this.ended) return;

    // Cuerpos sólidos: jugador y enemigos no se atraviesan. El enemigo va por
    // la rejilla y no se le puede empujar, así que se aparta al jugador.
    for (const enemy of touching) {
      const push = separation(player.body, enemy.body);
      player.pushBy(push.x, push.y);
    }

    playerView.setInvulnerable(health.invulnerableSecondsLeft);
    playerView.sync();
    const touchingSet = new Set(touching);
    enemies.all.forEach((enemy, i) => this.enemyViews[i]?.sync(touchingSet.has(enemy)));
  }

  /** Traduce eventos de daño a HUD y, al morir, al Game Over (Fase 8: SFX). */
  private onHealth(event: HealthEvent, hitters: readonly Enemy[]): void {
    switch (event.type) {
      case 'damaged': {
        this.refreshHud();
        // El golpe "rebota": el jugador sale empujado, los enemigos que lo
        // tocaban se quedan inmóviles un momento y el Hunter vuelve a casa.
        const player = this.player!;
        const from = hitters[0]!;
        player.applyKnockback(from.x, from.y);
        this.enemies?.onPlayerHit(hitters);
        break;
      }
      case 'died':
        // Morir reinicia TODA la run: no guardamos nada. La próxima partida
        // vuelve a llamar a create() y todo nace de cero (3 corazones, 0 gemas,
        // puerta cerrada, enemigos en su sitio).
        this.endRun('died');
        break;
    }
  }

  /** Traduce eventos de reglas a cambios de presentación (y, en la Fase 8, sonidos). */
  private onProgress(event: ProgressEvent): void {
    switch (event.type) {
      case 'gemCollected':
        this.gemsView?.hide(event.index);
        this.refreshHud();
        break;
      case 'exitOpened':
        this.exitView?.show('open');
        this.refreshHud();
        break;
      case 'levelCompleted':
        this.endRun('won');
        break;
    }
  }

  /**
   * El HUD se redibuja desde los sistemas REALES cada vez que algo cambia
   * (gema, puerta, golpe). No guarda copias propias que puedan desincronizarse.
   */
  private refreshHud(): void {
    const { hud, progress, health } = this;
    if (!hud || !progress || !health) return;
    hud.render({
      gems: progress.gems.count,
      gemsRequired: progress.gemsRequired,
      hearts: health.hearts,
      maxHearts: health.maxHearts,
      exitOpen: progress.exitState === 'open',
    });
  }

  /** Fin de la run: congela la simulación y pasa el resumen real a la pantalla final. */
  private endRun(outcome: RunSummary['outcome']): void {
    const progress = this.progress!;
    const health = this.health!;
    this.ended = true;
    const summary: RunSummary = {
      outcome,
      gems: progress.gems.count,
      totalGems: progress.gems.total,
      gemsRequired: progress.gemsRequired,
      hearts: health.hearts,
      maxHearts: health.maxHearts,
    };
    this.scene.start(nextScene(SceneKeys.Game, outcome), summary);
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

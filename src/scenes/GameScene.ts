import Phaser from 'phaser';
import { GRID, VIEW } from '../core/GameConstants';
import { SceneKeys } from '../core/SceneKeys';
import { addTempLabel } from '../presentation/tempLabel';

/**
 * Game: aquí vivirá la partida. Debe quedarse DELGADA: solo coordina módulos
 * (mundo, jugador, enemigos, sistemas). El mapa NO se escribirá aquí; se
 * cargará desde datos en la Fase 2.
 *
 * Hoy solo dibuja una rejilla TEMP de 24×18 celdas para ver el tamaño lógico.
 */
export class GameScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Game);
  }

  create(): void {
    this.drawTempGrid();
    addTempLabel(this, VIEW.height / 2 - 12, 'GameScene vacía (Fase 1)');
    addTempLabel(this, VIEW.height / 2 + 16, 'ESC: probar Game Over (TEMP)', 14);

    // TEMP: atajo solo para comprobar el flujo de escenas. Se quita en la Fase 6,
    // cuando el Game Over llegue por perder los 3 corazones.
    this.input.keyboard?.once('keydown-ESC', () => {
      this.scene.start(SceneKeys.GameOver);
    });
  }

  /** TEMP: rejilla de depuración (líneas finas), no es arte del juego. */
  private drawTempGrid(): void {
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x333333, 1);
    for (let col = 0; col <= GRID.columns; col++) {
      const x = col * GRID.cellSize;
      grid.lineBetween(x, 0, x, VIEW.height);
    }
    for (let row = 0; row <= GRID.rows; row++) {
      const y = row * GRID.cellSize;
      grid.lineBetween(0, y, VIEW.width, y);
    }
  }
}

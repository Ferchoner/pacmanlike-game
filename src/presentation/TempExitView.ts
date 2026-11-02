import type Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import type { ExitState } from '../systems/levelProgress';
import type { GridPoint } from '../world/LevelTypes';
import { cellToWorld } from '../world/gridMath';
import { addCellLetter } from './tempLabel';

/**
 * TEMP: la puerta de salida. Cerrada = marco rojo con "E"; abierta = celda
 * verde rellena. Se sustituirá por los sprites externos de puerta cerrada /
 * abierta (manifest.json) en la Fase 8.
 */
const COLORS: Record<ExitState, number> = { closed: 0xcc3333, open: 0x33dd77 };
const CELL = GRID.cellSize;

export class TempExitView {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly letter: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, private readonly cell: GridPoint) {
    this.graphics = scene.add.graphics();
    this.letter = addCellLetter(scene, cell, 'E', COLORS.closed);
    this.show('closed');
  }

  show(state: ExitState): void {
    const { x, y } = cellToWorld(this.cell);
    const g = this.graphics;
    g.clear();
    if (state === 'open') {
      g.fillStyle(COLORS.open, 1);
      g.fillRect(x + 3, y + 3, CELL - 6, CELL - 6);
      this.letter.setColor('#000000');
    } else {
      g.lineStyle(3, COLORS.closed, 1);
      g.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
      this.letter.setColor('#cc3333');
    }
  }
}

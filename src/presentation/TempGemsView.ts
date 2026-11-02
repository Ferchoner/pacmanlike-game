import type Phaser from 'phaser';
import type { GridPoint } from '../world/LevelTypes';
import { cellCenter } from '../world/gridMath';

/**
 * TEMP: dibuja cada gema como un rombo amarillo. Un objeto por gema para
 * poder ocultar SOLO la que se recoge. Se sustituirá por el sprite externo
 * de la gema en la Fase 8; la regla de recogida (`systems/`) no cambiará.
 *
 * El rombo (12 px) es más pequeño que la zona de recogida (16 px): lo que se
 * ve y lo que se detecta son cosas distintas, igual que con el jugador.
 */
const COLOR = 0xffd23f;
const R = 6;

export class TempGemsView {
  private readonly shapes: Phaser.GameObjects.Graphics[];

  constructor(scene: Phaser.Scene, gems: readonly GridPoint[]) {
    this.shapes = gems.map((gem) => {
      const c = cellCenter(gem);
      const g = scene.add.graphics({ x: c.x, y: c.y });
      g.fillStyle(COLOR, 1);
      g.fillTriangle(0, -R, R, 0, -R, 0);
      g.fillTriangle(0, R, R, 0, -R, 0);
      return g;
    });
  }

  /** La gema recogida desaparece. (Aquí irían la animación y el SFX, Fase 8.) */
  hide(index: number): void {
    this.shapes[index]?.setVisible(false);
  }
}

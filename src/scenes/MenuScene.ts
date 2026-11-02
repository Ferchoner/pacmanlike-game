import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';
import { addTempLabel } from '../presentation/tempLabel';

/** Menú principal mínimo (TEMP). ENTER empieza una run nueva. */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    const { height } = this.scale;
    addTempLabel(this, height / 2 - 40, 'PAC-BIG-MAN', 40);
    addTempLabel(this, height / 2 + 20, 'Pulsa ENTER para jugar');
    addTempLabel(this, height - 30, 'TEMP: menú de desarrollo', 14);

    // `keyboard` puede ser null si el teclado está desactivado en la config;
    // el operador ?. evita un error en ese caso (TypeScript estricto lo exige).
    this.input.keyboard?.once('keydown-ENTER', () => {
      this.scene.start(SceneKeys.Game);
    });
  }
}

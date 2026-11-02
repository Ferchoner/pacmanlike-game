import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';
import { addTempLabel } from '../presentation/tempLabel';

/**
 * Preload: carga todos los recursos (imágenes, spritesheets, audio) antes de
 * jugar. En la Fase 8 leerá las rutas desde manifest.json; ahora no hay
 * recursos aprobados, así que solo muestra la barra de progreso TEMP.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Preload);
  }

  preload(): void {
    const { width, height } = this.scale;
    addTempLabel(this, height / 2 - 30, 'Cargando… (TEMP)');

    // TEMP: barra de progreso con formas simples (placeholder técnico).
    const barWidth = width / 2;
    const bar = this.add.graphics();
    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0xffffff, 1);
      bar.fillRect((width - barWidth) / 2, height / 2, barWidth * value, 8);
    });

    // Fase 8: aquí se encolarán los recursos declarados en manifest.json.
  }

  create(): void {
    this.scene.start(SceneKeys.Menu);
  }
}

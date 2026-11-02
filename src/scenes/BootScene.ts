import Phaser from 'phaser';
import { SceneKeys } from '../core/SceneKeys';

/**
 * Boot: primera escena. Su trabajo es preparar lo mínimo para poder mostrar
 * la pantalla de carga (en el futuro, p. ej., el logo o la barra de carga)
 * y pasar enseguida a Preload. Hoy no carga nada.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Boot);
  }

  create(): void {
    this.scene.start(SceneKeys.Preload);
  }
}

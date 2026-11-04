import Phaser from 'phaser';
import { nextScene } from '../core/sceneFlow';
import { SceneKeys } from '../core/SceneKeys';
import { NEW_RUN_DATA } from '../systems/campaign';
import { MENU_LINES } from '../presentation/ui/screenText';
import { bindScreenControls, renderTempScreen } from '../presentation/ui/TempScreen';

/**
 * Menú principal mínimo (TEMP). Explica el objetivo y los controles en una
 * pantalla, y ENTER / ESPACIO / clic empiezan una run nueva.
 *
 * El clic importa en el navegador: dentro del iframe de itch.io el teclado no
 * llega al juego hasta que el jugador hace clic en él. Si el primer clic ya
 * arranca la partida, nadie se queda pulsando ENTER sin respuesta.
 */
export class MenuScene extends Phaser.Scene {
  constructor() {
    super(SceneKeys.Menu);
  }

  create(): void {
    renderTempScreen(this, MENU_LINES);
    bindScreenControls(this, {
      onConfirm: () => this.scene.start(nextScene(SceneKeys.Menu, 'start'), NEW_RUN_DATA),
      clickConfirms: true,
      // En el menú no hay nada que "saltarse" por accidente.
      inputDelaySeconds: 0,
    });
  }
}

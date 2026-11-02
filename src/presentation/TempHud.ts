import type Phaser from 'phaser';

/**
 * TEMP: HUD mínimo de texto, en la fila superior (que es pared en el mapa,
 * así no tapa el laberinto). Muestra "recolectadas/requeridas" como pide el
 * GDD y los corazones que quedan. La UI final (iconos de gema y corazones externos) llega en la Fase 7.
 *
 * El HUD NO cuenta gemas: solo muestra los números que le pasa la escena,
 * que a su vez los lee del sistema de progresión. Una sola fuente de verdad.
 */
export class TempHud {
  private readonly gems: Phaser.GameObjects.Text;
  private readonly status: Phaser.GameObjects.Text;
  private readonly hearts: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const style = { fontFamily: 'monospace', fontSize: '16px', color: '#ffffff' };
    this.gems = scene.add.text(8, 7, '', style).setDepth(10);
    this.status = scene.add
      .text(scene.scale.width - 8, 7, '', style)
      .setOrigin(1, 0)
      .setDepth(10);
    this.hearts = scene.add
      .text(scene.scale.width / 2, 7, '', style)
      .setOrigin(0.5, 0)
      .setDepth(10);
  }

  /** Texto, no iconos: los corazones dibujados son arte externo (Fase 7/8). */
  setHearts(current: number, max: number): void {
    this.hearts.setText(`Corazones: ${current}/${max}`);
    this.hearts.setColor(current <= 1 ? '#ff5555' : '#ffffff');
  }

  setGems(collected: number, required: number): void {
    this.gems.setText(`Gemas: ${collected}/${required}`);
  }

  setExitOpen(open: boolean): void {
    this.status.setText(open ? '¡Puerta abierta!' : 'Puerta cerrada');
    this.status.setColor(open ? '#33dd77' : '#cc8888');
  }
}

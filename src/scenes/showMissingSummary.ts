import type Phaser from 'phaser';
import { renderTempScreen } from '../presentation/ui/TempScreen';

/**
 * Si una pantalla final se abre SIN el resumen de la run (p. ej. arrancada a
 * mano al depurar), no inventamos números: lo decimos y seguimos funcionando.
 */
export function showMissingSummary(scene: Phaser.Scene, title: string): void {
  console.warn(`[${scene.scene.key}] se abrió sin RunSummary`);
  renderTempScreen(scene, [
    { text: title, tone: 'title' },
    { text: '(sin datos de la partida)', tone: 'hint' },
    { text: 'ENTER o ESPACIO: jugar otra vez', tone: 'good' },
    { text: 'ESC: volver al menú', tone: 'hint' },
  ]);
}

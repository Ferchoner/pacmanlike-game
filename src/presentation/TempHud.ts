import type Phaser from 'phaser';
import { hudText, type HudState, type ScreenLine } from './ui/screenText';
import { HUD_FONT_SIZE, TONE_STYLE, UI_FONT_FAMILY } from './ui/uiTheme';

/**
 * TEMP: HUD de texto en la fila superior (que es pared en el mapa, así no
 * tapa el laberinto): gemas a la izquierda, corazones al centro y puerta a la
 * derecha. Los iconos finales (R-015 corazones, R-016 contador) son arte
 * externo y llegan en la Fase 8.
 *
 * El HUD NO cuenta nada: recibe el estado completo (`HudState`) que la escena
 * lee de los sistemas reales, y `hudText` decide qué texto toca. Una sola
 * fuente de verdad: si el HUD dice 2/3 es porque `PlayerHealth` tiene 2.
 */
export class TempHud {
  private readonly gems: Phaser.GameObjects.Text;
  private readonly hearts: Phaser.GameObjects.Text;
  private readonly exit: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    const style = { fontFamily: UI_FONT_FAMILY, fontSize: `${HUD_FONT_SIZE}px`, color: '#ffffff' };
    const { width } = scene.scale;
    this.gems = scene.add.text(8, 7, '', style).setDepth(10);
    this.hearts = scene.add.text(width / 2, 7, '', style).setOrigin(0.5, 0).setDepth(10);
    this.exit = scene.add.text(width - 8, 7, '', style).setOrigin(1, 0).setDepth(10);
  }

  /** Redibuja todo el HUD a partir del estado real. Barato: son tres textos. */
  render(state: HudState): void {
    const text = hudText(state);
    apply(this.gems, text.gems);
    apply(this.hearts, text.hearts);
    apply(this.exit, text.exit);
  }
}

function apply(target: Phaser.GameObjects.Text, line: ScreenLine): void {
  // Solo se toca el objeto si cambia: setText rehace la textura del texto.
  if (target.text !== line.text) target.setText(line.text);
  target.setColor(TONE_STYLE[line.tone].color);
}

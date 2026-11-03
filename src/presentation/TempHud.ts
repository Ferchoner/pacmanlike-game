import type Phaser from 'phaser';
import { hudText, type HudState, type ScreenLine } from './ui/screenText';
import { HUD_FONT_SIZE, TONE_STYLE, UI_FONT_FAMILY } from './ui/uiTheme';
import { Frames } from './assets/assetKeys';
import type { FrameRef } from './assets/gameAssets';
import { loadedFrame } from './PickupViews';

/**
 * TEMP: HUD de texto en la fila superior (que es pared en el mapa, así no
 * tapa el laberinto): gemas a la izquierda, corazones al centro y puerta a la
 * derecha. Fase 8: si los iconos de corazón (R-015, lleno y vacío) están
 * aprobados y cargados, los corazones se dibujan con ellos en vez de texto.
 * El contador de gemas (R-016) sigue en texto hasta que llegue su arte.
 *
 * El HUD NO cuenta nada: recibe el estado completo (`HudState`) que la escena
 * lee de los sistemas reales, y `hudText` decide qué texto toca. Una sola
 * fuente de verdad: si el HUD dice 2/3 es porque `PlayerHealth` tiene 2.
 */
export class TempHud {
  private readonly gems: Phaser.GameObjects.Text;
  private readonly hearts: Phaser.GameObjects.Text;
  private readonly exit: Phaser.GameObjects.Text;
  /** Iconos de corazón (uno por corazón máximo), solo si hay arte R-015. */
  private heartIcons: Phaser.GameObjects.Image[] | null = null;
  private readonly heartArt: { full: FrameRef; empty: FrameRef } | null;

  constructor(private readonly scene: Phaser.Scene) {
    const style = { fontFamily: UI_FONT_FAMILY, fontSize: `${HUD_FONT_SIZE}px`, color: '#ffffff' };
    const { width } = scene.scale;
    this.gems = scene.add.text(8, 7, '', style).setDepth(10);
    this.hearts = scene.add.text(width / 2, 7, '', style).setOrigin(0.5, 0).setDepth(10);
    this.exit = scene.add.text(width - 8, 7, '', style).setOrigin(1, 0).setDepth(10);
    const full = loadedFrame(scene, Frames.heartFull);
    const empty = loadedFrame(scene, Frames.heartEmpty);
    this.heartArt = full && empty ? { full, empty } : null;
    this.hearts.setVisible(!this.heartArt);
  }

  /** Redibuja todo el HUD a partir del estado real. Barato: son tres textos. */
  render(state: HudState): void {
    const text = hudText(state);
    apply(this.gems, text.gems);
    apply(this.hearts, text.hearts);
    apply(this.exit, text.exit);
    if (this.heartArt) this.renderHeartIcons(this.heartArt, state.hearts, state.maxHearts);
  }

  /** Corazones llenos a la izquierda y vacíos a la derecha, centrados en la fila del HUD. */
  private renderHeartIcons(art: { full: FrameRef; empty: FrameRef }, hearts: number, maxHearts: number): void {
    if (!this.heartIcons) {
      const { full } = art;
      const size = this.scene.textures.getFrame(full.key, full.frame).width * full.scale;
      const startX = this.scene.scale.width / 2 - ((maxHearts - 1) * (size + 4)) / 2;
      this.heartIcons = Array.from({ length: maxHearts }, (_, i) =>
        this.scene.add
          .image(startX + i * (size + 4), 16, full.key, full.frame)
          .setScale(full.scale)
          .setDepth(10),
      );
    }
    this.heartIcons.forEach((icon, i) => {
      const ref = i < hearts ? art.full : art.empty;
      icon.setTexture(ref.key, ref.frame);
    });
  }
}

function apply(target: Phaser.GameObjects.Text, line: ScreenLine): void {
  // Solo se toca el objeto si cambia: setText rehace la textura del texto.
  if (target.text !== line.text) target.setText(line.text);
  target.setColor(TONE_STYLE[line.tone].color);
}

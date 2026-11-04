import Phaser from 'phaser';
import type { ScreenLine } from './screenText';
import { TONE_STYLE, UI_FONT_FAMILY } from './uiTheme';
import { SHOW_DEV_TOOLS } from '../../core/devTools';

/**
 * TEMP: dibuja una pantalla de texto (menú, Game Over, nivel completado)
 * centrada en vertical. Es un placeholder técnico: la composición final se
 * hará con la UI externa (R-017, R-018) en la Fase 8.
 */
export function renderTempScreen(scene: Phaser.Scene, lines: readonly ScreenLine[]): void {
  const { width, height } = scene.scale;
  const gap = 14;
  // Margen a cada lado: una línea más ancha que la pantalla se parte en dos
  // (`wordWrap`) en vez de cortarse por los bordes. Por eso primero se crean
  // los textos y DESPUÉS se colocan: hasta crearlos no sabemos cuántas líneas
  // ocupa cada uno, y sin esa altura no se puede centrar el bloque.
  const margin = 32;
  const texts = lines.map((l) => {
    const style = TONE_STYLE[l.tone];
    return scene.add
      .text(width / 2, 0, l.text, {
        fontFamily: UI_FONT_FAMILY,
        fontSize: `${style.size}px`,
        color: style.color,
        align: 'center',
        wordWrap: { width: width - margin * 2, useAdvancedWrap: true },
      })
      .setOrigin(0.5, 0);
  });
  const heights = texts.map((t, i) => t.height + gap + (lines[i]!.tone === 'title' ? 24 : 0));
  let y = (height - heights.reduce((a, b) => a + b, 0)) / 2;
  texts.forEach((t, i) => {
    t.setY(y);
    y += heights[i]!;
  });
  // Recordatorio para desarrollar; en el build publicado no se muestra.
  if (!SHOW_DEV_TOOLS) return;
  scene.add
    .text(width / 2, height - 16, 'TEMP: UI provisional', {
      fontFamily: UI_FONT_FAMILY,
      fontSize: '12px',
      color: '#666666',
    })
    .setOrigin(0.5);
}

export interface ScreenControls {
  /** ENTER / ESPACIO (y clic, si `clickConfirms`). */
  readonly onConfirm: () => void;
  /** ESC. */
  readonly onBack?: () => void;
  readonly clickConfirms?: boolean;
  /**
   * Segundos en los que se IGNORA la entrada al abrir la pantalla. Evita que
   * una tecla pulsada justo al morir/ganar se "salte" la pantalla sin leerla.
   */
  readonly inputDelaySeconds: number;
}

/**
 * Conecta las teclas de una pantalla. Solo responde UNA vez (`done`): si el
 * jugador pulsa ENTER dos veces rápido, no se arrancan dos partidas.
 * Phaser borra estos oyentes al cerrar la escena, así que no se acumulan.
 */
export function bindScreenControls(scene: Phaser.Scene, controls: ScreenControls): void {
  // Medimos con el reloj del navegador (`performance.now()`), no con el de la
  // escena: el reloj de una escena que arranca por primera vez aún no se ha
  // actualizado en create(), y un temporizador de escena se dispararía al
  // instante. Lo descubrimos probando: un ENTER a los 0.1 s se colaba.
  const openedAt = performance.now();
  let done = false;
  const guard = (action: () => void) => () => {
    if (done || performance.now() - openedAt < controls.inputDelaySeconds * 1000) return;
    done = true;
    action();
  };
  const confirm = guard(controls.onConfirm);
  const keyboard = scene.input.keyboard;
  keyboard?.on('keydown-ENTER', confirm);
  keyboard?.on('keydown-SPACE', confirm);
  if (controls.onBack) keyboard?.on('keydown-ESC', guard(controls.onBack));
  if (controls.clickConfirms) scene.input.on('pointerdown', confirm);
}

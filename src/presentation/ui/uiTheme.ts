import type { LineTone } from './screenText';

/**
 * TEMP: estilo provisional de la UI (fuente del sistema y colores planos).
 * Cuando llegue la fuente externa (R-026) y la UI externa (R-015…R-018) se
 * cambia AQUÍ, en un solo sitio, sin tocar escenas ni reglas.
 */
export const UI_FONT_FAMILY = 'monospace';

export const TONE_STYLE: Record<LineTone, { readonly size: number; readonly color: string }> = {
  title: { size: 40, color: '#ffffff' },
  normal: { size: 18, color: '#ffffff' },
  good: { size: 18, color: '#33dd77' },
  bad: { size: 18, color: '#ff6666' },
  hint: { size: 15, color: '#aaaaaa' },
};

/** Tamaño del texto del HUD (cabe en la fila superior de 32 px, que es pared). */
export const HUD_FONT_SIZE = 16;

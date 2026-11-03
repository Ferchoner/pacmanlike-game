import type { RunSummary } from '../../systems/runSummary';

/**
 * TEXTOS de la UI, como funciones PURAS (sin Phaser): reciben el estado y
 * devuelven qué hay que escribir. Las escenas solo los dibujan.
 *
 * Ventajas: se prueban con Vitest ("con 2 corazones el HUD dice 2/3") y,
 * cuando llegue el arte externo (R-015 corazones, R-016 contador, R-017/R-018
 * pantallas, R-026 fuente), cambia el DIBUJO, no qué información se muestra.
 */

/** Tono de una línea: la vista lo traduce a color/tamaño (TEMP en uiTheme). */
export type LineTone = 'title' | 'normal' | 'good' | 'bad' | 'hint';

export interface ScreenLine {
  readonly text: string;
  readonly tone: LineTone;
}

const line = (text: string, tone: LineTone = 'normal'): ScreenLine => ({ text, tone });

export const MENU_LINES: readonly ScreenLine[] = [
  line('PAC-BIG-MAN', 'title'),
  line('Recoge gemas, esquiva a los monstruos y escapa por la puerta.'),
  line('Con 20 gemas se abre la puerta: tócala para ganar.'),
  line('Tienes 3 corazones. Si los pierdes, vuelves a empezar.'),
  line('Moverse: WASD o flechas', 'hint'),
  line('ENTER, ESPACIO o clic para jugar', 'good'),
];

export function gameOverLines(run: RunSummary): ScreenLine[] {
  return [
    line('GAME OVER', 'title'),
    line('Te quedaste sin corazones.', 'bad'),
    line(`Gemas recogidas: ${run.gems}/${run.totalGems} (hacían falta ${run.gemsRequired})`),
    line('La run vuelve a empezar desde cero.', 'hint'),
    ...replayPrompt(),
  ];
}

export function levelCompleteLines(run: RunSummary): ScreenLine[] {
  const extra = run.gems - run.gemsRequired;
  return [
    line('¡NIVEL COMPLETADO!', 'title'),
    line('Escapaste del Primer Laberinto.', 'good'),
    line(`Gemas: ${run.gems}/${run.totalGems}` + (extra > 0 ? ` (+${extra} opcionales)` : '')),
    line(`Corazones: ${run.hearts}/${run.maxHearts}`),
    ...replayPrompt(),
  ];
}

function replayPrompt(): ScreenLine[] {
  return [line('ENTER o ESPACIO: jugar otra vez', 'good'), line('ESC: volver al menú', 'hint')];
}

/** Lo que muestra el HUD durante la partida. */
export interface HudState {
  readonly gems: number;
  readonly gemsRequired: number;
  readonly hearts: number;
  readonly maxHearts: number;
  readonly exitOpen: boolean;
}

export interface HudText {
  readonly gems: ScreenLine;
  readonly hearts: ScreenLine;
  readonly exit: ScreenLine;
}

export function hudText(s: HudState): HudText {
  return {
    // "recolectadas/20" como pide el GDD; pasa de 20 si recoges opcionales.
    gems: line(`Gemas: ${s.gems}/${s.gemsRequired}`, s.gems >= s.gemsRequired ? 'good' : 'normal'),
    // Último corazón en rojo: la UI avisa del peligro antes de que sea tarde.
    hearts: line(`Corazones: ${s.hearts}/${s.maxHearts}`, s.hearts <= 1 ? 'bad' : 'normal'),
    exit: s.exitOpen
      ? line('¡Puerta abierta!', 'good')
      : line(`Puerta: faltan ${s.gemsRequired - s.gems}`, 'bad'),
  };
}

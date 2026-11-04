import type { RunSummary } from '../../systems/runSummary';
import { BETA_NOTICE, GAME_TITLE, RELEASE_STAGE } from '../../core/release';

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
  line(GAME_TITLE, 'title'),
  line('Recoge gemas, esquiva a los monstruos y escapa por la puerta.'),
  line('Reúne las gemas que pide cada nivel y toca la puerta para pasar al siguiente.'),
  line('Tienes 3 corazones para toda la aventura: no se recuperan entre niveles.'),
  line('Si los pierdes todos, vuelves a empezar desde el Nivel 1.'),
  line('Moverse: WASD o flechas', 'hint'),
  line('ENTER, ESPACIO o clic para jugar', 'good'),
  ...(RELEASE_STAGE === 'beta' ? BETA_NOTICE.map((text) => line(text, 'hint')) : []),
];

export function gameOverLines(run: RunSummary): ScreenLine[] {
  return [
    line('GAME OVER', 'title'),
    line('Te quedaste sin corazones.', 'bad'),
    line(`Llegaste al ${levelTitle(run)}`),
    line(`Gemas recogidas: ${run.gems}/${run.totalGems} (hacían falta ${run.gemsRequired})`),
    line('La partida vuelve a empezar desde cero, en el Nivel 1.', 'hint'),
    ...replayPrompt(),
  ];
}

/** "Nivel 2/3: Las Catacumbas". */
function levelTitle(run: RunSummary): string {
  return `Nivel ${run.levelNumber}/${run.levelCount}: ${run.levelName}`;
}

/** ¿Era el último nivel de la campaña? Entonces lo siguiente es la Victoria. */
export function isFinalLevel(run: RunSummary): boolean {
  return run.levelNumber >= run.levelCount;
}

/**
 * Corazones con los que se entra al siguiente nivel: la escena los calcula con
 * `campaign.nextLevelRun` (que respeta `carryHeartsBetweenLevels`) y los pasa aquí.
 */
export function levelCompleteLines(run: RunSummary, nextHearts: number): ScreenLine[] {
  const extra = run.gems - run.gemsRequired;
  const last = isFinalLevel(run);
  return [
    line('¡NIVEL COMPLETADO!', 'title'),
    line(`Escapaste del ${levelTitle(run)}`, 'good'),
    line(`Gemas: ${run.gems}/${run.totalGems}` + (extra > 0 ? ` (+${extra} opcionales)` : '')),
    line(`Corazones: ${run.hearts}/${run.maxHearts}`),
    ...(last
      ? [line('ENTER o ESPACIO: continuar', 'good')]
      : [
          line(`Entras al siguiente nivel con ${nextHearts}/${run.maxHearts} corazones.`, 'hint'),
          line('ENTER o ESPACIO: siguiente nivel', 'good'),
        ]),
    line('ESC: volver al menú (se pierde la partida)', 'hint'),
  ];
}

/** Pantalla final de la campaña: el resumen de TODA la run. */
export function victoryLines(run: RunSummary): ScreenLine[] {
  return [
    line('¡VICTORIA!', 'title'),
    line(`Escapaste de los ${run.levelCount} niveles.`, 'good'),
    line(`Gemas en toda la partida: ${run.campaign.gemsSoFar}`),
    line(`Corazones al final: ${run.hearts}/${run.maxHearts}`),
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
  /** Nivel actual (desde 1) y total de la campaña. */
  readonly levelNumber: number;
  readonly levelCount: number;
}

export interface HudText {
  readonly gems: ScreenLine;
  readonly hearts: ScreenLine;
  readonly exit: ScreenLine;
}

export function hudText(s: HudState): HudText {
  return {
    // "recolectadas/20" como pide el GDD; pasa de 20 si recoges opcionales.
    gems: line(
      `Nivel ${s.levelNumber}/${s.levelCount}  Gemas: ${s.gems}/${s.gemsRequired}`,
      s.gems >= s.gemsRequired ? 'good' : 'normal',
    ),
    // Último corazón en rojo: la UI avisa del peligro antes de que sea tarde.
    hearts: line(`Corazones: ${s.hearts}/${s.maxHearts}`, s.hearts <= 1 ? 'bad' : 'normal'),
    exit: s.exitOpen
      ? line('¡Puerta abierta!', 'good')
      : line(`Puerta: faltan ${s.gemsRequired - s.gems}`, 'bad'),
  };
}

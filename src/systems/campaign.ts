/**
 * CAMPAÑA: la run recorre varios niveles seguidos (Nivel 1 → 2 → 3 → Victoria).
 *
 * Este módulo es PURO (sin Phaser), como `levelProgress` o `playerHealth`:
 * solo calcula "qué viene después". Las escenas se pasan este estado de una
 * a otra en el `data` de `scene.start(...)`.
 *
 *   newRun ──▶ Game(nivel i) ──gana──▶ endLevel ──▶ ¿último? ──no──▶ nextLevelRun ──▶ Game(nivel i+1)
 *                    │                                    └──sí──▶ Victoria
 *                    └──muere──▶ Game Over ──▶ newRun (otra vez desde el Nivel 1)
 *
 * Reglas (aprobadas por Fernando el 2026-11-04):
 * - Morir reinicia TODA la run desde el primer nivel (ya estaba aprobado).
 * - Los corazones SE ARRASTRAN de un nivel al siguiente, sin curar.
 *   Es configurable (`GAME_TUNING.carryHeartsBetweenLevels`) por si al probar
 *   el juego resulta demasiado difícil.
 * - Las gemas empiezan en 0 en cada nivel (no son moneda); aquí solo se
 *   acumula el total para mostrarlo en la pantalla de Victoria.
 */
export interface CampaignRun {
  /** Posición (desde 0) del nivel que se juega dentro de la campaña. */
  readonly levelIndex: number;
  /** Corazones con los que se ENTRA al nivel. */
  readonly hearts: number;
  /** Gemas recogidas en los niveles ya terminados de esta run. */
  readonly gemsSoFar: number;
}

/**
 * Datos para arrancar Game con una run NUEVA. Hay que pasar SIEMPRE algo:
 * si `scene.start('Game')` va sin datos, Phaser REUTILIZA los datos de la
 * última vez que arrancó esa escena. Sin esto, morir en el Nivel 3 y pulsar
 * "jugar otra vez" te devolvería al Nivel 3 con los corazones de antes.
 * Un objeto vacío no es una `CampaignRun`, así que Game empieza de cero.
 */
export const NEW_RUN_DATA: Readonly<Record<string, never>> = Object.freeze({});

/** Run nueva: primer nivel (o el indicado, para pruebas), corazones llenos y 0 gemas. */
export function newRun(maxHearts: number, startIndex = 0): CampaignRun {
  return { levelIndex: startIndex, hearts: maxHearts, gemsSoFar: 0 };
}

/** Estado de la run al salir por la puerta: suma las gemas y guarda los corazones que quedan. */
export function endLevel(run: CampaignRun, result: { gems: number; hearts: number }): CampaignRun {
  return { levelIndex: run.levelIndex, hearts: result.hearts, gemsSoFar: run.gemsSoFar + result.gems };
}

export function isLastLevel(run: CampaignRun, levelCount: number): boolean {
  return run.levelIndex >= levelCount - 1;
}

export interface NextLevelOptions {
  readonly maxHearts: number;
  /** true = los corazones pasan tal cual; false = cada nivel empieza con `maxHearts`. */
  readonly carryHearts: boolean;
}

/** Run para el SIGUIENTE nivel, a partir del estado con que terminó el actual (`endLevel`). */
export function nextLevelRun(finished: CampaignRun, options: NextLevelOptions): CampaignRun {
  return {
    levelIndex: finished.levelIndex + 1,
    hearts: options.carryHearts ? finished.hearts : options.maxHearts,
    gemsSoFar: finished.gemsSoFar,
  };
}

/** Guarda de tipo: `data` de una escena puede venir vacío o con cualquier forma. */
export function isCampaignRun(value: unknown): value is CampaignRun {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const isCount = (x: unknown) => typeof x === 'number' && Number.isInteger(x) && x >= 0;
  return isCount(v.levelIndex) && isCount(v.gemsSoFar) && isCount(v.hearts) && (v.hearts as number) >= 1;
}

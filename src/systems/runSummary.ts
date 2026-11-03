/**
 * Resumen de cómo terminó una partida. La partida (GameScene) lo construye a
 * partir de los sistemas reales (progreso y salud) y se lo pasa a la pantalla
 * final. Así Game Over y Nivel completado muestran el estado REAL, no
 * números escritos a mano.
 */
export interface RunSummary {
  readonly outcome: 'won' | 'died';
  /** Gemas recogidas en esta run. */
  readonly gems: number;
  /** Gemas que hay en el nivel (25). */
  readonly totalGems: number;
  /** Gemas que abren la puerta (20). */
  readonly gemsRequired: number;
  /** Corazones que quedaban al terminar. */
  readonly hearts: number;
  readonly maxHearts: number;
}

/**
 * Las escenas reciben `data` sin tipo garantizado (Phaser lo pasa como objeto
 * cualquiera, y puede venir vacío si alguien arranca la escena a mano).
 * Esta "guarda de tipo" comprueba la forma antes de usarlo.
 */
export function isRunSummary(value: unknown): value is RunSummary {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  const counts = ['gems', 'totalGems', 'gemsRequired', 'hearts', 'maxHearts'];
  return (
    (v.outcome === 'won' || v.outcome === 'died') &&
    counts.every((k) => typeof v[k] === 'number' && Number.isInteger(v[k]) && (v[k] as number) >= 0)
  );
}

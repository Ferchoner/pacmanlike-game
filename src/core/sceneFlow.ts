import { SceneKeys, type SceneKey } from './SceneKeys';

/**
 * FLUJO DE PANTALLAS del juego, escrito como una tabla (máquina de estados).
 *
 *   Menu ──start──▶ Game ──died──▶ GameOver ──retry──▶ Game
 *                    │                 └──────menu───▶ Menu
 *                    └──won──▶ LevelComplete ──retry──▶ Game
 *                                     └───────menu───▶ Menu
 *
 * ¿Por qué una tabla y no `this.scene.start(...)` repartido por cada escena?
 * - Todo el recorrido se ve en un solo sitio (y se puede dibujar como arriba).
 * - Se prueba con Vitest sin abrir el navegador.
 * - Si mañana hay Nivel 2, solo cambia esta tabla, no cinco escenas.
 *
 * Boot y Preload no aparecen: son "técnicas" y siempre van solas a Menu.
 */
export type FlowAction = 'start' | 'won' | 'died' | 'retry' | 'menu';

const FLOW: Partial<Record<SceneKey, Partial<Record<FlowAction, SceneKey>>>> = {
  [SceneKeys.Menu]: { start: SceneKeys.Game },
  [SceneKeys.Game]: { won: SceneKeys.LevelComplete, died: SceneKeys.GameOver },
  [SceneKeys.GameOver]: { retry: SceneKeys.Game, menu: SceneKeys.Menu },
  [SceneKeys.LevelComplete]: { retry: SceneKeys.Game, menu: SceneKeys.Menu },
};

/** Escena siguiente; lanza un error si la transición no existe (fallo de programación). */
export function nextScene(from: SceneKey, action: FlowAction): SceneKey {
  const to = FLOW[from]?.[action];
  if (!to) throw new Error(`Transición no definida: ${from} --${action}-->`);
  return to;
}

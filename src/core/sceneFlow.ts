import { SceneKeys, type SceneKey } from './SceneKeys';

/**
 * FLUJO DE PANTALLAS del juego, escrito como una tabla (máquina de estados).
 *
 *   Menu ──start──▶ Game ──died──▶ GameOver ──retry──▶ Game (run nueva, Nivel 1)
 *                    │                 └──────menu───▶ Menu
 *                    └──won──▶ LevelComplete ──next────▶ Game (siguiente nivel)
 *                                     ├────────finish──▶ Victory ──retry──▶ Game (run nueva)
 *                                     └────────menu────▶ Menu       └─menu──▶ Menu
 *
 * ¿Por qué una tabla y no `this.scene.start(...)` repartido por cada escena?
 * - Todo el recorrido se ve en un solo sitio (y se puede dibujar como arriba).
 * - Se prueba con Vitest sin abrir el navegador.
 * - Con varios niveles solo hizo falta añadir `next`, `finish` y Victory aquí.
 *   QUÉ nivel toca lo decide `systems/campaign.ts`; esta tabla solo dice A QUÉ PANTALLA.
 *
 * Boot y Preload no aparecen: son "técnicas" y siempre van solas a Menu.
 */
export type FlowAction = 'start' | 'won' | 'died' | 'retry' | 'menu' | 'next' | 'finish';

const FLOW: Partial<Record<SceneKey, Partial<Record<FlowAction, SceneKey>>>> = {
  [SceneKeys.Menu]: { start: SceneKeys.Game },
  [SceneKeys.Game]: { won: SceneKeys.LevelComplete, died: SceneKeys.GameOver },
  [SceneKeys.GameOver]: { retry: SceneKeys.Game, menu: SceneKeys.Menu },
  [SceneKeys.LevelComplete]: { next: SceneKeys.Game, finish: SceneKeys.Victory, menu: SceneKeys.Menu },
  [SceneKeys.Victory]: { retry: SceneKeys.Game, menu: SceneKeys.Menu },
};

/** Escena siguiente; lanza un error si la transición no existe (fallo de programación). */
export function nextScene(from: SceneKey, action: FlowAction): SceneKey {
  const to = FLOW[from]?.[action];
  if (!to) throw new Error(`Transición no definida: ${from} --${action}-->`);
  return to;
}

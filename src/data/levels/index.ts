import type { LevelDefinition } from '../../world/LevelTypes';
import { tiledToLevel } from '../../world/tiled/tiledToLevel';
import level1Json from './level1.json';
import nivel2Tiled from '../../../tiled/mapas/nivel2.json';
import nivel3Tiled from '../../../tiled/mapas/nivel3.json';

/**
 * Registro de niveles. Al asignar el JSON a una variable de tipo
 * `LevelDefinition`, TypeScript comprueba en tiempo de compilación que el
 * archivo tiene la forma correcta (campos, tipos). El CONTENIDO (gemas,
 * coordenadas, conectividad) lo comprueba `validateLevel` al cargar.
 *
 * Niveles hechos en Tiled (Nivel 2 y 3): se traducen con `tiledToLevel` al
 * mismo `LevelDefinition` (ver docs/08_niveles/GUIA_CREACION_NIVELES.md).
 * Si un mapa de Tiled está mal formado, este import falla al arrancar; por eso
 * conviene pasar antes `npm run level:check -- tiled/mapas/<archivo>.json`.
 */
export const LEVEL_1: LevelDefinition = level1Json;

/**
 * La CAMPAÑA: los niveles en el orden en que se juegan. Una run empieza en el
 * primero y se gana al salir por la puerta del último (ver
 * `systems/campaign.ts`). Añadir un nivel a la campaña = añadirlo aquí.
 */
export const LEVEL_2 = tiledToLevel(nivel2Tiled, { source: 'tiled/mapas/nivel2.json' });
export const LEVEL_3 = tiledToLevel(nivel3Tiled, { source: 'tiled/mapas/nivel3.json' });

export const LEVELS: readonly LevelDefinition[] = [LEVEL_1, LEVEL_2, LEVEL_3];

/**
 * En qué nivel EMPIEZA una run nueva. En la versión publicada, siempre en el
 * primero. En DESARROLLO (`npm run dev`), `?nivel=<id>` en la URL arranca la
 * campaña en ese nivel para probarlo sin jugar los anteriores; al
 * completarlo se sigue con el siguiente, como en una run normal.
 */
export function campaignStartIndex(search: string, devTools: boolean): number {
  if (!devTools) return 0;
  const id = new URLSearchParams(search).get('nivel');
  if (!id) return 0;
  const index = LEVELS.findIndex((l) => l.id === id);
  if (index < 0) {
    console.warn(`[niveles] No hay ningún nivel con id "${id}". Registrados: ${LEVELS.map((l) => l.id).join(', ')}.`);
    return 0;
  }
  return index;
}

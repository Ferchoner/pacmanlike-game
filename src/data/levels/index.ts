import type { LevelDefinition } from '../../world/LevelTypes';
import { tiledToLevel } from '../../world/tiled/tiledToLevel';
import level1Json from './level1.json';
import comienzoTiled from '../../../tiled/mapas/comienzo_mazmorras.json';
import catacumbasTiled from '../../../tiled/mapas/catacumbas.json';
import salaTiled from '../../../tiled/mapas/sala_del_guardian.json';

/**
 * Registro de niveles. Al asignar el JSON a una variable de tipo
 * `LevelDefinition`, TypeScript comprueba en tiempo de compilación que el
 * archivo tiene la forma correcta (campos, tipos). El CONTENIDO (gemas,
 * coordenadas, conectividad) lo comprueba `validateLevel` al cargar.
 *
 * Niveles hechos en Tiled (todos los de la campaña): se traducen con `tiledToLevel` al
 * mismo `LevelDefinition` (ver docs/08_niveles/GUIA_CREACION_NIVELES.md).
 * Si un mapa de Tiled está mal formado, este import falla al arrancar; por eso
 * conviene pasar antes `npm run level:check -- tiled/mapas/<archivo>.json`.
 */
/**
 * El Nivel 1 original (Blueprint v0.1). Ya NO está en la campaña: Fernando lo
 * rediseñó en Tiled como "Comienzo de las mazmorras" (2026-11-04). Se conserva
 * como referencia histórica y para las pruebas del traductor de Tiled.
 */
export const LEVEL_1: LevelDefinition = level1Json;

/**
 * La CAMPAÑA: los niveles en el orden en que se juegan. Una run empieza en el
 * primero y se gana al salir por la puerta del último (ver
 * `systems/campaign.ts`). Añadir un nivel a la campaña = añadirlo aquí.
 */
export const COMIENZO_MAZMORRAS = tiledToLevel(comienzoTiled, { source: 'tiled/mapas/comienzo_mazmorras.json' });
export const CATACUMBAS = tiledToLevel(catacumbasTiled, { source: 'tiled/mapas/catacumbas.json' });
export const SALA_DEL_GUARDIAN = tiledToLevel(salaTiled, { source: 'tiled/mapas/sala_del_guardian.json' });

export const LEVELS: readonly LevelDefinition[] = [COMIENZO_MAZMORRAS, CATACUMBAS, SALA_DEL_GUARDIAN];

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

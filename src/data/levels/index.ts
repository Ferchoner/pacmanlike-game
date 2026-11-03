import type { LevelDefinition } from '../../world/LevelTypes';
import level1Json from './level1.json';

/**
 * Registro de niveles. Al asignar el JSON a una variable de tipo
 * `LevelDefinition`, TypeScript comprueba en tiempo de compilación que el
 * archivo tiene la forma correcta (campos, tipos). El CONTENIDO (gemas,
 * coordenadas, conectividad) lo comprueba `validateLevel` al cargar.
 *
 * Niveles hechos en Tiled: se registran traduciéndolos con `tiledToLevel`
 * (ver docs/08_niveles/GUIA_CREACION_NIVELES.md). Ejemplo:
 *
 *   import { tiledToLevel } from '../../world/tiled/tiledToLevel';
 *   import nivel2Tiled from '../../../tiled/mapas/nivel2.json';
 *   export const LEVEL_2 = tiledToLevel(nivel2Tiled, { source: 'tiled/mapas/nivel2.json' });
 *
 * y añadir `LEVEL_2` a `LEVELS`.
 */
export const LEVEL_1: LevelDefinition = level1Json;

export const LEVELS: readonly LevelDefinition[] = [LEVEL_1];

/**
 * Qué nivel se juega. Hoy el juego solo tiene un nivel en su flujo (pasar de un
 * nivel al siguiente está fuera del MVP), así que siempre es el Nivel 1...
 * salvo en DESARROLLO (`npm run dev`), donde `?nivel=<id>` en la URL carga
 * cualquier nivel registrado para probarlo. En la versión publicada se ignora.
 */
export function levelToPlay(search: string, devTools: boolean): LevelDefinition {
  if (devTools) {
    const id = new URLSearchParams(search).get('nivel');
    const chosen = id ? LEVELS.find((l) => l.id === id) : undefined;
    if (id && !chosen) {
      console.warn(`[niveles] No hay ningún nivel con id "${id}". Registrados: ${LEVELS.map((l) => l.id).join(', ')}.`);
    }
    if (chosen) return chosen;
  }
  return LEVEL_1;
}

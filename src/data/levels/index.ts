import type { LevelDefinition } from '../../world/LevelTypes';
import level1Json from './level1.json';

/**
 * Registro de niveles. Al asignar el JSON a una variable de tipo
 * `LevelDefinition`, TypeScript comprueba en tiempo de compilación que el
 * archivo tiene la forma correcta (campos, tipos). El CONTENIDO (gemas,
 * coordenadas, conectividad) lo comprueba `validateLevel` al cargar.
 */
export const LEVEL_1: LevelDefinition = level1Json;

export const LEVELS = [LEVEL_1] as const;

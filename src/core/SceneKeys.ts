/**
 * Nombres (claves) de las escenas. Usar constantes evita errores de tipeo:
 * si escribes `SceneKeys.Gmae`, TypeScript te avisa; con un string suelto no.
 */
export const SceneKeys = {
  Boot: 'Boot',
  Preload: 'Preload',
  Menu: 'Menu',
  Game: 'Game',
  GameOver: 'GameOver',
  LevelComplete: 'LevelComplete',
  Victory: 'Victory',
} as const;

export type SceneKey = (typeof SceneKeys)[keyof typeof SceneKeys];

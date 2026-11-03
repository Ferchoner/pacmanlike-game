import { describe, expect, it } from 'vitest';
import { nextScene } from '../../src/core/sceneFlow';
import { SceneKeys } from '../../src/core/SceneKeys';

describe('Flujo de pantallas', () => {
  it('el menú empieza la partida', () => {
    expect(nextScene(SceneKeys.Menu, 'start')).toBe(SceneKeys.Game);
  });

  it('ganar lleva a Nivel completado y morir a Game Over', () => {
    expect(nextScene(SceneKeys.Game, 'won')).toBe(SceneKeys.LevelComplete);
    expect(nextScene(SceneKeys.Game, 'died')).toBe(SceneKeys.GameOver);
  });

  it('desde las pantallas finales se juega otra vez (run nueva) o se vuelve al menú', () => {
    for (const from of [SceneKeys.GameOver, SceneKeys.LevelComplete]) {
      expect(nextScene(from, 'retry')).toBe(SceneKeys.Game);
      expect(nextScene(from, 'menu')).toBe(SceneKeys.Menu);
    }
  });

  it('una transición que no existe es un error, no un salto silencioso', () => {
    expect(() => nextScene(SceneKeys.Menu, 'died')).toThrow(/no definida/);
    expect(() => nextScene(SceneKeys.Game, 'retry')).toThrow();
  });
});

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

  it('Nivel completado lleva al siguiente nivel, a la Victoria o al menú', () => {
    expect(nextScene(SceneKeys.LevelComplete, 'next')).toBe(SceneKeys.Game);
    expect(nextScene(SceneKeys.LevelComplete, 'finish')).toBe(SceneKeys.Victory);
    expect(nextScene(SceneKeys.LevelComplete, 'menu')).toBe(SceneKeys.Menu);
    expect(() => nextScene(SceneKeys.LevelComplete, 'retry')).toThrow();
  });

  it('desde Game Over y Victoria se juega otra vez (run nueva) o se vuelve al menú', () => {
    for (const from of [SceneKeys.GameOver, SceneKeys.Victory]) {
      expect(nextScene(from, 'retry')).toBe(SceneKeys.Game);
      expect(nextScene(from, 'menu')).toBe(SceneKeys.Menu);
    }
  });

  it('una transición que no existe es un error, no un salto silencioso', () => {
    expect(() => nextScene(SceneKeys.Menu, 'died')).toThrow(/no definida/);
    expect(() => nextScene(SceneKeys.Game, 'retry')).toThrow();
  });
});

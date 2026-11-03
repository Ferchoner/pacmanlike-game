import { describe, expect, it } from 'vitest';
import { AudioManager, type SoundPort } from '../../src/presentation/AudioManager';

/** Motor de sonido falso: apunta lo que se pidió en vez de sonar. */
function fakePort(loaded: string[]) {
  const played: { key: string; volume: number; loop: boolean }[] = [];
  const stopped: string[] = [];
  const port: SoundPort = {
    has: (key) => loaded.includes(key),
    play: (key, o) => played.push({ key, ...o }),
    stop: (key) => stopped.push(key),
  };
  return { port, played, stopped };
}

describe('AudioManager', () => {
  it('cada evento suena con el volumen de su ficha', () => {
    const { port, played } = fakePort(['gem:collected']);
    const audio = new AudioManager(port, () => ({ volume: 0.5, loop: false }), () => {});
    expect(audio.play('gem:collected')).toBe(true);
    expect(played).toEqual([{ key: 'gem:collected', volume: 0.5, loop: false }]);
  });

  it('un sonido que falta no rompe nada y se avisa UNA sola vez', () => {
    const { port, played } = fakePort([]);
    const logs: string[] = [];
    const audio = new AudioManager(port, () => undefined, (m) => logs.push(m));
    expect(audio.play('player:died')).toBe(false);
    audio.play('player:died');
    expect(played).toEqual([]);
    expect(logs).toHaveLength(1);
  });

  it('la música va en bucle por defecto y se puede parar', () => {
    const { port, played, stopped } = fakePort(['music:level']);
    const audio = new AudioManager(port, () => undefined, () => {});
    audio.startMusic();
    audio.stopMusic();
    expect(played).toEqual([{ key: 'music:level', volume: 1, loop: true }]);
    expect(stopped).toEqual(['music:level']);
  });
});

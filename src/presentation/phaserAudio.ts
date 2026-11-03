import type Phaser from 'phaser';
import { AudioManager, type SoundPort } from './AudioManager';
import { loadSpecFor } from './assets/gameAssets';

/** Adaptador: cumple `SoundPort` con el sistema de sonido de Phaser. */
function phaserSoundPort(scene: Phaser.Scene): SoundPort {
  return {
    has: (key) => scene.cache.audio.exists(key),
    play: (key, { volume, loop }) => {
      // Un SFX one-shot se crea, suena y Phaser lo libera al terminar.
      // La música (loop) se queda viva hasta `stop`.
      if (loop) {
        scene.sound.stopByKey(key);
        scene.sound.add(key, { volume, loop }).play();
      } else {
        scene.sound.play(key, { volume });
      }
    },
    stop: (key) => {
      scene.sound.stopByKey(key);
    },
  };
}

/** AudioManager de una escena, con volúmenes y loops sacados de la ficha del manifest. */
export function createAudioManager(scene: Phaser.Scene): AudioManager {
  return new AudioManager(phaserSoundPort(scene), (key) => {
    const spec = loadSpecFor(key);
    if (spec?.kind !== 'audio') return undefined;
    return { volume: spec.volume ?? 1, loop: spec.loop ?? false };
  });
}

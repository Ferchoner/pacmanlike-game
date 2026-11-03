import type { SoundEvent } from './assets/assetKeys';
import { MUSIC_LEVEL_KEY } from './assets/assetKeys';

/**
 * Lo mínimo que el AudioManager necesita del motor. En el juego lo cumple
 * Phaser (`phaserSoundPort`); en las pruebas, un objeto falso que apunta qué
 * sonó. Así la lógica "qué evento suena" se prueba sin navegador.
 */
export interface SoundPort {
  has(key: string): boolean;
  play(key: string, options: { volume: number; loop: boolean }): void;
  stop(key: string): void;
}

export interface SoundSettings {
  readonly volume: number;
  readonly loop: boolean;
}

/**
 * AudioManager: el ÚNICO sitio que reproduce sonido (contrato v0.2).
 *
 * Las reglas del juego no saben de audio: emiten eventos (`gemCollected`,
 * `damaged`…) y la escena llama a `play('gem:collected')`. Si el sonido aún
 * no existe (recurso pendiente), no pasa nada: se anota una vez y el juego
 * sigue en silencio. Faltar un SFX nunca debe romper una partida.
 */
export class AudioManager {
  private readonly reported = new Set<string>();

  constructor(
    private readonly port: SoundPort,
    private readonly settingsFor: (key: string) => SoundSettings | undefined,
    private readonly log: (message: string) => void = (m) => console.info(m),
  ) {}

  /** Reproduce el SFX de un evento. Devuelve true si sonó. */
  play(event: SoundEvent): boolean {
    return this.playKey(event, false);
  }

  startMusic(): boolean {
    return this.playKey(MUSIC_LEVEL_KEY, true);
  }

  stopMusic(): void {
    if (this.port.has(MUSIC_LEVEL_KEY)) this.port.stop(MUSIC_LEVEL_KEY);
  }

  private playKey(key: string, defaultLoop: boolean): boolean {
    if (!this.port.has(key)) {
      if (!this.reported.has(key)) {
        this.reported.add(key);
        this.log(`[audio] "${key}" aún no tiene recurso aprobado: se omite (TEMP: silencio)`);
      }
      return false;
    }
    const settings = this.settingsFor(key);
    this.port.play(key, { volume: settings?.volume ?? 1, loop: settings?.loop ?? defaultLoop });
    return true;
  }
}

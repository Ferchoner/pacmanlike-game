/**
 * Sistema de DAÑO del jugador: corazones + invulnerabilidad temporal.
 *
 * Máquina de estados (muy pequeña):
 *
 *   vulnerable ──(contacto)──▶ invulnerable (0.8 s) ──(se acaba el tiempo)──▶ vulnerable
 *        │                                                    
 *        └──(contacto con 1 corazón)──▶ muerto (estado final)
 *
 * Reglas aprobadas (GDD / CONTEXTO_MAESTRO):
 * - Un contacto válido con un enemigo resta UN corazón.
 * - Después hay una invulnerabilidad (provisional 0.8 s) en la que los
 *   contactos se ignoran. Sin ella, tocar a un enemigo durante 3 fotogramas
 *   seguidos (≈0.05 s) te mataría al instante.
 * - Con 0 corazones: muerto → Game Over.
 *
 * Decisiones de esta fase (explicadas en el PR):
 * - Si te tocan DOS enemigos en el mismo fotograma, pierdes UN corazón: el
 *   golpe abre la invulnerabilidad y el segundo contacto ya no cuenta.
 * - Si sigues tocando al enemigo cuando termina la invulnerabilidad, vuelves
 *   a recibir daño: quedarse encima del monstruo no es seguro.
 *
 * Igual que `levelProgress`, `update` no llama a Phaser: DEVUELVE eventos que
 * la escena traduce a HUD, parpadeo y cambio de escena. Así se prueba con Vitest.
 */
export type HealthEvent =
  | { readonly type: 'damaged'; readonly hearts: number }
  | { readonly type: 'died' };

export interface PlayerHealthConfig {
  /** Corazones al empezar (aprobado: 3). */
  readonly startingHearts: number;
  /** Segundos de invulnerabilidad tras recibir daño (provisional: 0.8). */
  readonly invulnerabilitySeconds: number;
  /**
   * Corazones con los que se ENTRA (por defecto, `startingHearts`). En la
   * campaña los corazones se arrastran: se puede entrar al Nivel 2 con 2/3.
   */
  readonly currentHearts?: number;
}

export class PlayerHealth {
  readonly maxHearts: number;
  private current: number;
  /** Segundos que quedan de invulnerabilidad (0 = vulnerable). */
  private invulnerableLeft = 0;

  constructor(private readonly config: PlayerHealthConfig) {
    if (!Number.isInteger(config.startingHearts) || config.startingHearts < 1) {
      throw new Error(`startingHearts debe ser un entero ≥ 1 (llegó ${config.startingHearts})`);
    }
    if (!(config.invulnerabilitySeconds >= 0)) {
      throw new Error(`invulnerabilitySeconds debe ser ≥ 0 (llegó ${config.invulnerabilitySeconds})`);
    }
    const current = config.currentHearts ?? config.startingHearts;
    if (!Number.isInteger(current) || current < 1 || current > config.startingHearts) {
      throw new Error(`currentHearts debe ser un entero entre 1 y ${config.startingHearts} (llegó ${current})`);
    }
    this.maxHearts = config.startingHearts;
    this.current = current;
  }

  get hearts(): number {
    return this.current;
  }

  get isDead(): boolean {
    return this.current === 0;
  }

  get isInvulnerable(): boolean {
    return this.invulnerableLeft > 0;
  }

  /** Segundos de invulnerabilidad restantes (la vista lo usa para parpadear). */
  get invulnerableSecondsLeft(): number {
    return this.invulnerableLeft;
  }

  /**
   * Se llama una vez por fotograma, DESPUÉS de mover jugador y enemigos.
   * @param dtSeconds tiempo del fotograma.
   * @param touchingEnemy ¿algún enemigo toca al jugador ahora mismo?
   */
  update(dtSeconds: number, touchingEnemy: boolean): HealthEvent[] {
    if (this.isDead) return []; // estado final: ya no cambia nada

    // Primero corre el reloj; luego se mira el contacto. Así, si la
    // invulnerabilidad termina justo en este fotograma y sigues tocando, te dañan.
    this.invulnerableLeft = Math.max(0, this.invulnerableLeft - dtSeconds);

    if (!touchingEnemy || this.isInvulnerable) return [];

    this.current -= 1;
    if (this.current === 0) return [{ type: 'damaged', hearts: 0 }, { type: 'died' }];

    this.invulnerableLeft = this.config.invulnerabilitySeconds;
    return [{ type: 'damaged', hearts: this.current }];
  }
}

import { describe, expect, it } from 'vitest';
import { GAME_TUNING } from '../../src/data/gameTuning';
import { PlayerHealth, type HealthEvent } from '../../src/systems/playerHealth';

const config = {
  startingHearts: GAME_TUNING.startingHearts,
  invulnerabilitySeconds: GAME_TUNING.invulnerabilitySeconds,
};
const FRAME = 1 / 60;
const types = (events: HealthEvent[]) => events.map((e) => e.type);

/** Avanza `seconds` en fotogramas de 1/60 s con el contacto indicado. */
function run(h: PlayerHealth, seconds: number, touching: boolean): HealthEvent[] {
  const events: HealthEvent[] = [];
  for (let t = 0; t < seconds - 1e-9; t += FRAME) events.push(...h.update(FRAME, touching));
  return events;
}

describe('PlayerHealth', () => {
  it('empieza con 3 corazones, vivo y vulnerable', () => {
    const h = new PlayerHealth(config);
    expect(h.hearts).toBe(3);
    expect(h.maxHearts).toBe(3);
    expect(h.isDead).toBe(false);
    expect(h.isInvulnerable).toBe(false);
  });

  it('sin contacto no pasa nada', () => {
    const h = new PlayerHealth(config);
    expect(run(h, 5, false)).toEqual([]);
    expect(h.hearts).toBe(3);
  });

  it('un contacto resta un corazón y activa la invulnerabilidad', () => {
    const h = new PlayerHealth(config);
    expect(h.update(FRAME, true)).toEqual([{ type: 'damaged', hearts: 2 }]);
    expect(h.isInvulnerable).toBe(true);
    expect(h.invulnerableSecondsLeft).toBeCloseTo(0.8);
  });

  it('durante la invulnerabilidad los contactos se ignoran', () => {
    const h = new PlayerHealth(config);
    h.update(FRAME, true);
    expect(run(h, 0.7, true)).toEqual([]);
    expect(h.hearts).toBe(2);
  });

  it('si sigue tocando al acabar la invulnerabilidad, vuelve a recibir daño', () => {
    const h = new PlayerHealth(config);
    h.update(FRAME, true);
    const events = run(h, 0.85, true);
    expect(events).toEqual([{ type: 'damaged', hearts: 1 }]);
  });

  it('tras la invulnerabilidad vuelve a ser vulnerable', () => {
    const h = new PlayerHealth(config);
    h.update(FRAME, true);
    run(h, 0.9, false);
    expect(h.isInvulnerable).toBe(false);
    expect(h.update(FRAME, true)).toEqual([{ type: 'damaged', hearts: 1 }]);
  });

  it('tres golpes separados matan: el último emite damaged(0) y died', () => {
    const h = new PlayerHealth(config);
    const events: HealthEvent[] = [];
    for (let i = 0; i < 3; i++) {
      events.push(...h.update(FRAME, true));
      events.push(...run(h, 1, false));
    }
    expect(types(events)).toEqual(['damaged', 'damaged', 'damaged', 'died']);
    expect(h.hearts).toBe(0);
    expect(h.isDead).toBe(true);
  });

  it('muerto es estado final: no emite más eventos ni baja de 0', () => {
    const h = new PlayerHealth({ startingHearts: 1, invulnerabilitySeconds: 0.8 });
    expect(types(h.update(FRAME, true))).toEqual(['damaged', 'died']);
    expect(run(h, 3, true)).toEqual([]);
    expect(h.hearts).toBe(0);
  });

  it('pegado a un enemigo sin moverse, muere en ≈1.6 s (2 × 0.8), no al instante', () => {
    const h = new PlayerHealth(config);
    let frames = 0;
    while (!h.isDead && frames < 1000) {
      h.update(FRAME, true);
      frames++;
    }
    expect(frames * FRAME).toBeGreaterThan(1.6);
    expect(frames * FRAME).toBeLessThan(1.7);
  });

  it('la invulnerabilidad es configurable (0 = sin invulnerabilidad)', () => {
    const h = new PlayerHealth({ startingHearts: 3, invulnerabilitySeconds: 0 });
    h.update(FRAME, true);
    h.update(FRAME, true);
    expect(h.hearts).toBe(1);
  });

  it('rechaza configuraciones sin sentido', () => {
    expect(() => new PlayerHealth({ startingHearts: 0, invulnerabilitySeconds: 0.8 })).toThrow();
    expect(() => new PlayerHealth({ startingHearts: 3, invulnerabilitySeconds: -1 })).toThrow();
    expect(() => new PlayerHealth({ startingHearts: 3, invulnerabilitySeconds: 0.8, currentHearts: 0 })).toThrow();
    expect(() => new PlayerHealth({ startingHearts: 3, invulnerabilitySeconds: 0.8, currentHearts: 4 })).toThrow();
  });

  it('en la campaña puede entrar al nivel con los corazones que le quedaron', () => {
    const h = new PlayerHealth({ startingHearts: 3, invulnerabilitySeconds: 0.8, currentHearts: 1 });
    expect(h.hearts).toBe(1);
    expect(h.maxHearts).toBe(3);
    expect(h.update(1 / 60, true)).toEqual([{ type: 'damaged', hearts: 0 }, { type: 'died' }]);
  });
});

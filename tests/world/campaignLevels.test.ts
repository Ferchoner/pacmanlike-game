import { describe, expect, it } from 'vitest';
import { COMIENZO_MAZMORRAS, LEVELS } from '../../src/data/levels';
import { validateLevel } from '../../src/world/validateLevel';
import { gemSurplusWarning } from '../../src/world/levelDesignRules';

describe('Niveles de la campaña', () => {
  it('el primer nivel es "Comienzo de las mazmorras" (diseño de Fernando)', () => {
    expect(LEVELS[0]).toBe(COMIENZO_MAZMORRAS);
    expect(LEVELS[0]!.name).toBe('Comienzo de las mazmorras');
  });

  it('cada nivel es válido (sin errores) y tiene un id único', () => {
    for (const level of LEVELS) {
      const errors = validateLevel(level).issues.filter((i) => i.severity === 'error');
      expect(errors, level.id).toEqual([]);
    }
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
  });

  it('en cada nivel sobran entre 5 y 8 gemas (regla de Fernando, 2026-11-04)', () => {
    for (const level of LEVELS) {
      expect(gemSurplusWarning(level), level.id).toBeNull();
    }
  });

  it('los niveles nuevos coinciden con el plan aprobado (gemas y enemigos)', () => {
    const resumen = LEVELS.map((l) => ({
      id: l.id,
      gemas: l.declared.gems.length,
      requeridas: l.gemsRequired,
      hunters: l.declared.hunters.length,
      patrols: l.declared.patrols.length,
    }));
    expect(resumen).toEqual([
      { id: 'comienzo-mazmorras', gemas: 30, requeridas: 25, hunters: 2, patrols: 2 },
      { id: 'catacumbas', gemas: 35, requeridas: 28, hunters: 3, patrols: 3 },
      { id: 'sala-del-guardian', gemas: 40, requeridas: 33, hunters: 4, patrols: 3 },
    ]);
  });
});

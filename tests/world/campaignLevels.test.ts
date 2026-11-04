import { describe, expect, it } from 'vitest';
import { LEVEL_1, LEVELS } from '../../src/data/levels';
import { validateLevel } from '../../src/world/validateLevel';

describe('Niveles de la campaña', () => {
  it('el Nivel 1 aprobado va primero', () => {
    expect(LEVELS[0]).toBe(LEVEL_1);
  });

  it('cada nivel es válido (sin errores) y tiene un id único', () => {
    for (const level of LEVELS) {
      const errors = validateLevel(level).issues.filter((i) => i.severity === 'error');
      expect(errors, level.id).toEqual([]);
    }
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
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
      { id: 'level-1', gemas: 25, requeridas: 20, hunters: 2, patrols: 1 },
      { id: 'level-2', gemas: 25, requeridas: 20, hunters: 2, patrols: 2 },
      { id: 'level-3', gemas: 30, requeridas: 24, hunters: 3, patrols: 2 },
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { COMIENZO_MAZMORRAS } from '../../src/data/levels';
import { GEM_SURPLUS, gemSurplus, gemSurplusWarning } from '../../src/world/levelDesignRules';

/** El primer nivel (30 gemas) con otras gemas requeridas. */
const withRequired = (gemsRequired: number) => ({ ...COMIENZO_MAZMORRAS, gemsRequired });

describe('Regla de diseño: sobran entre 5 y 8 gemas', () => {
  it('cuenta las gemas que sobran', () => {
    expect(gemSurplus(withRequired(25))).toBe(5);
  });

  it('no avisa en los extremos de la regla (sobran 5 o 8)', () => {
    expect(gemSurplusWarning(withRequired(30 - GEM_SURPLUS.min))).toBeNull();
    expect(gemSurplusWarning(withRequired(30 - GEM_SURPLUS.max))).toBeNull();
  });

  it('avisa si sobran pocas y dice qué valores valdrían', () => {
    const w = gemSurplusWarning(withRequired(28));
    expect(w).toMatch(/Sobran 2 gemas/);
    expect(w).toMatch(/entre 22 y 25/);
  });

  it('avisa si sobran demasiadas', () => {
    expect(gemSurplusWarning(withRequired(20))).toMatch(/Sobran 10 gemas/);
  });
});

import { describe, expect, it } from 'vitest';
import { NEW_RUN_DATA, endLevel, isCampaignRun, isLastLevel, newRun, nextLevelRun } from '../../src/systems/campaign';

describe('Campaña (varios niveles en una run)', () => {
  it('una run nueva empieza en el primer nivel, con corazones llenos y 0 gemas', () => {
    expect(newRun(3)).toEqual({ levelIndex: 0, hearts: 3, gemsSoFar: 0 });
    expect(newRun(3, 2).levelIndex).toBe(2); // ?nivel= en desarrollo
  });

  it('al terminar un nivel se suman sus gemas y se guardan los corazones que quedan', () => {
    const finished = endLevel({ levelIndex: 0, hearts: 3, gemsSoFar: 0 }, { gems: 22, hearts: 2 });
    expect(finished).toEqual({ levelIndex: 0, hearts: 2, gemsSoFar: 22 });
  });

  it('los corazones SE ARRASTRAN al siguiente nivel, sin curar', () => {
    const next = nextLevelRun({ levelIndex: 0, hearts: 1, gemsSoFar: 22 }, { maxHearts: 3, carryHearts: true });
    expect(next).toEqual({ levelIndex: 1, hearts: 1, gemsSoFar: 22 });
  });

  it('con carryHearts = false cada nivel empieza con los corazones llenos', () => {
    const next = nextLevelRun({ levelIndex: 0, hearts: 1, gemsSoFar: 22 }, { maxHearts: 3, carryHearts: false });
    expect(next.hearts).toBe(3);
  });

  it('sabe cuál es el último nivel', () => {
    expect(isLastLevel(newRun(3, 0), 3)).toBe(false);
    expect(isLastLevel(newRun(3, 2), 3)).toBe(true);
    expect(isLastLevel(newRun(3, 0), 1)).toBe(true);
  });

  it('la guarda de tipo rechaza datos vacíos o sin corazones', () => {
    expect(isCampaignRun(newRun(3))).toBe(true);
    expect(isCampaignRun(undefined)).toBe(false);
    expect(isCampaignRun({})).toBe(false);
    expect(isCampaignRun({ levelIndex: 0, hearts: 0, gemsSoFar: 0 })).toBe(false);
    expect(isCampaignRun({ levelIndex: -1, hearts: 3, gemsSoFar: 0 })).toBe(false);
  });
});

describe('Arrancar una run nueva', () => {
  it('NEW_RUN_DATA no es una CampaignRun: Game empieza de cero aunque Phaser recuerde datos viejos', () => {
    expect(isCampaignRun(NEW_RUN_DATA)).toBe(false);
  });
});

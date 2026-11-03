import { describe, expect, it } from 'vitest';
import { EnemyGroup } from '../../src/enemies/EnemyGroup';
import { centerOf, level, TUNING } from './helpers';

describe('EnemyGroup', () => {
  it('crea los enemigos desde los datos del nivel: 2 Hunters y 1 Patrol', () => {
    const group = new EnemyGroup(level, TUNING);
    expect(group.hunters.map((h) => h.home)).toEqual([
      { x: 6, y: 5 },
      { x: 12, y: 9 },
    ]);
    expect(group.patrols).toHaveLength(1);
    expect(group.all).toHaveLength(3);
  });

  it('touching detecta el contacto con el cuerpo del jugador', () => {
    const group = new EnemyGroup(level, TUNING);
    const atHunter2 = { ...centerOf({ x: 12, y: 9 }), half: 11 };
    expect(group.touching(atHunter2).map((e) => e.kind)).toEqual(['hunter']);
    const atStart = { ...centerOf(level.playerStart), half: 11 };
    expect(group.touching(atStart)).toEqual([]);
  });

  it('con el jugador quieto en el inicio, durante 10 s nadie lo toca', () => {
    const group = new EnemyGroup(level, TUNING);
    const player = { ...centerOf(level.playerStart), half: 11 };
    for (let i = 0; i < 600; i++) {
      group.update(1 / 60, player);
      expect(group.touching(player)).toEqual([]);
    }
  });
});

describe('EnemyGroup.onPlayerHit (Fase 6)', () => {
  it('los que golpean se quedan inmóviles y el Hunter se retira a casa', () => {
    const group = new EnemyGroup(level, TUNING);
    const [hunter] = group.hunters;
    const [patrol] = group.patrols;
    group.onPlayerHit([hunter!, patrol!]);
    expect(hunter!.isFrozen).toBe(true);
    expect(hunter!.isRetreating).toBe(true);
    expect(patrol!.isFrozen).toBe(true);
    expect(group.hunters[1]!.isFrozen).toBe(false);
  });

  it('el Patrol congelado no se mueve durante enemyHitFreezeSeconds', () => {
    const group = new EnemyGroup(level, TUNING);
    const far = { ...centerOf(level.playerStart), half: 11 };
    group.update(0.2, far);
    const patrol = group.patrols[0]!;
    const before = { x: patrol.x, y: patrol.y };
    group.onPlayerHit([patrol]);
    for (let t = 0; t < TUNING.enemyHitFreezeSeconds - 0.02; t += 1 / 60) group.update(1 / 60, far);
    expect({ x: patrol.x, y: patrol.y }).toEqual(before);
  });
});

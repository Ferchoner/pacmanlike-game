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

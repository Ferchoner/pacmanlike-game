import { describe, expect, it } from 'vitest';
import { animationSeconds, animKey, chooseAnimation } from '../../src/presentation/assets/animationChoice';

describe('Elección de animaciones', () => {
  it('usa la animación exacta de la dirección si existe', () => {
    const names = new Set(['walk-up', 'walk-down', 'walk-left', 'walk-right']);
    expect(chooseAnimation(names, 'walk', 'left')).toEqual({ name: 'walk-left', flipX: false });
  });

  it('si solo hay "derecha", la izquierda es la misma volteada (y al revés)', () => {
    expect(chooseAnimation(new Set(['walk-right']), 'walk', 'left')).toEqual({ name: 'walk-right', flipX: true });
    expect(chooseAnimation(new Set(['walk-left']), 'walk', 'right')).toEqual({ name: 'walk-left', flipX: true });
  });

  it('arriba/abajo no se voltean: cae a la animación sin dirección', () => {
    expect(chooseAnimation(new Set(['walk-right', 'walk']), 'walk', 'up')).toEqual({ name: 'walk', flipX: false });
  });

  it('si no hay nada para esa acción, devuelve null (la vista decide)', () => {
    expect(chooseAnimation(new Set(['walk']), 'idle', 'down')).toBeNull();
  });

  it('la duración de una animación es frames / fps', () => {
    expect(animationSeconds({ frames: [0, 1, 2, 3, 4, 5, 6, 7], fps: 10, loop: false })).toBeCloseTo(0.8);
  });

  it('la clave global junta textura y nombre', () => {
    expect(animKey('player', 'death')).toBe('player:death');
  });
});

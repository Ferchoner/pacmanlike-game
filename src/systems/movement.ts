/**
 * Sistema de movimiento: convierte la INTENCIÓN del jugador (teclas) en una
 * velocidad. No sabe nada de Phaser ni de paredes: solo matemáticas.
 */

/** -1, 0 o 1 en cada eje. y = -1 es arriba (en pantalla la y crece hacia abajo). */
export type AxisValue = -1 | 0 | 1;

/** Dirección que pide el jugador en este fotograma. */
export interface DirectionInput {
  readonly x: AxisValue;
  readonly y: AxisValue;
}

export const NO_INPUT: DirectionInput = { x: 0, y: 0 };

/**
 * Combina las dos teclas de un eje. Si se pulsan las dos a la vez se anulan
 * (0): es lo más predecible y evita que "gane" una tecla al azar.
 */
export function axisFromKeys(negative: boolean, positive: boolean): AxisValue {
  if (negative === positive) return 0;
  return negative ? -1 : 1;
}

/**
 * Velocidad en px/s con la diagonal NORMALIZADA.
 *
 * Sin normalizar, (1, 1) × 160 daría una rapidez de √2 × 160 ≈ 226 px/s:
 * moverse en diagonal sería un 41 % más rápido. Dividiendo el vector entre su
 * longitud, cualquier dirección avanza exactamente `speed` px/s.
 */
export function velocityFromInput(input: DirectionInput, speed: number): { x: number; y: number } {
  const length = Math.hypot(input.x, input.y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: (input.x / length) * speed, y: (input.y / length) * speed };
}

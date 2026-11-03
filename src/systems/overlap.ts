/**
 * Detección de solapamiento entre cajas alineadas a los ejes (AABB =
 * "axis-aligned bounding box"). Es la prueba de colisión más barata y común
 * en juegos 2D: dos rectángulos se tocan si se solapan en X **y** en Y.
 *
 * Sin Phaser: las reglas de recogida y de la puerta se prueban con Vitest.
 */

/** Caja cuadrada descrita por su centro y la mitad de su lado (px). */
export interface CenteredBox {
  readonly x: number;
  readonly y: number;
  readonly half: number;
}

/**
 * ¿Se solapan dos cajas? Usamos `<` estricto: si solo comparten el borde
 * (están "pegadas") NO cuenta. Así tocar justo el borde de una gema no la
 * recoge por un píxel de redondeo.
 */
/**
 * Cuánto hay que mover `mover` para que deje de solaparse con `obstacle`,
 * por el eje de MENOR penetración (el camino más corto para salir). Devuelve
 * {0, 0} si no se solapan. Queda justo pegado (borde con borde), que con el
 * `<` estricto de `boxesOverlap` ya no cuenta como contacto.
 */
export function separation(mover: CenteredBox, obstacle: CenteredBox): { x: number; y: number } {
  const reach = mover.half + obstacle.half;
  const dx = mover.x - obstacle.x;
  const dy = mover.y - obstacle.y;
  const penX = reach - Math.abs(dx);
  const penY = reach - Math.abs(dy);
  if (penX <= 0 || penY <= 0) return { x: 0, y: 0 };
  // Con los centros alineados en un eje, salir por el otro (sin dirección no hay signo).
  if (penX < penY || (penX === penY && Math.abs(dx) >= Math.abs(dy))) {
    return { x: (dx >= 0 ? 1 : -1) * penX, y: 0 };
  }
  return { x: 0, y: (dy >= 0 ? 1 : -1) * penY };
}

export function boxesOverlap(a: CenteredBox, b: CenteredBox): boolean {
  const reach = a.half + b.half;
  return Math.abs(a.x - b.x) < reach && Math.abs(a.y - b.y) < reach;
}

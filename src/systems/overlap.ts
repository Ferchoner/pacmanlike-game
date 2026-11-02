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
export function boxesOverlap(a: CenteredBox, b: CenteredBox): boolean {
  const reach = a.half + b.half;
  return Math.abs(a.x - b.x) < reach && Math.abs(a.y - b.y) < reach;
}

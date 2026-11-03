import type { Facing } from '../../player/Player';
import type { AnimationSpec } from './assetManifest';

/**
 * Reglas PURAS para elegir y medir animaciones (sin Phaser, con pruebas).
 *
 * Convención de nombres en la ficha (`load.animations`):
 * - Con dirección: `walk-up`, `walk-down`, `walk-left`, `walk-right`, `idle-down`…
 * - Sin dirección: `idle`, `walk`, `damage`, `death`.
 * Si falta `-left` pero hay `-right`, se usa `-right` volteado (flipX): es un
 * truco estándar del motor, no redibuja nada. Lo mismo al revés.
 */

/** Clave global de una animación en Phaser: textura + nombre (`player:walk-up`). */
export function animKey(textureKey: string, name: string): string {
  return `${textureKey}:${name}`;
}

export interface AnimationChoice {
  readonly name: string;
  readonly flipX: boolean;
}

/** La mejor animación disponible para una acción y dirección, o `null`. */
export function chooseAnimation(
  available: ReadonlySet<string>,
  action: string,
  facing: Facing,
): AnimationChoice | null {
  const exact = `${action}-${facing}`;
  if (available.has(exact)) return { name: exact, flipX: false };
  const mirror = facing === 'left' ? 'right' : facing === 'right' ? 'left' : null;
  if (mirror && available.has(`${action}-${mirror}`)) return { name: `${action}-${mirror}`, flipX: true };
  if (available.has(action)) return { name: action, flipX: false };
  return null;
}

/**
 * Lo que dura una animación de una sola pasada, en segundos: frames / FPS.
 * Así la secuencia de muerte dura lo que dura SU animación real, no un número
 * inventado. (Una de 8 frames a 10 FPS dura 0.8 s.)
 */
export function animationSeconds(spec: AnimationSpec): number {
  return spec.frames.length / spec.fps;
}

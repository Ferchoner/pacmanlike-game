import type Phaser from 'phaser';
import { animKey } from './assets/animationChoice';
import type { AnimationSpec, ReadyAsset } from './assets/assetManifest';

/**
 * AnimationManager: crea las animaciones de Phaser a partir de las fichas
 * del manifest (frames, FPS, loop) y responde qué animaciones tiene cada
 * textura. Las vistas solo piden "camina hacia arriba"; no saben índices.
 *
 * Las animaciones son GLOBALES en Phaser (viven en `scene.anims`, compartido
 * por todas las escenas), así que se registran una vez, en Preload.
 */
const available = new Map<string, Map<string, AnimationSpec>>();

export function registerAnimations(scene: Phaser.Scene, ready: readonly ReadyAsset[]): void {
  for (const asset of ready) {
    const spec = asset.load;
    if (spec.kind !== 'spritesheet' || !spec.animations) continue;
    if (!scene.textures.exists(spec.key)) continue; // falló la carga: la vista usa TEMP
    // frameTotal incluye el frame "__BASE" de Phaser, por eso el -1.
    const frameCount = scene.textures.get(spec.key).frameTotal - 1;
    const names = available.get(spec.key) ?? new Map<string, AnimationSpec>();
    for (const [name, anim] of Object.entries(spec.animations)) {
      const key = animKey(spec.key, name);
      const outOfRange = anim.frames.filter((f) => f >= frameCount);
      if (outOfRange.length > 0) {
        // La ficha no cuadra con la imagen real: se informa, no se "corrige".
        console.error(
          `[animación] ${asset.id} "${name}": frames ${outOfRange.join(', ')} no existen ` +
            `(la imagen tiene ${frameCount}). Revisa la ficha técnica.`,
        );
        continue;
      }
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(spec.key, { frames: [...anim.frames] }),
          frameRate: anim.fps,
          repeat: anim.loop ? -1 : 0,
        });
      }
      names.set(name, anim);
    }
    available.set(spec.key, names);
  }
}

/** Nombres de animación registrados para una textura (vacío si no hay). */
export function animationsOf(textureKey: string): ReadonlyMap<string, AnimationSpec> {
  return available.get(textureKey) ?? new Map();
}

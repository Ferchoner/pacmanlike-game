import type Phaser from 'phaser';
import { animKey } from './assets/animationChoice';
import type { AnimationSpec, ReadyAsset } from './assets/assetManifest';

/**
 * AnimationManager: crea las animaciones de Phaser a partir de las fichas
 * del manifest (frames, FPS, loop) y responde qué animaciones tiene cada
 * personaje. Las vistas solo piden "camina hacia la derecha"; no saben índices
 * ni en qué PNG está cada animación.
 *
 * Una animación pertenece a un PERSONAJE (`actor`), no a un archivo: el
 * soldado tiene `walk` en Soldier_Walk.png y `death` en Soldier_Death.png, y
 * Phaser cambia de textura solo al reproducir cada una.
 *
 * Las animaciones son GLOBALES en Phaser (viven en `scene.anims`, compartido
 * por todas las escenas), así que se registran una vez, en Preload.
 */
export interface ActorAnimation {
  readonly spec: AnimationSpec;
  readonly textureKey: string;
}

interface ActorInfo {
  /** Textura con la que se crea el sprite (la primera que cargó). */
  readonly firstTexture: string;
  readonly scale: number;
  readonly origin: { x: number; y: number } | undefined;
  readonly animations: Map<string, ActorAnimation>;
}

const actors = new Map<string, ActorInfo>();

export function registerAnimations(scene: Phaser.Scene, ready: readonly ReadyAsset[], defaultScale: number): void {
  for (const asset of ready) {
    const spec = asset.load;
    if (spec.kind !== 'spritesheet' || !spec.animations) continue;
    if (!scene.textures.exists(spec.key)) continue; // falló la carga: la vista usa TEMP
    const actor = spec.actor ?? spec.key;
    let info = actors.get(actor);
    if (!info) {
      info = { firstTexture: spec.key, scale: spec.scale ?? defaultScale, origin: spec.origin, animations: new Map() };
      actors.set(actor, info);
    }
    // frameTotal incluye el frame "__BASE" de Phaser, por eso el -1.
    const frameCount = scene.textures.get(spec.key).frameTotal - 1;
    for (const [name, anim] of Object.entries(spec.animations)) {
      const key = animKey(actor, name);
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
      info.animations.set(name, { spec: anim, textureKey: spec.key });
    }
  }
}

/** Datos de un personaje con al menos una animación cargada, o `undefined`. */
export function actorInfo(actor: string): Readonly<ActorInfo> | undefined {
  return actors.get(actor);
}

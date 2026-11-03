import manifestJson from '../../../docs/03_recursos/manifest.json';
import { artScale, readManifest, type AssetLoadSpec, type AssetManifest } from './assetManifest';

/**
 * El manifest REAL del proyecto, ya revisado. Se importa en tiempo de build
 * (Vite empaqueta el JSON), así que tras editar el manifest basta con
 * recargar `npm run dev`. Las rutas a los archivos siguen saliendo de ahí.
 */
export const MANIFEST: AssetManifest = manifestJson as AssetManifest;
export const ASSET_REPORT = readManifest(MANIFEST);

/** Escala entera por defecto del pixel art (32 / 16 = 2). */
export const ART_SCALE = artScale(MANIFEST);

/** Ficha técnica de una clave cargable, o `undefined` si no hay. */
export function loadSpecFor(key: string): AssetLoadSpec | undefined {
  return ASSET_REPORT.ready.find((asset) => asset.load.key === key)?.load;
}

/** Escala de dibujo de una clave: la de su ficha o la por defecto. */
export function scaleFor(key: string): number {
  const spec = loadSpecFor(key);
  return (spec && spec.kind !== 'audio' ? spec.scale : undefined) ?? ART_SCALE;
}

/** Dónde está un frame con nombre: textura, índice y escala. */
export interface FrameRef {
  readonly key: string;
  readonly frame: number;
  readonly scale: number;
}

/**
 * Busca un frame por nombre: primero en `namedFrames` de los spritesheets,
 * después una imagen cuya clave sea ese nombre. No mira si la carga funcionó:
 * eso lo comprueba la vista con `scene.textures.exists(ref.key)`.
 */
export function namedFrame(name: string): FrameRef | undefined {
  for (const { load } of ASSET_REPORT.ready) {
    if (load.kind === 'spritesheet' && load.namedFrames?.[name] !== undefined) {
      return { key: load.key, frame: load.namedFrames[name], scale: load.scale ?? ART_SCALE };
    }
  }
  const image = loadSpecFor(name);
  if (image?.kind === 'image') return { key: name, frame: 0, scale: image.scale ?? ART_SCALE };
  return undefined;
}

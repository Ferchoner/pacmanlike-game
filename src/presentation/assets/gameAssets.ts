import manifestJson from '../../../docs/03_recursos/manifest.json';
import { artScale, readManifest, type AssetLoadSpec, type AssetManifest } from './assetManifest';

/**
 * El manifest REAL del proyecto, ya revisado. Se importa en tiempo de build
 * (Vite empaqueta el JSON), así que tras editar el manifest basta con
 * recargar `npm run dev`. Las rutas a los archivos siguen saliendo de ahí.
 */
export const MANIFEST: AssetManifest = manifestJson as AssetManifest;
export const ASSET_REPORT = readManifest(MANIFEST);

/** Escala entera del pixel art (32 / 16 = 2). */
export const ART_SCALE = artScale(MANIFEST);

/** Ficha técnica de una clave ya aprobada, o `undefined` si no hay. */
export function loadSpecFor(key: string): AssetLoadSpec | undefined {
  return ASSET_REPORT.ready.find((asset) => asset.load.key === key)?.load;
}

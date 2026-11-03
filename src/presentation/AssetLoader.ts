import type Phaser from 'phaser';
import type { ReadyAsset } from './assets/assetManifest';

/**
 * Encola en el loader de Phaser los recursos aprobados del manifest.
 *
 * Si un archivo falla (ruta mal escrita, archivo que no se copió a
 * `public/assets/`), Phaser emite `loaderror`: lo anotamos y seguimos. La
 * vista que lo necesitaba verá que la textura no existe y usará su TEMP.
 */
export function queueAssets(load: Phaser.Loader.LoaderPlugin, ready: readonly ReadyAsset[]): void {
  const queued = new Set<string>();
  for (const asset of ready) {
    const spec = asset.load;
    // Varias entradas pueden compartir archivo (R-001…R-004 en un sheet): se carga una vez.
    if (queued.has(spec.key)) continue;
    queued.add(spec.key);
    switch (spec.kind) {
      case 'image':
        load.image(spec.key, asset.path);
        break;
      case 'spritesheet':
        load.spritesheet(spec.key, asset.path, {
          frameWidth: spec.frameWidth,
          frameHeight: spec.frameHeight,
          margin: spec.margin ?? 0,
          spacing: spec.spacing ?? 0,
        });
        break;
      case 'audio':
        load.audio(spec.key, asset.path);
        break;
    }
  }
  load.on('loaderror', (file: Phaser.Loader.File) => {
    console.error(`[recursos] no se pudo cargar "${file.key}" (${String(file.url)}): se usará TEMP`);
  });
}

import { describe, expect, it } from 'vitest';
import manifestJson from '../../docs/03_recursos/manifest.json';
import {
  artScale,
  readManifest,
  type AssetManifest,
  type ManifestEntry,
} from '../../src/presentation/assets/assetManifest';

/** Entrada aprobada y correcta; cada prueba rompe UNA cosa. */
function approved(over: Partial<ManifestEntry> = {}): ManifestEntry {
  return {
    id: 'R-020',
    entity: 'Audio',
    description: 'Recoger gema',
    priority: 'P0',
    format: 'OGG/WAV',
    animation_or_event: 'gem:collected',
    status: 'approved',
    path: 'assets/audio/gem.ogg',
    author_or_vendor: 'Autor X',
    license: 'CC0',
    load: { kind: 'audio', key: 'gem:collected', volume: 0.8 },
    ...over,
  };
}

function manifestWith(...assets: ManifestEntry[]): AssetManifest {
  return { visual_spec: { base_tile_px: 16, logical_cell_px: 32 }, assets };
}

describe('Manifest de recursos', () => {
  it('el manifest real del proyecto no tiene errores y todo sigue pendiente', () => {
    const report = readManifest(manifestJson as AssetManifest);
    expect(report.errors).toEqual([]);
    expect(report.ready).toEqual([]);
    expect(report.missing).toHaveLength(26);
  });

  it('una entrada aprobada y completa queda lista para cargar', () => {
    const report = readManifest(manifestWith(approved()));
    expect(report.errors).toEqual([]);
    expect(report.ready).toEqual([
      { id: 'R-020', path: 'assets/audio/gem.ogg', load: { kind: 'audio', key: 'gem:collected', volume: 0.8 } },
    ]);
  });

  it('lo que no está aprobado no se carga, aunque tenga ruta', () => {
    const report = readManifest(manifestWith(approved({ status: 'pending' })));
    expect(report.ready).toEqual([]);
    expect(report.missing[0]?.reason).toMatch(/pending/);
  });

  it('sin licencia o sin autor no se integra (es un error, no un aviso)', () => {
    const report = readManifest(manifestWith(approved({ license: null, author_or_vendor: null })));
    expect(report.ready).toEqual([]);
    expect(report.errors.map((e) => e.message).join(' ')).toMatch(/license.*author/s);
  });

  it('la ruta tiene que estar dentro de public/assets y con la extensión correcta', () => {
    expect(readManifest(manifestWith(approved({ path: '../secreto.ogg' }))).errors).not.toEqual([]);
    expect(readManifest(manifestWith(approved({ path: 'assets/audio/gem.png' }))).errors[0]?.message).toMatch(
      /audio/,
    );
  });

  it('un spritesheet sin tamaño de frame no se carga: no se adivinan dimensiones', () => {
    const sheet = approved({
      path: 'assets/sprites/player.png',
      load: { kind: 'spritesheet', key: 'player', frameWidth: null },
    });
    const report = readManifest(manifestWith(sheet));
    expect(report.ready).toEqual([]);
    expect(report.errors.some((e) => e.message.includes('frameWidth'))).toBe(true);
  });

  it('valida las animaciones y exige que "death" no se repita', () => {
    const sheet = approved({
      path: 'assets/sprites/player.png',
      load: {
        kind: 'spritesheet',
        key: 'player',
        frameWidth: 16,
        frameHeight: 16,
        animations: { death: { frames: [0, 1], fps: 8, loop: true }, walk: { frames: [], fps: 0, loop: true } },
      },
    });
    const messages = readManifest(manifestWith(sheet)).errors.map((e) => e.message);
    expect(messages.some((m) => m.includes('"death" no puede repetirse'))).toBe(true);
    expect(messages.some((m) => m.includes('"walk": "frames"'))).toBe(true);
    expect(messages.some((m) => m.includes('"walk": "fps"'))).toBe(true);
  });

  it('varias entradas pueden compartir archivo (un sheet), pero no una clave con dos archivos', () => {
    const load = { kind: 'image', key: 'gem' };
    const a = approved({ id: 'A', path: 'assets/sprites/gem.png', load });
    const b = approved({ id: 'B', path: 'assets/sprites/gem.png', load });
    const c = approved({ id: 'C', path: 'assets/sprites/otra.png', load });
    const report = readManifest(manifestWith(a, b, c));
    expect(report.ready.map((r) => r.id)).toEqual(['A', 'B']);
    expect(report.errors).toEqual([expect.objectContaining({ id: 'C' })]);
  });

  it('la escala del pixel art sale del manifest: 32 / 16 = 2', () => {
    expect(artScale(manifestWith())).toBe(2);
  });
});

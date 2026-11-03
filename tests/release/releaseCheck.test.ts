import { describe, expect, it } from 'vitest';
import manifestJson from '../../docs/03_recursos/manifest.json';
import type { AssetManifest, ManifestEntry } from '../../src/presentation/assets/assetManifest';
import {
  ITCH_LIMITS,
  absoluteReferences,
  canPublish,
  checkRelease,
  creditsText,
  type BuildFile,
  type ReleaseInput,
} from '../../tools/release/releaseCheck';

const GOOD_HTML = '<script type="module" crossorigin src="./assets/index-abc.js"></script>';

/** Una entrada aprobada y completa, que se puede publicar. */
function entry(overrides: Partial<ManifestEntry> = {}): ManifestEntry {
  return {
    id: 'R-900',
    entity: 'Gema',
    description: 'Gema',
    priority: 'P0',
    format: 'PNG',
    animation_or_event: 'N/A',
    status: 'approved',
    path: 'assets/gem.png',
    author_or_vendor: 'Autora',
    license: 'CC0',
    load: { kind: 'image', key: 'gem' },
    ...overrides,
  };
}

function manifest(...assets: ManifestEntry[]): AssetManifest {
  return { visual_spec: { base_tile_px: 16, logical_cell_px: 32 }, assets };
}

function input(overrides: Partial<ReleaseInput> = {}): ReleaseInput {
  return {
    manifest: manifest(entry()),
    distFiles: [
      { path: 'index.html', bytes: 400 },
      { path: 'assets/index-abc.js', bytes: 1_400_000 },
      { path: 'assets/gem.png', bytes: 3_000 },
    ],
    publicFiles: ['assets/gem.png'],
    indexHtml: GOOD_HTML,
    ...overrides,
  };
}

describe('Revisión de publicación (Fase 9)', () => {
  it('un build con todo aprobado se puede publicar y empaqueta todo', () => {
    const report = checkRelease(input());
    expect(report.blockers).toEqual([]);
    expect(canPublish(report)).toBe(true);
    expect(report.include.map((f) => f.path)).toEqual(['index.html', 'assets/index-abc.js', 'assets/gem.png']);
  });

  it('HOY el proyecto real no se puede publicar: hay recursos temp-dev y falta audio P0', () => {
    const report = checkRelease(input({ manifest: manifestJson as AssetManifest, distFiles: [], publicFiles: [] }));
    expect(canPublish(report)).toBe(false);
    expect(report.blockers.some((b) => b.includes('temp-dev'))).toBe(true);
    expect(report.blockers.some((b) => b.includes('R-020'))).toBe(true); // SFX recoger gema
  });

  it('un recurso temp-dev bloquea la publicación', () => {
    const report = checkRelease(input({ manifest: manifest(entry({ status: 'temp-dev', author_or_vendor: null })) }));
    expect(canPublish(report)).toBe(false);
    expect(report.blockers[0]).toContain('R-900');
  });

  it('falta un P0: bloquea; falta un P1 o P2: solo avisa', () => {
    const pending = (id: string, priority: string) =>
      entry({ id, priority, status: 'pending', path: null, author_or_vendor: null, license: null });
    const report = checkRelease(input({ manifest: manifest(entry(), pending('R-901', 'P0'), pending('R-902', 'P1')) }));
    expect(report.blockers.join()).toContain('R-901');
    expect(report.blockers.join()).not.toContain('R-902');
    expect(report.warnings.join()).toContain('R-902');
  });

  it('los archivos de public/ que el manifest no usa se quedan fuera del .zip', () => {
    const report = checkRelease(
      input({
        distFiles: [...input().distFiles, { path: 'assets/sin-usar.aseprite', bytes: 10 }],
        publicFiles: ['assets/gem.png', 'assets/sin-usar.aseprite'],
      }),
    );
    expect(report.excluded).toEqual(['assets/sin-usar.aseprite']);
    expect(report.include.some((f) => f.path === 'assets/sin-usar.aseprite')).toBe(false);
    expect(canPublish(report)).toBe(true);
  });

  it('itch.io distingue mayúsculas: "Gem.png" en dist/ no sirve si el manifest pide "gem.png"', () => {
    const report = checkRelease(
      input({
        distFiles: [{ path: 'index.html', bytes: 400 }, { path: 'assets/Gem.png', bytes: 3_000 }],
        publicFiles: ['assets/Gem.png'],
      }),
    );
    expect(report.blockers.join()).toContain('assets/gem.png');
  });

  it('sin index.html en la raíz no se publica', () => {
    const report = checkRelease(input({ distFiles: [{ path: 'assets/gem.png', bytes: 3_000 }] }));
    expect(report.blockers.join()).toContain('index.html');
  });

  it('las rutas absolutas en index.html bloquean (en itch.io el juego vive en una subcarpeta)', () => {
    expect(absoluteReferences(GOOD_HTML)).toEqual([]);
    expect(absoluteReferences('<script src="/assets/index.js"></script>')).toEqual(['/assets/index.js']);
    expect(absoluteReferences('<link href="//cdn.example.com/a.css">')).toEqual([]);
    const report = checkRelease(input({ indexHtml: '<script src="/assets/index-abc.js"></script>' }));
    expect(canPublish(report)).toBe(false);
  });

  it('respeta los límites de itch.io: archivos, tamaño total y por archivo', () => {
    const many: BuildFile[] = Array.from({ length: ITCH_LIMITS.maxFiles }, (_, i) => ({ path: `x/${i}.bin`, bytes: 1 }));
    expect(checkRelease(input({ distFiles: [...input().distFiles, ...many] })).blockers.join()).toContain('1000');

    const huge: BuildFile = { path: 'assets/video.bin', bytes: ITCH_LIMITS.maxFileBytes + 1 };
    expect(checkRelease(input({ distFiles: [...input().distFiles, huge] })).blockers.join()).toContain('200 MB');

    const big = (i: number): BuildFile => ({ path: `b${i}.bin`, bytes: 150 * 1024 * 1024 });
    const total = checkRelease(input({ distFiles: [...input().distFiles, big(1), big(2), big(3), big(4)] }));
    expect(total.blockers.join()).toContain('500 MB');
  });

  describe('modo beta (decisión de Fernando, 2026-11-03)', () => {
    const temp = (overrides: Partial<ManifestEntry> = {}) =>
      entry({ status: 'temp-dev', author_or_vendor: null, source_url: 'https://example.itch.io/pack', ...overrides });

    it('admite recursos temp-dev con origen y P0 que faltan, como avisos', () => {
      const pendingP0 = entry({ id: 'R-901', status: 'pending', path: null, author_or_vendor: null, license: null });
      const report = checkRelease(input({ mode: 'beta', manifest: manifest(temp(), pendingP0) }));
      expect(report.blockers).toEqual([]);
      expect(report.warnings.join()).toContain('temp-dev');
      expect(report.warnings.join()).toContain('R-901');
    });

    it('un temp-dev sin source_url bloquea: sin origen no hay créditos', () => {
      const report = checkRelease(input({ mode: 'beta', manifest: manifest(temp({ source_url: null })) }));
      expect(report.blockers.join()).toContain('source_url');
    });

    it('el modo final sigue sin admitir temp-dev', () => {
      expect(canPublish(checkRelease(input({ manifest: manifest(temp()) })))).toBe(false);
    });

    it('los créditos salen del manifest, un bloque por archivo, con el aviso de beta', () => {
      const text = creditsText(
        manifest(temp({ id: 'R-009' }), temp({ id: 'R-010' }), entry({ id: 'R-020', status: 'pending' })),
        'beta',
        '0.1.0-beta.1',
      );
      expect(text).toContain('VERSIÓN BETA');
      expect(text).toContain('gem.png (R-009, R-010)');
      expect(text).toContain('Origen: https://example.itch.io/pack');
      expect(text).not.toContain('R-020');
    });
  });
});

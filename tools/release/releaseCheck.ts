/**
 * Revisión de publicación (Fase 9): ¿este build se puede subir a itch.io?
 *
 * Es un módulo PURO, igual que `assetManifest.ts`: recibe datos (el manifest,
 * la lista de archivos de `dist/`, el `index.html`) y devuelve un informe. No
 * lee disco ni crea el .zip; eso lo hace `packageItch.ts`. Así cada regla
 * tiene su prueba en `tests/release/releaseCheck.test.ts`.
 *
 * Dos modos:
 * - `final` (por defecto): la versión terminada. Nada temporal.
 * - `beta`: primera versión pública con el arte temporal de uso gratuito
 *   (decisión de Fernando, 2026-11-03). Los recursos `temp-dev` y los P0 que
 *   faltan pasan a AVISO, pero cada `temp-dev` necesita `source_url` (de dónde
 *   se descargó): sin origen no se puede dar crédito ni revisar su licencia.
 *
 * El informe separa dos niveles:
 * - BLOQUEOS: impiden publicar. Recursos temporales (`temp-dev`), recursos
 *   P0 que faltan, errores del manifest y problemas que itch.io rechazaría.
 * - AVISOS: se puede publicar, pero conviene saberlo (recursos P1/P2 que
 *   faltan, archivos de `public/` que el juego no usa y se dejan fuera).
 */
import { GAME_TITLE } from '../../src/core/release.ts';
import { readManifest, type AssetManifest, type ManifestEntry } from '../../src/presentation/assets/assetManifest.ts';

/**
 * Límites de itch.io para juegos HTML5 subidos como .zip
 * (https://itch.io/docs/creators/html5, consultado el 2026-11-03).
 */
export const ITCH_LIMITS = {
  maxFiles: 1000,
  maxTotalBytes: 500 * 1024 * 1024,
  maxFileBytes: 200 * 1024 * 1024,
  maxPathLength: 240,
} as const;

/** Un archivo del build, con ruta relativa a `dist/` y separador `/`. */
export interface BuildFile {
  readonly path: string;
  readonly bytes: number;
}

export type ReleaseMode = 'final' | 'beta';

export interface ReleaseInput {
  readonly manifest: AssetManifest;
  /** `final` si no se indica. */
  readonly mode?: ReleaseMode;
  /** Todo lo que hay en `dist/` después de `npm run build`. */
  readonly distFiles: readonly BuildFile[];
  /** Todo lo que hay en `public/` (Vite lo copia tal cual a `dist/`). */
  readonly publicFiles: readonly string[];
  /** Contenido de `dist/index.html`. */
  readonly indexHtml: string;
}

export interface ReleaseReport {
  readonly blockers: readonly string[];
  readonly warnings: readonly string[];
  /** Lo que irá dentro del .zip. */
  readonly include: readonly BuildFile[];
  /** Archivos de `public/` que el manifest no usa: se dejan fuera del .zip. */
  readonly excluded: readonly string[];
  readonly totalBytes: number;
}

/** true si no hay nada que impida publicar. */
export function canPublish(report: ReleaseReport): boolean {
  return report.blockers.length === 0;
}

export function checkRelease(input: ReleaseInput): ReleaseReport {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const manifestReport = readManifest(input.manifest);

  // 1. Recursos: lo que dice el manifest.
  for (const issue of manifestReport.errors) {
    blockers.push(`manifest: ${issue.id} ${issue.message}`);
  }
  const beta = input.mode === 'beta';
  const temporary = manifestReport.ready.filter((asset) => asset.temporary).map((asset) => asset.id);
  if (temporary.length > 0) {
    const line = `${temporary.length} recursos temporales (temp-dev): ${temporary.join(', ')}`;
    if (beta) warnings.push(`${line}. Permitido en la beta; van en los créditos como arte de terceros.`);
    else blockers.push(`${line}. Sustitúyelos por recursos aprobados antes de publicar la versión final.`);
  }
  if (beta) {
    const withoutSource = input.manifest.assets
      .filter((entry) => entry.status === 'temp-dev' && !entry.source_url)
      .map((entry) => entry.id);
    if (withoutSource.length > 0) {
      blockers.push(
        `beta: falta "source_url" (de dónde se descargó) en ${withoutSource.join(', ')}. ` +
          'Sin origen no hay créditos ni forma de revisar la licencia.',
      );
    }
  }
  for (const missing of manifestReport.missing) {
    const line = `falta ${missing.id} (${missing.priority}) ${missing.what}: ${missing.reason}`;
    if (missing.priority === 'P0' && !beta) blockers.push(line);
    else warnings.push(line);
  }

  // 2. Qué entra en el .zip: lo generado por Vite + los archivos que el manifest carga.
  const publicSet = new Set(input.publicFiles);
  const used = new Set(manifestReport.ready.map((asset) => asset.path));
  const include: BuildFile[] = [];
  const excluded: string[] = [];
  for (const file of input.distFiles) {
    const fromPublic = publicSet.has(file.path);
    if (fromPublic && !used.has(file.path)) excluded.push(file.path);
    else include.push(file);
  }
  if (excluded.length > 0) {
    warnings.push(
      `${excluded.length} archivos de public/ no los usa el manifest y no se empaquetan: ${excluded.join(', ')}`,
    );
  }

  // 3. Lo que itch.io exige al .zip.
  const distPaths = new Set(input.distFiles.map((file) => file.path));
  if (!distPaths.has('index.html')) {
    blockers.push('no hay index.html en la raíz del build (¿se ejecutó npm run build?)');
  }
  for (const reference of absoluteReferences(input.indexHtml)) {
    blockers.push(`index.html usa una ruta absoluta (${reference}); itch.io necesita rutas relativas`);
  }
  for (const asset of manifestReport.ready) {
    // Comparación EXACTA: itch.io distingue mayúsculas y Windows no. Un
    // "Tiles.png" que en tu PC funciona, en itch.io sería un archivo perdido.
    if (!distPaths.has(asset.path)) {
      blockers.push(`${asset.id}: el manifest pide "${asset.path}" y no está en dist/ (revisa mayúsculas)`);
    }
  }
  if (include.length > ITCH_LIMITS.maxFiles) {
    blockers.push(`el .zip tendría ${include.length} archivos; itch.io admite ${ITCH_LIMITS.maxFiles}`);
  }
  const totalBytes = include.reduce((sum, file) => sum + file.bytes, 0);
  if (totalBytes > ITCH_LIMITS.maxTotalBytes) {
    blockers.push(`el .zip ocuparía ${megabytes(totalBytes)} descomprimido; itch.io admite 500 MB`);
  }
  for (const file of include) {
    if (file.bytes > ITCH_LIMITS.maxFileBytes) {
      blockers.push(`${file.path} pesa ${megabytes(file.bytes)}; itch.io admite 200 MB por archivo`);
    }
    if (file.path.length > ITCH_LIMITS.maxPathLength) {
      blockers.push(`ruta demasiado larga (${file.path.length} caracteres): ${file.path}`);
    }
  }

  return { blockers, warnings, include, excluded, totalBytes };
}

/** Rutas en `src="/..."` o `href="/..."` (absolutas al dominio, no `//cdn`). */
export function absoluteReferences(html: string): string[] {
  const found: string[] = [];
  for (const match of html.matchAll(/\b(?:src|href)\s*=\s*["'](\/(?!\/)[^"']*)["']/g)) {
    if (match[1] !== undefined) found.push(match[1]);
  }
  return found;
}

export function megabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Texto de CREDITOS.txt, que va dentro del .zip: de quién es cada recurso
 * externo que el juego carga. Sale del manifest; nada se escribe a mano.
 */
export function creditsText(manifest: AssetManifest, mode: ReleaseMode, version: string): string {
  const used = manifest.assets.filter((entry) => entry.status === 'approved' || entry.status === 'temp-dev');
  // Un crédito por pack (misma página de origen); sin origen, uno por archivo.
  const groups = new Map<string, ManifestEntry[]>();
  for (const entry of used) {
    if (!entry.path) continue;
    const key = entry.source_url ?? entry.path;
    groups.set(key, [...(groups.get(key) ?? []), entry]);
  }
  const lines: string[] = [`${GAME_TITLE} ${version}`, ''];
  if (mode === 'beta') {
    lines.push(
      'VERSIÓN BETA: no es un producto terminado.',
      'El arte de esta versión es TEMPORAL: recursos de uso gratuito creados por terceros.',
      'No son obra nuestra y se sustituirán en la versión final.',
      '',
    );
  }
  lines.push('Programación y diseño: Fernando Hernandez Argueta', '', 'Recursos externos:');
  for (const entries of groups.values()) {
    const first = entries[0]!;
    const files = [...new Set(entries.map((e) => e.path!.replace(/^assets\//, '')))];
    lines.push(
      `- Autor: ${first.author_or_vendor ?? 'ver origen'}`,
      `  Origen: ${first.source_url ?? 'sin registrar'}`,
      `  Archivos: ${files.join(', ')} (${entries.map((e) => e.id).join(', ')})`,
      `  Licencia: ${first.license ?? 'sin registrar'}`,
      '',
    );
  }
  lines.push('Motor: Phaser (MIT License) · https://phaser.io', '');
  return lines.join('\n');
}

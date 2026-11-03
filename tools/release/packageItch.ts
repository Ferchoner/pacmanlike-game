/**
 * Empaqueta `dist/` en un .zip listo para subir a itch.io (Fase 9).
 *
 * Uso (desde la raíz del repo):
 *   npm run package:itch          → build + revisión; crea el .zip SOLO si no hay bloqueos
 *   npm run package:itch:prueba   → igual, pero con bloqueos crea un .zip de PRUEBA
 *                                   (nombre "NO-PUBLICAR") para probar en local o en un
 *                                   borrador privado de itch.io
 *
 * Node ejecuta este archivo .ts directamente (Node 22.18+ quita los tipos al
 * vuelo). Por eso los imports llevan la extensión `.ts`.
 *
 * Este script NO publica nada: solo crea un archivo en `release/`.
 */
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { zipSync, type Zippable } from 'fflate';
import type { AssetManifest } from '../../src/presentation/assets/assetManifest.ts';
import { canPublish, checkRelease, megabytes, type BuildFile } from './releaseCheck.ts';

const ROOT = process.cwd();
const DIST = join(ROOT, 'dist');
const PUBLIC = join(ROOT, 'public');
const OUT_DIR = join(ROOT, 'release');
const isTest = process.argv.includes('--prueba');

/** Lista recursiva de archivos, con rutas relativas y separador `/` (también en Windows). */
function listFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full).map((f) => `${entry.name}/${f}`));
    else if (entry.isFile()) files.push(entry.name);
  }
  return files;
}

function toPosix(path: string): string {
  return path.split(sep).join('/');
}

function main(): number {
  let distPaths: string[];
  try {
    distPaths = listFiles(DIST);
  } catch {
    console.error('No existe dist/. Ejecuta primero: npm run build');
    return 1;
  }
  const distFiles: BuildFile[] = distPaths.map((path) => ({
    path: toPosix(path),
    bytes: statSync(join(DIST, path)).size,
  }));
  const manifest = JSON.parse(
    readFileSync(join(ROOT, 'docs', '03_recursos', 'manifest.json'), 'utf8'),
  ) as AssetManifest;
  const indexPath = join(DIST, 'index.html');
  const indexHtml = distPaths.includes('index.html') ? readFileSync(indexPath, 'utf8') : '';

  const report = checkRelease({
    manifest,
    distFiles,
    publicFiles: listFiles(PUBLIC).map(toPosix),
    indexHtml,
  });

  console.log('\n=== Revisión de publicación para itch.io ===\n');
  console.log(`Archivos en el .zip: ${report.include.length} · ${megabytes(report.totalBytes)} sin comprimir`);
  if (report.warnings.length > 0) {
    console.log('\nAVISOS (se puede publicar, pero revisa):');
    for (const line of report.warnings) console.log(`  - ${line}`);
  }
  if (report.blockers.length > 0) {
    console.log('\nBLOQUEOS (impiden publicar):');
    for (const line of report.blockers) console.log(`  ✗ ${line}`);
  }

  const publishable = canPublish(report);
  if (!publishable && !isTest) {
    console.log('\nNo se creó el .zip. Para un paquete de PRUEBA: npm run package:itch:prueba\n');
    return 1;
  }

  const version = (JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }).version;
  const name = publishable ? `pac-big-man-v${version}-html5.zip` : `pac-big-man-v${version}-PRUEBA-NO-PUBLICAR.zip`;
  const zippable: Zippable = {};
  for (const file of report.include) {
    zippable[file.path] = readFileSync(join(DIST, file.path));
  }
  // level 9 = compresión máxima; el .zip se crea una vez y se descarga muchas.
  const zip = zipSync(zippable, { level: 9 });
  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, name);
  writeFileSync(outPath, zip);

  console.log(`\n${publishable ? '✓' : '⚠'} Creado ${toPosix(relative(ROOT, outPath))} (${megabytes(zip.length)})`);
  if (!publishable) console.log('  Es un paquete de PRUEBA: no lo publiques mientras haya bloqueos.');
  console.log('');
  return 0;
}

process.exitCode = main();

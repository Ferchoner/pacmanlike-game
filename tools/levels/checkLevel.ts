/**
 * Revisa un nivel desde la terminal, sin abrir el juego.
 *
 * Uso (desde la raíz del repo):
 *   npm run level:check -- tiled/mapas/mi_nivel.json
 *   npm run level:check -- src/data/levels/level1.json
 *
 * Acepta los dos formatos:
 * - un mapa exportado por Tiled (tiene "layers"): primero se traduce;
 * - un nivel del juego escrito a mano (tiene "tiles"), como level1.json.
 *
 * Después pasa el MISMO validador que usa el juego al cargar (Fase 2) y
 * muestra el mapa en ASCII, los errores y los avisos. Sale con código 1 si hay
 * errores, así se puede usar también en scripts o en CI.
 *
 * Node ejecuta este .ts directamente (Node 22.18+), por eso los imports llevan `.ts`.
 */
import { readFileSync } from 'node:fs';
import { GRID } from '../../src/core/GameConstants.ts';
import type { LevelDefinition } from '../../src/world/LevelTypes.ts';
import { convertTiledMap } from '../../src/world/tiled/tiledToLevel.ts';
import { validateLevel } from '../../src/world/validateLevel.ts';

const file = process.argv[2];
if (!file) {
  console.error('Uso: npm run level:check -- ruta/al/nivel.json');
  process.exit(2);
}

let json: unknown;
try {
  json = JSON.parse(readFileSync(file, 'utf8'));
} catch (error) {
  console.error(`✖ No se pudo leer "${file}" como JSON: ${(error as Error).message}`);
  process.exit(1);
}

let def: LevelDefinition;
if (typeof json === 'object' && json !== null && 'layers' in json) {
  console.log(`Mapa de Tiled: ${file}`);
  const result = convertTiledMap(json, { source: file });
  if (!result.ok) {
    console.log(`\n✖ No se pudo traducir (${result.issues.length} errores):`);
    for (const issue of result.issues) console.log(`  ✖ [${issue.code}] ${issue.message}`);
    process.exit(1);
  }
  def = result.definition;
} else {
  console.log(`Nivel del juego: ${file}`);
  def = json as LevelDefinition;
}

console.log(`\n"${def.name}" (id: ${def.id}) — ${def.columns}×${def.rows}, gemas requeridas: ${def.gemsRequired}\n`);
for (const row of def.tiles) console.log(`  ${row}`);

const report = validateLevel(def);
const errors = report.issues.filter((i) => i.severity === 'error');
const warnings = report.issues.filter((i) => i.severity === 'warning');

// El juego tiene la pantalla fija a 24×18 celdas: otro tamaño se valida,
// pero no cabría bien en pantalla. Es un aviso, no un error del nivel.
if (def.columns !== GRID.columns || def.rows !== GRID.rows) {
  console.log(
    `\n⚠ El juego hoy muestra ${GRID.columns}×${GRID.rows} celdas; este nivel mide ${def.columns}×${def.rows}.`,
  );
}

if (report.stats) {
  const s = report.stats;
  console.log(
    `\nSuelo: ${s.floorCells} celdas (${s.reachableCells} alcanzables) · Gemas: ${s.totalGems} (${s.reachableGems} alcanzables)`,
  );
}
for (const e of errors) console.log(`  ✖ [${e.code}] ${e.message}`);
for (const w of warnings) console.log(`  ⚠ [${w.code}] ${w.message}`);

if (!report.ok) {
  console.log(`\n✖ El nivel NO es jugable: ${errors.length} errores, ${warnings.length} avisos.`);
  process.exit(1);
}
console.log(`\n✔ Nivel válido${warnings.length ? ` (${warnings.length} avisos para revisar)` : ''}.`);

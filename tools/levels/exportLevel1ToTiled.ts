/**
 * Genera `tiled/mapas/nivel1_referencia.json`: el Nivel 1 aprobado en formato
 * Tiled, para abrirlo y aprender cómo se construye un nivel.
 *
 * Uso: npm run level:export-nivel1
 *
 * IMPORTANTE: es una COPIA DE REFERENCIA. El juego sigue cargando el Nivel 1
 * desde `src/data/levels/level1.json` (Blueprint v0.1 aprobado). Editar este
 * archivo en Tiled NO cambia el juego; una prueba comprueba que sigue igual.
 */
import { writeFileSync } from 'node:fs';
import { GRID } from '../../src/core/GameConstants.ts';
import type { LevelDefinition } from '../../src/world/LevelTypes.ts';
import { levelToTiled } from '../../src/world/tiled/levelToTiled.ts';
import level1 from '../../src/data/levels/level1.json' with { type: 'json' };

export const NIVEL1_REFERENCIA = 'tiled/mapas/nivel1_referencia.json';

const map = levelToTiled(level1 as LevelDefinition, {
  tilesetSource: '../tilesets/paredes_TEMP.tsx',
  cellSize: GRID.cellSize,
});
// La capa de paredes se escribe en filas de 24 números (como hace Tiled) para
// que el JSON se pueda leer a simple vista: 1 = pared, 0 = suelo.
const placeholder = '"__DATA__"';
const layers = map['layers'] as { data?: unknown }[];
const data = layers[0]!.data as number[];
layers[0]!.data = '__DATA__';
const rows: string[] = [];
for (let i = 0; i < data.length; i += GRID.columns) rows.push(data.slice(i, i + GRID.columns).join(','));
const text = JSON.stringify(map, null, 1).replace(placeholder, `[\n${rows.join(',\n')}]`);
writeFileSync(NIVEL1_REFERENCIA, `${text}\n`);
console.log(`✔ Escrito ${NIVEL1_REFERENCIA}`);

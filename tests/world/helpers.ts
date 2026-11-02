import { LEVEL_1 } from '../../src/data/levels';
import type { LevelDefinition } from '../../src/world/LevelTypes';

/** Tipo "mutable" para poder estropear una copia del nivel en las pruebas. */
type Mutable<T> = { -readonly [K in keyof T]: T[K] extends object ? Mutable<T[K]> : T[K] };

/** Copia profunda del Nivel 1 que una prueba puede modificar sin afectar a otras. */
export function cloneLevel1(): Mutable<LevelDefinition> {
  return structuredClone(LEVEL_1) as Mutable<LevelDefinition>;
}

/** Cambia un carácter del mapa ASCII en (x, y). */
export function setSymbol(
  def: Mutable<LevelDefinition>,
  x: number,
  y: number,
  symbol: string,
): void {
  const row = def.tiles[y]!;
  def.tiles[y] = row.slice(0, x) + symbol + row.slice(x + 1);
}

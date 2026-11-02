import type { CellKind, GridPoint, ParsedMap } from './LevelTypes';

/**
 * Leyenda del mapa ASCII (MAPA_NIVEL_1_APROBADO.txt).
 * Cualquier otro carácter se informa como "símbolo desconocido".
 */
export const MAP_SYMBOLS = {
  wall: '#',
  floor: '.',
  player: 'P',
  hunter: 'H',
  patrol: 'T',
  exit: 'E',
  gem: 'g',
} as const;

/**
 * Convierte las filas de texto en datos. Solo LEE: no decide si el mapa es
 * correcto (eso es trabajo de `validateLevel`). Separar "leer" de "validar"
 * hace que cada función sea pequeña y fácil de probar.
 */
export function parseMap(tiles: readonly string[]): ParsedMap {
  const cells: CellKind[][] = [];
  const players: GridPoint[] = [];
  const hunters: GridPoint[] = [];
  const patrols: GridPoint[] = [];
  const exits: GridPoint[] = [];
  const gems: GridPoint[] = [];
  const unknownSymbols: { point: GridPoint; symbol: string }[] = [];

  tiles.forEach((rowText, y) => {
    const row: CellKind[] = [];
    // Array.from separa por caracteres reales (no rompe si hay tildes o emojis).
    Array.from(rowText).forEach((symbol, x) => {
      const point = { x, y };
      // Todo lo que no es pared es suelo: las entidades están SOBRE el suelo.
      row.push(symbol === MAP_SYMBOLS.wall ? 'wall' : 'floor');
      switch (symbol) {
        case MAP_SYMBOLS.wall:
        case MAP_SYMBOLS.floor:
          break;
        case MAP_SYMBOLS.player:
          players.push(point);
          break;
        case MAP_SYMBOLS.hunter:
          hunters.push(point);
          break;
        case MAP_SYMBOLS.patrol:
          patrols.push(point);
          break;
        case MAP_SYMBOLS.exit:
          exits.push(point);
          break;
        case MAP_SYMBOLS.gem:
          gems.push(point);
          break;
        default:
          unknownSymbols.push({ point, symbol });
      }
    });
    cells.push(row);
  });

  return { cells, players, hunters, patrols, exits, gems, unknownSymbols };
}

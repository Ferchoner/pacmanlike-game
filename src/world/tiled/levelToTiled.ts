import type { GridPoint, LevelDefinition } from '../LevelTypes';
import { MAP_SYMBOLS } from '../parseMap.ts';
import {
  TILED_LAYERS,
  TILED_MAP_PROPERTIES,
  TILED_ROUTE_CLASS,
  TILED_ROUTE_PROPERTY,
  type TILED_CLASSES,
} from './tiledToLevel.ts';

/**
 * Lo CONTRARIO de `tiledToLevel`: convierte un `LevelDefinition` (p. ej. el
 * Nivel 1 aprobado) en un mapa JSON que Tiled puede abrir.
 *
 * Sirve para dos cosas:
 * 1. Generar `tiled/mapas/nivel1_referencia.json`, un ejemplo real para
 *    aprender cómo se ve un nivel en Tiled.
 * 2. La prueba de "ida y vuelta": nivel → Tiled → nivel debe dar exactamente
 *    lo mismo. Si no, alguno de los dos traductores tiene un error.
 *
 * Cada entidad se escribe como un rectángulo que ocupa su celda (se ve mejor
 * en Tiled que un punto) y cada ruta de Patrol como una polilínea que pasa
 * por el centro de las celdas.
 */

export interface LevelToTiledOptions {
  /** Ruta del tileset de paredes, relativa al archivo .json que se va a guardar. */
  readonly tilesetSource: string;
  /** Tamaño de un tile en píxeles (= una celda lógica). */
  readonly cellSize: number;
}

/** El tile 1 del tileset TEMP es la pared (firstgid = 1, primer tile). */
const WALL_GID = 1;

export function levelToTiled(def: LevelDefinition, options: LevelToTiledOptions): Record<string, unknown> {
  const size = options.cellSize;
  let nextId = 1;
  const objects: Record<string, unknown>[] = [];

  const box = (cls: keyof typeof TILED_CLASSES, cell: GridPoint, name = '', properties?: unknown[]) => {
    const object: Record<string, unknown> = {
      id: nextId++,
      name,
      type: cls,
      x: cell.x * size,
      y: cell.y * size,
      width: size,
      height: size,
      rotation: 0,
      visible: true,
    };
    if (properties) object['properties'] = properties;
    objects.push(object);
  };

  box('jugador', def.declared.player, 'Jugador');
  box('salida', def.declared.exit, 'Salida');
  def.declared.hunters.forEach((h, i) => box('hunter', h, `Hunter ${i + 1}`));
  def.declared.patrols.forEach((patrol, i) => {
    const first = patrol.waypoints[0] ?? patrol.start;
    const center = (c: number) => c * size + size / 2;
    const routeId = nextId++;
    objects.push({
      id: routeId,
      name: `Ruta Patrol ${i + 1}`,
      type: TILED_ROUTE_CLASS,
      x: center(first.x),
      y: center(first.y),
      width: 0,
      height: 0,
      rotation: 0,
      visible: true,
      // Vértices relativos a (x, y). Repetimos el primero al final para que
      // en Tiled se vea el circuito cerrado (el traductor lo quita al leer).
      polyline: [...patrol.waypoints, first].map((wp) => ({
        x: (wp.x - first.x) * size,
        y: (wp.y - first.y) * size,
      })),
    });
    box('patrol', patrol.start, `Patrol ${i + 1}`, [
      { name: TILED_ROUTE_PROPERTY, type: 'object', value: routeId },
    ]);
  });
  def.declared.gems.forEach((g) => box('gema', g));

  const data = def.tiles.flatMap((row) =>
    Array.from(row).map((symbol) => (symbol === MAP_SYMBOLS.wall ? WALL_GID : 0)),
  );

  return {
    type: 'map',
    version: '1.10',
    tiledversion: '1.11.2',
    orientation: 'orthogonal',
    renderorder: 'right-down',
    infinite: false,
    compressionlevel: -1,
    width: def.columns,
    height: def.rows,
    tilewidth: size,
    tileheight: size,
    nextlayerid: 3,
    nextobjectid: nextId,
    properties: [
      { name: TILED_MAP_PROPERTIES.id, type: 'string', value: def.id },
      { name: TILED_MAP_PROPERTIES.name, type: 'string', value: def.name },
      { name: TILED_MAP_PROPERTIES.gemsRequired, type: 'int', value: def.gemsRequired },
    ],
    tilesets: [{ firstgid: 1, source: options.tilesetSource }],
    layers: [
      {
        id: 1,
        name: TILED_LAYERS.walls,
        type: 'tilelayer',
        x: 0,
        y: 0,
        width: def.columns,
        height: def.rows,
        opacity: 1,
        visible: true,
        data,
      },
      {
        id: 2,
        name: TILED_LAYERS.entities,
        type: 'objectgroup',
        draworder: 'topdown',
        x: 0,
        y: 0,
        opacity: 1,
        visible: true,
        objects,
      },
    ],
  };
}

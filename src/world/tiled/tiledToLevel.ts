import type { GridPoint, LevelDefinition, PatrolDefinition } from '../LevelTypes';
import { MAP_SYMBOLS } from '../parseMap.ts';
import type {
  TiledMap,
  TiledObject,
  TiledObjectLayer,
  TiledPoint,
  TiledProperty,
  TiledTileLayer,
} from './TiledTypes';

/**
 * TRADUCTOR Tiled → nivel del juego (PURO, sin Phaser, con pruebas).
 *
 * Idea clave: NO creamos un segundo formato de nivel dentro del juego. Este
 * módulo convierte el JSON de Tiled en el mismo `LevelDefinition` que ya usa
 * el Nivel 1 (el mapa ASCII + las tablas de coordenadas). Así, todo lo demás
 * (validador de la Fase 2, `loadLevel`, render, enemigos...) funciona igual
 * venga el nivel de un .json escrito a mano o de Tiled.
 *
 *   Tiled (.json) ──tiledToLevel──▶ LevelDefinition ──validateLevel/loadLevel──▶ Level
 *
 * Este módulo solo TRADUCE y avisa de lo que no puede traducir (capa que
 * falta, objeto sin clase, entidad sobre una pared...). Las reglas de juego
 * (salida alcanzable, gemas suficientes, borde cerrado...) las sigue
 * comprobando `validateLevel`, en un único sitio.
 */

/** Nombres que el mapa de Tiled debe usar. La guía docs/08_niveles los explica. */
export const TILED_LAYERS = {
  /** Capa de tiles: cualquier tile pintado aquí es PARED; vacío es suelo. */
  walls: 'paredes',
  /** Capa de objetos: jugador, enemigos, salida, gemas y rutas de Patrol. */
  entities: 'entidades',
} as const;

/** Clases de objeto (campo "Class" en Tiled) y el símbolo ASCII al que equivalen. */
export const TILED_CLASSES = {
  jugador: MAP_SYMBOLS.player,
  hunter: MAP_SYMBOLS.hunter,
  patrol: MAP_SYMBOLS.patrol,
  salida: MAP_SYMBOLS.exit,
  gema: MAP_SYMBOLS.gem,
} as const;

/** Clase de la polilínea que dibuja el circuito de un Patrol. */
export const TILED_ROUTE_CLASS = 'ruta';
/** Propiedad (tipo "object") del Patrol que apunta a su polilínea `ruta`. */
export const TILED_ROUTE_PROPERTY = 'ruta';

/** Propiedades del mapa (Map → Map Properties → Custom Properties). */
export const TILED_MAP_PROPERTIES = {
  id: 'id',
  name: 'nombre',
  gemsRequired: 'gemasRequeridas',
} as const;

export type TiledIssueCode =
  | 'TILED_NOT_A_MAP'
  | 'TILED_ORIENTATION'
  | 'TILED_INFINITE'
  | 'TILED_TILE_NOT_SQUARE'
  | 'TILED_PROPERTY_MISSING'
  | 'TILED_LAYER_MISSING'
  | 'TILED_LAYER_SIZE'
  | 'TILED_LAYER_ENCODING'
  | 'TILED_OBJECT_NO_CLASS'
  | 'TILED_OBJECT_UNKNOWN_CLASS'
  | 'TILED_OBJECT_OUTSIDE'
  | 'TILED_OBJECT_ON_WALL'
  | 'TILED_OBJECT_OVERLAP'
  | 'TILED_PLAYER_MISSING'
  | 'TILED_EXIT_MISSING'
  | 'TILED_ROUTE_MISSING'
  | 'TILED_ROUTE_INVALID'
  | 'TILED_ROUTE_ROTATED';

export interface TiledIssue {
  readonly code: TiledIssueCode;
  readonly message: string;
  readonly point?: GridPoint;
}

export type TiledConversion =
  | { readonly ok: true; readonly definition: LevelDefinition }
  | { readonly ok: false; readonly issues: readonly TiledIssue[] };

export interface TiledConversionOptions {
  /** Ruta del archivo, para trazabilidad (`LevelDefinition.source`). */
  readonly source: string;
}

/** Error con todos los problemas de traducción, para mostrarlos de una vez. */
export class TiledLevelError extends Error {
  readonly issues: readonly TiledIssue[];

  constructor(source: string, issues: readonly TiledIssue[]) {
    super(`El mapa de Tiled "${source}" no se pudo traducir (${issues.length} errores).`);
    this.name = 'TiledLevelError';
    this.issues = issues;
  }
}

/** Versión que lanza error: cómoda para registrar niveles en `data/levels/index.ts`. */
export function tiledToLevel(json: unknown, options: TiledConversionOptions): LevelDefinition {
  const result = convertTiledMap(json, options);
  if (!result.ok) throw new TiledLevelError(options.source, result.issues);
  return result.definition;
}

const fmt = (p: GridPoint): string => `(${p.x},${p.y})`;

/**
 * Bits altos de un número de tile: Tiled los usa para "volteado/rotado".
 * Los quitamos para saber si hay tile o no (aunque solo nos importa si es 0).
 */
const GID_FLIP_FLAGS = 0xf0000000;

/** Versión que NO lanza: devuelve la lista de problemas (la usa `npm run level:check`). */
export function convertTiledMap(json: unknown, options: TiledConversionOptions): TiledConversion {
  const issues: TiledIssue[] = [];
  const add = (code: TiledIssueCode, message: string, point?: GridPoint) =>
    issues.push(point ? { code, message, point } : { code, message });
  const fail = (): TiledConversion => ({ ok: false, issues });

  // 1. ¿Es un mapa de Tiled que sabemos leer?
  if (!isTiledMap(json)) {
    add('TILED_NOT_A_MAP', 'El archivo no parece un mapa JSON de Tiled (faltan width, height o layers).');
    return fail();
  }
  const map = json;
  if (map.orientation !== 'orthogonal') {
    add('TILED_ORIENTATION', `La orientación es "${map.orientation}"; debe ser "orthogonal" (Ortogonal).`);
  }
  if (map.infinite) {
    add('TILED_INFINITE', 'El mapa es infinito; desmarca "Infinite" en Map Properties.');
  }
  if (map.tilewidth !== map.tileheight || map.tilewidth <= 0) {
    add(
      'TILED_TILE_NOT_SQUARE',
      `El tile mide ${map.tilewidth}×${map.tileheight} px; debe ser cuadrado (1 tile = 1 celda).`,
    );
  }

  // 2. Propiedades del mapa.
  const id = readProperty(map.properties, TILED_MAP_PROPERTIES.id, 'string');
  const name = readProperty(map.properties, TILED_MAP_PROPERTIES.name, 'string');
  const gemsRequired = readProperty(map.properties, TILED_MAP_PROPERTIES.gemsRequired, 'int');
  for (const [prop, value, kind] of [
    [TILED_MAP_PROPERTIES.id, id, 'string'],
    [TILED_MAP_PROPERTIES.name, name, 'string'],
    [TILED_MAP_PROPERTIES.gemsRequired, gemsRequired, 'int'],
  ] as const) {
    if (value === undefined) {
      add('TILED_PROPERTY_MISSING', `Falta la propiedad del mapa "${prop}" (tipo ${kind}).`);
    }
  }

  // 3. Capas.
  const wallLayer = map.layers.find(
    (l): l is TiledTileLayer => l.type === 'tilelayer' && l.name === TILED_LAYERS.walls,
  );
  const entityLayer = map.layers.find(
    (l): l is TiledObjectLayer => l.type === 'objectgroup' && l.name === TILED_LAYERS.entities,
  );
  if (!wallLayer) {
    add('TILED_LAYER_MISSING', `Falta la capa de tiles "${TILED_LAYERS.walls}" (fuera de cualquier grupo).`);
  }
  if (!entityLayer) {
    add('TILED_LAYER_MISSING', `Falta la capa de objetos "${TILED_LAYERS.entities}" (fuera de cualquier grupo).`);
  }
  if (!wallLayer || !entityLayer || issues.length > 0) return fail();

  const columns = map.width;
  const rows = map.height;
  if (typeof wallLayer.data === 'string' || (wallLayer.encoding && wallLayer.encoding !== 'csv')) {
    add(
      'TILED_LAYER_ENCODING',
      `La capa "${TILED_LAYERS.walls}" está comprimida; en Map Properties pon "Tile Layer Format" = CSV.`,
    );
    return fail();
  }
  if (wallLayer.width !== columns || wallLayer.height !== rows || wallLayer.data.length !== columns * rows) {
    add(
      'TILED_LAYER_SIZE',
      `La capa "${TILED_LAYERS.walls}" no mide ${columns}×${rows} tiles como el mapa.`,
    );
    return fail();
  }

  // 4. Paredes → cuadrícula de símbolos ('#' o '.').
  const grid: string[][] = [];
  for (let y = 0; y < rows; y++) {
    const row: string[] = [];
    for (let x = 0; x < columns; x++) {
      const gid = (wallLayer.data[y * columns + x] ?? 0) & ~GID_FLIP_FLAGS;
      row.push(gid !== 0 ? MAP_SYMBOLS.wall : MAP_SYMBOLS.floor);
    }
    grid.push(row);
  }

  // 5. Objetos → entidades. Las polilíneas `ruta` se guardan aparte por id.
  const size = map.tilewidth;
  const routes = new Map<number, TiledObject>();
  const entities: { object: TiledObject; kind: keyof typeof TILED_CLASSES; cell: GridPoint }[] = [];
  for (const object of entityLayer.objects) {
    const cls = objectClass(object);
    const label = describe(object);
    if (cls === TILED_ROUTE_CLASS) {
      routes.set(object.id, object);
      continue;
    }
    if (!cls) {
      add('TILED_OBJECT_NO_CLASS', `${label} no tiene clase (Class). Usa: ${classList()}.`);
      continue;
    }
    if (!isEntityClass(cls)) {
      add('TILED_OBJECT_UNKNOWN_CLASS', `${label} tiene la clase "${cls}", que no existe. Usa: ${classList()}.`);
      continue;
    }
    const cell = objectCell(object, size);
    if (cell.x < 0 || cell.y < 0 || cell.x >= columns || cell.y >= rows) {
      add('TILED_OBJECT_OUTSIDE', `${label} (${cls}) está fuera del mapa.`, cell);
      continue;
    }
    entities.push({ object, kind: cls, cell });
  }

  // 6. Colocar cada entidad en su celda del ASCII.
  const occupiedBy = new Map<string, string>();
  for (const { object, kind, cell } of entities) {
    const key = `${cell.x},${cell.y}`;
    const label = `${describe(object)} (${kind})`;
    if (grid[cell.y]![cell.x] === MAP_SYMBOLS.wall) {
      add('TILED_OBJECT_ON_WALL', `${label} está sobre una pared en ${fmt(cell)}.`, cell);
      continue;
    }
    const previous = occupiedBy.get(key);
    if (previous) {
      add('TILED_OBJECT_OVERLAP', `${label} comparte la celda ${fmt(cell)} con ${previous}.`, cell);
      continue;
    }
    occupiedBy.set(key, label);
    grid[cell.y]![cell.x] = TILED_CLASSES[kind];
  }

  // 7. Tablas declaradas (en el orden de los objetos en Tiled).
  const cellsOf = (kind: keyof typeof TILED_CLASSES) =>
    entities.filter((e) => e.kind === kind).map((e) => e.cell);
  const player = cellsOf('jugador')[0];
  const exit = cellsOf('salida')[0];
  if (!player) add('TILED_PLAYER_MISSING', 'No hay ningún objeto de clase "jugador".');
  if (!exit) add('TILED_EXIT_MISSING', 'No hay ningún objeto de clase "salida".');

  const patrols: PatrolDefinition[] = [];
  for (const { object, kind, cell } of entities) {
    if (kind !== 'patrol') continue;
    const label = describe(object);
    const routeId = readProperty(object.properties, TILED_ROUTE_PROPERTY, 'object');
    const route = typeof routeId === 'number' ? routes.get(routeId) : undefined;
    if (!route) {
      add(
        'TILED_ROUTE_MISSING',
        `${label} (patrol) necesita la propiedad "${TILED_ROUTE_PROPERTY}" (tipo object) apuntando a una polilínea de clase "${TILED_ROUTE_CLASS}".`,
        cell,
      );
      continue;
    }
    const vertices = route.polyline ?? route.polygon;
    if (!vertices || vertices.length < 2) {
      add(
        'TILED_ROUTE_INVALID',
        `La ruta de ${label} (${describe(route)}) debe ser una polilínea o polígono con al menos 2 vértices.`,
        cell,
      );
      continue;
    }
    // Tiled guarda los vértices SIN girar y el ángulo aparte: lo que se ve en pantalla no es lo
    // que hay en el archivo. En lugar de aplicar el giro en silencio, se pide dejarlo en 0.
    if (route.rotation !== undefined && route.rotation !== 0) {
      add(
        'TILED_ROUTE_ROTATED',
        `La ruta de ${label} (${describe(route)}) está girada ${route.rotation}°. Tiled guarda sus puntos sin girar, así que el juego no la vería donde tú la ves. Pon Rotation = 0 y vuelve a dibujar los puntos.`,
        cell,
      );
      continue;
    }
    patrols.push({ start: cell, waypoints: routeWaypoints(route, vertices, size) });
  }

  if (issues.length > 0 || !player || !exit || id === undefined || name === undefined || gemsRequired === undefined) {
    return fail();
  }

  return {
    ok: true,
    definition: {
      id,
      name,
      blueprintVersion: 'tiled',
      source: options.source,
      columns,
      rows,
      gemsRequired,
      tiles: grid.map((row) => row.join('')),
      declared: {
        player,
        hunters: cellsOf('hunter'),
        patrols,
        exit,
        gems: cellsOf('gema'),
      },
    },
  };
}

// ── Utilidades ──────────────────────────────────────────────────────────────

function isTiledMap(json: unknown): json is TiledMap {
  if (typeof json !== 'object' || json === null) return false;
  const m = json as Record<string, unknown>;
  return (
    typeof m['width'] === 'number' &&
    typeof m['height'] === 'number' &&
    typeof m['tilewidth'] === 'number' &&
    typeof m['tileheight'] === 'number' &&
    Array.isArray(m['layers'])
  );
}

/** Tiled 1.9 exporta `class`; 1.8 y 1.10+ exportan `type`. Aceptamos ambos. */
function objectClass(object: TiledObject): string {
  return (object.type || object.class || '').trim().toLowerCase();
}

function isEntityClass(cls: string): cls is keyof typeof TILED_CLASSES {
  return Object.hasOwn(TILED_CLASSES, cls);
}

function classList(): string {
  return [...Object.keys(TILED_CLASSES), TILED_ROUTE_CLASS].join(', ');
}

/** "Objeto 7" o "Objeto 7 «Hunter norte»": cómo lo encuentras en el panel de Tiled. */
function describe(object: TiledObject): string {
  return object.name ? `Objeto ${object.id} «${object.name}»` : `Objeto ${object.id}`;
}

type PropertyKind = 'string' | 'int' | 'object';
type PropertyValue<K extends PropertyKind> = K extends 'string' ? string : number;

function readProperty<K extends PropertyKind>(
  properties: readonly TiledProperty[] | undefined,
  name: string,
  kind: K,
): PropertyValue<K> | undefined {
  const prop = properties?.find((p) => p.name === name);
  if (!prop) return undefined;
  if (kind === 'string') {
    return typeof prop.value === 'string' && prop.value.trim() !== ''
      ? (prop.value as PropertyValue<K>)
      : undefined;
  }
  return typeof prop.value === 'number' && Number.isInteger(prop.value)
    ? (prop.value as PropertyValue<K>)
    : undefined;
}

/** Píxel → celda. El pequeño margen evita que 63.9999 (redondeo de Tiled) caiga en la celda 1. */
function pixelToCell(px: number, size: number): number {
  return Math.floor(px / size + 1e-6);
}

/**
 * Celda de un objeto según su forma:
 * - punto: su (x, y);
 * - objeto-tile (tiene `gid`): Tiled guarda la esquina INFERIOR izquierda, usamos su centro;
 * - rectángulo/elipse: su centro.
 * Usar el centro hace que "un rectángulo que ocupa la celda" caiga en esa celda.
 */
export function objectCell(object: TiledObject, size: number): GridPoint {
  const w = object.width ?? 0;
  const h = object.height ?? 0;
  if (object.point || (w === 0 && h === 0)) {
    return { x: pixelToCell(object.x, size), y: pixelToCell(object.y, size) };
  }
  const centerY = object.gid !== undefined ? object.y - h / 2 : object.y + h / 2;
  return { x: pixelToCell(object.x + w / 2, size), y: pixelToCell(centerY, size) };
}

/** Vértices de la polilínea (relativos al objeto) → celdas, quitando repetidos seguidos. */
function routeWaypoints(route: TiledObject, vertices: readonly TiledPoint[], size: number): GridPoint[] {
  const cells: GridPoint[] = [];
  for (const v of vertices) {
    const cell = { x: pixelToCell(route.x + v.x, size), y: pixelToCell(route.y + v.y, size) };
    const last = cells[cells.length - 1];
    if (!last || last.x !== cell.x || last.y !== cell.y) cells.push(cell);
  }
  // Si el polígono/polilínea se cierra sobre el primer vértice, no lo repetimos:
  // el Patrol ya vuelve del último waypoint al primero.
  const first = cells[0];
  const last = cells[cells.length - 1];
  if (cells.length > 2 && first && last && first.x === last.x && first.y === last.y) cells.pop();
  return cells;
}

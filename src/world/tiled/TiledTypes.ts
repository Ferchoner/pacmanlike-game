/**
 * Tipos MÍNIMOS del formato JSON que exporta Tiled (https://www.mapeditor.org).
 *
 * Solo declaramos los campos que el juego lee. Tiled escribe muchos más
 * (versión, colores, orden de dibujo...) y los ignoramos sin problema.
 * Referencia oficial: https://doc.mapeditor.org/en/stable/reference/json-map-format/
 *
 * Unidades: en Tiled TODO está en PÍXELES (posición de objetos, tamaño del
 * tile). El juego trabaja en CELDAS. La conversión la hace `tiledToLevel.ts`.
 */

/** Una propiedad personalizada ("Custom Properties" en el panel de Tiled). */
export interface TiledProperty {
  readonly name: string;
  /** "string", "int", "float", "bool", "object" (referencia a otro objeto)... */
  readonly type: string;
  readonly value: unknown;
}

export interface TiledPoint {
  readonly x: number;
  readonly y: number;
}

/** Un objeto de una capa de objetos: punto, rectángulo, polilínea, tile... */
export interface TiledObject {
  /** Identificador único dentro del mapa (lo usan las referencias "object"). */
  readonly id: number;
  readonly name?: string;
  /** La "clase" del objeto. Tiled 1.9 la llamó `class`; 1.10+ volvió a `type`. */
  readonly type?: string;
  readonly class?: string;
  readonly x: number;
  readonly y: number;
  readonly width?: number;
  readonly height?: number;
  readonly point?: boolean;
  /** Si existe, es un objeto-tile: su (x, y) es la esquina INFERIOR izquierda. */
  readonly gid?: number;
  /** Vértices relativos a (x, y). */
  readonly polyline?: readonly TiledPoint[];
  readonly polygon?: readonly TiledPoint[];
  readonly properties?: readonly TiledProperty[];
}

export interface TiledTileLayer {
  readonly type: 'tilelayer';
  readonly name: string;
  readonly width: number;
  readonly height: number;
  /** Un número por celda, fila por fila. 0 = vacío. Solo formato CSV (array). */
  readonly data: readonly number[] | string;
  readonly encoding?: string;
}

export interface TiledObjectLayer {
  readonly type: 'objectgroup';
  readonly name: string;
  readonly objects: readonly TiledObject[];
}

export type TiledLayer = TiledTileLayer | TiledObjectLayer | { readonly type: string; readonly name: string };

export interface TiledMap {
  readonly type?: string;
  readonly orientation: string;
  readonly infinite?: boolean;
  /** Ancho y alto del mapa en TILES (no en píxeles). */
  readonly width: number;
  readonly height: number;
  /** Tamaño de un tile en píxeles. */
  readonly tilewidth: number;
  readonly tileheight: number;
  readonly layers: readonly TiledLayer[];
  readonly properties?: readonly TiledProperty[];
  readonly tilesets?: readonly unknown[];
}

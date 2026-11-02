/**
 * Tipos del mundo (nivel). Sin Phaser: así el parser y el validador se pueden
 * probar con Vitest sin abrir un navegador.
 *
 * Convención de coordenadas (la misma de los docs): (x, y) = (columna, fila),
 * con origen (0, 0) en la esquina superior izquierda. Son celdas lógicas de
 * 32 px, NO píxeles. Para pasar a píxeles se usa `gridMath.ts`.
 */

/** Una celda de la cuadrícula. */
export interface GridPoint {
  readonly x: number;
  readonly y: number;
}

/** Un Patrol: dónde aparece y el circuito que recorre (se repite en bucle). */
export interface PatrolDefinition {
  readonly start: GridPoint;
  readonly waypoints: readonly GridPoint[];
}

/**
 * Lo que está escrito en el archivo de datos del nivel (`src/data/levels/*.json`).
 *
 * Tiene dos partes que se comprueban entre sí:
 * - `tiles`: el mapa ASCII aprobado, fila por fila, copiado tal cual.
 * - `declared`: las tablas de coordenadas de los documentos (CONTEXTO_MAESTRO).
 * Si las dos no dicen lo mismo, el validador lo informa; nunca lo corrige.
 */
export interface LevelDefinition {
  readonly id: string;
  readonly name: string;
  readonly blueprintVersion: string;
  /** Documento del que se copió el mapa (para trazabilidad). */
  readonly source: string;
  readonly columns: number;
  readonly rows: number;
  readonly gemsRequired: number;
  readonly tiles: readonly string[];
  readonly declared: {
    readonly player: GridPoint;
    readonly hunters: readonly GridPoint[];
    readonly patrols: readonly PatrolDefinition[];
    readonly exit: GridPoint;
    readonly gems: readonly GridPoint[];
  };
}

/** Qué hay "debajo" de cada celda. Las entidades siempre están sobre suelo. */
export type CellKind = 'wall' | 'floor';

/** Resultado de leer el ASCII: dónde está cada símbolo. Todavía sin validar. */
export interface ParsedMap {
  /** `cells[y][x]`: primero la fila, luego la columna (así se lee el texto). */
  readonly cells: readonly (readonly CellKind[])[];
  readonly players: readonly GridPoint[];
  readonly hunters: readonly GridPoint[];
  readonly patrols: readonly GridPoint[];
  readonly exits: readonly GridPoint[];
  readonly gems: readonly GridPoint[];
  readonly unknownSymbols: readonly { readonly point: GridPoint; readonly symbol: string }[];
}

/**
 * Un nivel ya validado y listo para usar por el resto del juego
 * (render, jugador, enemigos, recolección...).
 */
export interface Level {
  readonly id: string;
  readonly name: string;
  readonly columns: number;
  readonly rows: number;
  readonly gemsRequired: number;
  readonly cells: readonly (readonly CellKind[])[];
  readonly playerStart: GridPoint;
  readonly hunters: readonly GridPoint[];
  readonly patrols: readonly PatrolDefinition[];
  readonly exit: GridPoint;
  readonly gems: readonly GridPoint[];
}

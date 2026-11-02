import type { CenteredBox } from '../systems/overlap';
import { DistanceField } from '../world/distanceField';
import { samePoint } from '../world/gridSearch';
import type { CellKind, GridPoint, PatrolDefinition } from '../world/LevelTypes';
import { GridWalker } from './GridWalker';

export interface PatrolConfig {
  /** px/s */
  readonly speed: number;
  /** Lado del cuerpo de colisión, px. */
  readonly bodySize: number;
  readonly cellSize: number;
}

/**
 * Patrol: recorre sus waypoints en bucle y NO persigue (GDD, MVP).
 *
 * Cada waypoint tiene su propio mapa de distancias, calculado una sola vez al
 * crear el Patrol (el mapa no cambia). Para ir al siguiente waypoint basta con
 * "bajar" por su mapa. En el Nivel 1 los tramos son rectos (lo comprueba el
 * validador), pero así también funcionaría si un tramo tuviera una curva.
 */
export class Patrol {
  readonly kind = 'patrol' as const;
  private readonly walker: GridWalker;
  private readonly fields: readonly DistanceField[];
  /** Índice del waypoint al que se dirige ahora. */
  private targetIndex: number;

  constructor(
    def: PatrolDefinition,
    cells: readonly (readonly CellKind[])[],
    private readonly config: PatrolConfig,
  ) {
    this.walker = new GridWalker(def.start, config.speed, config.cellSize);
    this.fields = def.waypoints.map((wp) => new DistanceField(cells, wp));
    this.targetIndex = firstTargetIndex(def);
  }

  get x(): number {
    return this.walker.x;
  }
  get y(): number {
    return this.walker.y;
  }
  get facing() {
    return this.walker.facing;
  }
  get moving(): boolean {
    return this.walker.moving;
  }
  get bodyHalf(): number {
    return this.config.bodySize / 2;
  }
  get body(): CenteredBox {
    return { x: this.x, y: this.y, half: this.bodyHalf };
  }
  /** Waypoint al que va ahora (útil para depurar y para las pruebas). */
  get currentWaypoint(): GridPoint {
    return this.fields[this.targetIndex]!.target;
  }

  update(dtSeconds: number): void {
    this.walker.advance(dtSeconds, (cell) => this.chooseNext(cell));
  }

  private chooseNext(cell: GridPoint): GridPoint | null {
    const count = this.fields.length;
    // Al llegar a un waypoint, el objetivo pasa al siguiente (y del último al primero).
    for (let i = 0; i < count && samePoint(cell, this.currentWaypoint); i++) {
      this.targetIndex = (this.targetIndex + 1) % count;
    }
    return this.fields[this.targetIndex]?.nextStep(cell) ?? null;
  }
}

/**
 * ¿Hacia qué waypoint sale primero? Si el inicio está sobre un tramo A → B,
 * va hacia B: así sigue el sentido del circuito sin dar media vuelta.
 * En el Nivel 1: empieza en (18,12), sobre (17,12) → (21,12), y va a (21,12).
 */
export function firstTargetIndex(def: PatrolDefinition): number {
  const points = def.waypoints;
  for (let i = 0; i < points.length; i++) {
    const from = points[i]!;
    const to = points[(i + 1) % points.length]!;
    if (onStraightSegment(def.start, from, to)) {
      return samePoint(def.start, to) ? (i + 2) % points.length : (i + 1) % points.length;
    }
  }
  return 0; // fuera del circuito: primero va al waypoint 0
}

function onStraightSegment(p: GridPoint, a: GridPoint, b: GridPoint): boolean {
  const between = (v: number, m: number, n: number) => v >= Math.min(m, n) && v <= Math.max(m, n);
  if (a.y === b.y) return p.y === a.y && between(p.x, a.x, b.x);
  if (a.x === b.x) return p.x === a.x && between(p.y, a.y, b.y);
  return false;
}

import { cellCenter } from '../world/gridMath';
import type { GridPoint } from '../world/LevelTypes';
import type { Facing } from '../player/Player';

/**
 * Decide la siguiente celda VECINA a la que ir desde `cell`, o `null` para
 * quedarse quieto. La llama el caminante cada vez que llega al centro de una
 * celda: ahí, y solo ahí, el enemigo "piensa".
 */
export type ChooseNextCell = (cell: GridPoint) => GridPoint | null;

/**
 * Movimiento de celda en celda (como en los laberintos arcade clásicos).
 *
 * El jugador se mueve libre (continuo) y choca con las paredes; los enemigos
 * no lo necesitan: van de centro a centro de celdas de suelo vecinas. Como
 * nunca eligen una pared, nunca pueden chocar con una ni atascarse en una
 * esquina, y sus decisiones (girar, perseguir) son fáciles de razonar y probar.
 *
 * Sin Phaser: solo números. La vista lee `x`, `y`, `facing` y `moving`.
 */
export class GridWalker {
  /** Centro del cuerpo, en px del mundo. */
  x: number;
  y: number;
  /** Última celda cuyo centro alcanzó (de donde sale si está en marcha). */
  cell: GridPoint;
  /** Celda a la que se dirige, o `null` si está parado en el centro de `cell`. */
  target: GridPoint | null = null;
  facing: Facing = 'down';
  /** true si en el último `advance` se desplazó. */
  moving = false;
  /** Segundos que le quedan inmóvil (0 = libre). */
  private frozenLeft = 0;

  constructor(
    start: GridPoint,
    private readonly speed: number,
    private readonly cellSize: number,
  ) {
    this.cell = start;
    const c = cellCenter(start, cellSize);
    this.x = c.x;
    this.y = c.y;
  }

  /**
   * Avanza `speed × dt` px. Si llega a un centro y le sobra recorrido, pregunta
   * la siguiente celda y sigue con lo que sobra: así no hay un "tirón" de un
   * fotograma parado en cada centro, y la rapidez es exactamente `speed`.
   */
  advance(dtSeconds: number, chooseNext: ChooseNextCell): void {
    if (this.frozenLeft > 0) {
      this.frozenLeft = Math.max(0, this.frozenLeft - dtSeconds);
      this.moving = false;
      return;
    }
    let budget = this.speed * dtSeconds;
    const startX = this.x;
    const startY = this.y;
    // Tope de seguridad: con dt acotado nunca se cruzan más de unas pocas celdas.
    for (let guard = 0; guard < 8 && budget > 0; guard++) {
      if (!this.target) {
        const next = chooseNext(this.cell);
        if (!next || !isNeighbour(this.cell, next)) break;
        this.target = next;
        this.facing = facingTowards(this.cell, next);
      }
      const goal = cellCenter(this.target, this.cellSize);
      const remaining = Math.abs(goal.x - this.x) + Math.abs(goal.y - this.y);
      if (budget < remaining) {
        // No llega este fotograma: avanza en línea recta hacia el centro.
        this.x += Math.sign(goal.x - this.x) * budget;
        this.y += Math.sign(goal.y - this.y) * budget;
        budget = 0;
      } else {
        // Llega (y quizá le sobra): se coloca EXACTO en el centro.
        this.x = goal.x;
        this.y = goal.y;
        this.cell = this.target;
        this.target = null;
        budget -= remaining;
      }
    }
    this.moving = this.x !== startX || this.y !== startY;
  }

  /**
   * Se queda inmóvil `seconds` (tras golpear al jugador). Si estaba entre dos
   * celdas, se queda en su tramo y al terminar sigue desde ahí: nunca sale de
   * la línea entre centros, así que no se descoloca de la rejilla.
   */
  freeze(seconds: number): void {
    this.frozenLeft = Math.max(this.frozenLeft, seconds);
  }

  get isFrozen(): boolean {
    return this.frozenLeft > 0;
  }
}

/** Solo se permite ir a una de las 4 celdas pegadas (nunca saltar ni ir en diagonal). */
function isNeighbour(a: GridPoint, b: GridPoint): boolean {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
}

function facingTowards(from: GridPoint, to: GridPoint): Facing {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  return to.y < from.y ? 'up' : 'down';
}

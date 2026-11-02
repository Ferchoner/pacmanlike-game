import type { GridPoint } from '../world/LevelTypes';
import { cellCenter } from '../world/gridMath';
import { boxesOverlap, type CenteredBox } from './overlap';

/**
 * Sistema de RECOLECCIÓN de gemas (reglas, sin dibujar).
 *
 * Cada gema tiene una "zona de recogida": un cuadrado centrado en su celda.
 * Si el cuerpo del jugador la solapa, la gema se recoge. Una gema recogida
 * queda marcada para siempre en esta run: no se puede contar dos veces.
 *
 * Las gemas se identifican por su ÍNDICE en la lista del nivel. Así la vista
 * (`presentation/`) sabe exactamente qué dibujo ocultar sin conocer las reglas.
 */
export class GemCollection {
  private readonly collected: boolean[];
  private readonly zones: readonly CenteredBox[];
  private collectedCount = 0;

  constructor(
    gems: readonly GridPoint[],
    /** Lado de la zona de recogida, px. */
    pickupSize: number,
    cellSize: number,
  ) {
    this.zones = gems.map((g) => ({ ...cellCenter(g, cellSize), half: pickupSize / 2 }));
    this.collected = gems.map(() => false);
  }

  get total(): number {
    return this.zones.length;
  }

  get count(): number {
    return this.collectedCount;
  }

  isCollected(index: number): boolean {
    return this.collected[index] ?? false;
  }

  /**
   * Recoge todas las gemas que toca el cuerpo y devuelve los índices de las
   * que se recogieron AHORA (las ya recogidas se ignoran). Normalmente la
   * lista está vacía o tiene una; podría tener dos si estuvieran pegadas.
   */
  collectTouching(body: CenteredBox): number[] {
    const picked: number[] = [];
    this.zones.forEach((zone, i) => {
      if (this.collected[i] || !boxesOverlap(body, zone)) return;
      this.collected[i] = true;
      this.collectedCount++;
      picked.push(i);
    });
    return picked;
  }
}

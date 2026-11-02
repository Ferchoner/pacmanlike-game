import type { GridPoint, Level } from '../world/LevelTypes';
import { cellCenter } from '../world/gridMath';
import { GemCollection } from './gemCollection';
import { boxesOverlap, type CenteredBox } from './overlap';

/**
 * Sistema de PROGRESIÓN del nivel: gemas → puerta → nivel completado.
 *
 * Es una pequeña "máquina de estados" de la puerta:
 *
 *   cerrada ──(gemas ≥ requeridas)──▶ abierta ──(el jugador la toca)──▶ completado
 *
 * Reglas aprobadas (CONTEXTO_MAESTRO / GDD):
 * - Cada gema cuenta una sola vez.
 * - Al llegar a `gemsRequired` (20) la puerta se abre, pero eso NO termina el nivel.
 * - El nivel termina solo cuando el jugador toca la puerta ABIERTA.
 * - Tocar la puerta cerrada no hace nada (y no bloquea el paso: es una celda de suelo).
 *
 * En vez de llamar a la vista o al HUD directamente, `update` DEVUELVE una
 * lista de eventos ("se recogió la gema 3", "se abrió la puerta"...). La
 * escena decide qué hacer con ellos (ocultar el dibujo, actualizar el HUD,
 * más adelante reproducir un SFX). Así las reglas no dependen de Phaser.
 */
export type ProgressEvent =
  | { readonly type: 'gemCollected'; readonly index: number; readonly count: number }
  | { readonly type: 'exitOpened' }
  | { readonly type: 'levelCompleted' };

export type ExitState = 'closed' | 'open';

export interface LevelProgressConfig {
  /** Lado de la zona de recogida de cada gema, px. */
  readonly gemPickupSize: number;
  /** Lado de la zona de la puerta que hay que tocar, px. */
  readonly exitTriggerSize: number;
  readonly cellSize: number;
}

export class LevelProgress {
  readonly gems: GemCollection;
  readonly gemsRequired: number;
  readonly exitCell: GridPoint;
  private readonly exitZone: CenteredBox;
  private exit: ExitState = 'closed';
  private completed = false;

  constructor(level: Level, config: LevelProgressConfig) {
    this.gems = new GemCollection(level.gems, config.gemPickupSize, config.cellSize);
    this.gemsRequired = level.gemsRequired;
    this.exitCell = level.exit;
    this.exitZone = { ...cellCenter(level.exit, config.cellSize), half: config.exitTriggerSize / 2 };
  }

  get exitState(): ExitState {
    return this.exit;
  }

  get isCompleted(): boolean {
    return this.completed;
  }

  /** Se llama una vez por fotograma con el cuerpo del jugador ya movido. */
  update(playerBody: CenteredBox): ProgressEvent[] {
    if (this.completed) return []; // estado final: ya no cambia nada
    const events: ProgressEvent[] = [];

    for (const index of this.gems.collectTouching(playerBody)) {
      events.push({ type: 'gemCollected', index, count: this.gems.count });
    }

    if (this.exit === 'closed' && this.gems.count >= this.gemsRequired) {
      this.exit = 'open';
      events.push({ type: 'exitOpened' });
    }

    // Se comprueba DESPUÉS de abrir: si la gema 20 estuviera pegada a la
    // puerta, recogerla y tocar la puerta en el mismo fotograma completa el nivel.
    if (this.exit === 'open' && boxesOverlap(playerBody, this.exitZone)) {
      this.completed = true;
      events.push({ type: 'levelCompleted' });
    }
    return events;
  }
}

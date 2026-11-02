import type { CellKind } from '../world/LevelTypes';

/**
 * Sistema de colisión con paredes sobre la cuadrícula del nivel.
 *
 * Idea clave: en vez de usar un motor de física, aprovechamos que las paredes
 * son celdas de una rejilla. Un cuerpo es un cuadrado (centro + mitad del lado)
 * y basta con mirar qué celdas toca para saber si choca. Es puro TypeScript:
 * se prueba con Vitest y lo podrán reutilizar los enemigos (Fase 5).
 */

/** Las paredes del nivel, tal como las entrega `world/`. */
export interface WallGrid {
  readonly cells: readonly (readonly CellKind[])[];
  readonly cellSize: number;
}

export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

export interface MoveResult {
  readonly x: number;
  readonly y: number;
  /** true si una pared frenó el movimiento en ese eje. */
  readonly blockedX: boolean;
  readonly blockedY: boolean;
}

/** Fuera del mapa cuenta como pared: así nadie se escapa aunque falte el borde. */
export function isWall(grid: WallGrid, column: number, row: number): boolean {
  const cell = grid.cells[row]?.[column];
  return cell === undefined || cell === 'wall';
}

/**
 * ¿Un cuadrado con centro (x, y) y mitad `half` toca alguna pared?
 *
 * El cuadrado ocupa [x - half, x + half) en cada eje (intervalo semiabierto):
 * si su borde derecho cae EXACTAMENTE en el borde de una pared, la está
 * tocando pero no la "pisa". Así podemos apoyarlo pegado a la pared.
 */
export function overlapsWall(grid: WallGrid, x: number, y: number, half: number): boolean {
  const size = grid.cellSize;
  const firstCol = Math.floor((x - half) / size);
  const lastCol = Math.ceil((x + half) / size) - 1;
  const firstRow = Math.floor((y - half) / size);
  const lastRow = Math.ceil((y + half) / size) - 1;
  for (let row = firstRow; row <= lastRow; row++) {
    for (let col = firstCol; col <= lastCol; col++) {
      if (isWall(grid, col, row)) return true;
    }
  }
  return false;
}

/**
 * Mueve el cuerpo `delta` px, primero en X y luego en Y (ejes SEPARADOS).
 *
 * ¿Por qué por separado? Si empujas en diagonal contra una pared, el eje que
 * choca se frena y el otro sigue: el jugador "se desliza" pegado al muro en
 * vez de quedarse pegado. Es el truco más usado en juegos top-down.
 *
 * Si el paso es grande, se parte en trozos de media celda como máximo para
 * que un cuerpo rápido nunca atraviese una pared ("tunneling").
 */
export function moveAndCollide(
  grid: WallGrid,
  position: Vec2,
  delta: Vec2,
  half: number,
  cornerAssistPx = 0,
): MoveResult {
  const maxStep = grid.cellSize / 2;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.y)) / maxStep));
  let x = position.x;
  let y = position.y;
  let blockedX = false;
  let blockedY = false;

  for (let i = 0; i < steps; i++) {
    const stepX = delta.x / steps;
    const stepY = delta.y / steps;

    const mx = moveAxis(grid, x, y, stepX, half, 'x');
    x = mx.value;
    const my = moveAxis(grid, x, y, stepY, half, 'y');
    y = my.value;

    // Asistencia en esquinas: solo si se empuja en UN eje y ese eje chocó.
    if (mx.blocked && stepY === 0) y = assistTowardLane(grid, x, y, stepX, half, 'x', cornerAssistPx);
    if (my.blocked && stepX === 0) x = assistTowardLane(grid, x, y, stepY, half, 'y', cornerAssistPx);

    blockedX ||= mx.blocked;
    blockedY ||= my.blocked;
  }
  return { x, y, blockedX, blockedY };
}

/**
 * Mueve en un solo eje. Si el destino pisa una pared, coloca el cuerpo
 * justo pegado a ella (en vez de no moverlo nada), para que no quede un
 * hueco de unos píxeles entre el jugador y el muro.
 */
function moveAxis(
  grid: WallGrid,
  x: number,
  y: number,
  step: number,
  half: number,
  axis: 'x' | 'y',
): { value: number; blocked: boolean } {
  const current = axis === 'x' ? x : y;
  if (step === 0) return { value: current, blocked: false };

  const target = current + step;
  const hits = axis === 'x' ? overlapsWall(grid, target, y, half) : overlapsWall(grid, x, target, half);
  if (!hits) return { value: target, blocked: false };

  const size = grid.cellSize;
  // Celda donde entró el borde delantero → apoyar el borde en su límite.
  const snapped =
    step > 0
      ? (Math.ceil((target + half) / size) - 1) * size - half
      : (Math.floor((target - half) / size) + 1) * size + half;
  // Nunca retroceder respecto a donde ya estaba.
  const value = step > 0 ? Math.max(current, snapped) : Math.min(current, snapped);
  return { value, blocked: true };
}

/**
 * Si el cuerpo está bloqueado empujando en `axis`, pero en su carril (la
 * fila o columna donde está su centro) la celda de delante está libre, lo
 * acerca al centro del carril. Se mueve tanto como el paso pedido, así la
 * rapidez total no cambia. Devuelve la nueva coordenada del OTRO eje.
 */
function assistTowardLane(
  grid: WallGrid,
  x: number,
  y: number,
  step: number,
  half: number,
  axis: 'x' | 'y',
  assistPx: number,
): number {
  const other = axis === 'x' ? y : x;
  if (assistPx <= 0) return other;

  const size = grid.cellSize;
  const lane = Math.floor(other / size);
  const laneCenter = lane * size + size / 2;
  const offset = laneCenter - other;
  if (offset === 0 || Math.abs(offset) > assistPx) return other;

  const along = axis === 'x' ? x : y;
  const ahead = step > 0 ? Math.floor((along + half) / size) : Math.ceil((along - half) / size) - 1;
  const aheadFree = axis === 'x' ? !isWall(grid, ahead, lane) : !isWall(grid, lane, ahead);
  if (!aheadFree) return other;

  const nudge = Math.sign(offset) * Math.min(Math.abs(step), Math.abs(offset));
  // El empujón también respeta las paredes.
  const moved = axis === 'x' ? moveAxis(grid, x, y, nudge, half, 'y') : moveAxis(grid, x, y, nudge, half, 'x');
  return moved.value;
}

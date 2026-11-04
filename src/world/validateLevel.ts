import type { GridPoint, LevelDefinition, ParsedMap, PatrolDefinition } from './LevelTypes';
import { parseMap } from './parseMap.ts';
import { isWalkable, pointKey, reachableFrom, samePoint } from './gridSearch.ts';

/**
 * - `error`: el nivel no se puede jugar o los datos se contradicen. Bloquea la carga.
 * - `warning`: se puede jugar, pero conviene que una persona lo revise.
 */
export type IssueSeverity = 'error' | 'warning';

export type IssueCode =
  | 'DIMENSIONS'
  | 'UNKNOWN_SYMBOL'
  | 'BORDER_OPEN'
  | 'PLAYER_COUNT'
  | 'PLAYER_MISMATCH'
  | 'EXIT_COUNT'
  | 'EXIT_MISMATCH'
  | 'HUNTER_MISMATCH'
  | 'PATROL_MISMATCH'
  | 'GEM_NOT_IN_MAP'
  | 'GEM_NOT_DECLARED'
  | 'GEM_DUPLICATED'
  | 'GEMS_REQUIRED_INVALID'
  | 'WAYPOINT_BLOCKED'
  | 'WAYPOINT_PATH_NOT_STRAIGHT'
  | 'WAYPOINT_PATH_BLOCKED'
  | 'PATROL_START_OFF_ROUTE'
  | 'EXIT_UNREACHABLE'
  | 'GEMS_UNREACHABLE'
  | 'NOT_ENOUGH_REACHABLE_GEMS'
  | 'ENEMY_UNREACHABLE'
  | 'ISOLATED_FLOOR';

export interface LevelIssue {
  readonly severity: IssueSeverity;
  readonly code: IssueCode;
  readonly message: string;
  readonly point?: GridPoint;
}

/** Números útiles para el informe (los mismos que en la auditoría de la Fase 0). */
export interface LevelStats {
  readonly floorCells: number;
  readonly reachableCells: number;
  readonly totalGems: number;
  readonly reachableGems: number;
}

export interface ValidationReport {
  /** `true` si no hay ningún `error` (los `warning` no bloquean). */
  readonly ok: boolean;
  readonly issues: readonly LevelIssue[];
  readonly stats: LevelStats | null;
  readonly map: ParsedMap;
}

const fmt = (p: GridPoint): string => `(${p.x},${p.y})`;

/**
 * Valida un nivel SIN modificarlo. Devuelve una lista de problemas; quien llama
 * decide qué hacer (la regla del proyecto es: informar, nunca corregir en silencio).
 *
 * El orden de las comprobaciones importa: si las dimensiones están mal, el resto
 * de comprobaciones leería celdas que no existen, así que se para ahí.
 */
export function validateLevel(def: LevelDefinition): ValidationReport {
  const issues: LevelIssue[] = [];
  const map = parseMap(def.tiles);
  const add = (severity: IssueSeverity, code: IssueCode, message: string, point?: GridPoint) =>
    issues.push(point ? { severity, code, message, point } : { severity, code, message });

  // 1. Dimensiones: número de filas y largo de cada fila.
  if (def.tiles.length !== def.rows) {
    add(
      'error',
      'DIMENSIONS',
      `El mapa tiene ${def.tiles.length} filas; se esperaban ${def.rows}.`,
    );
  }
  def.tiles.forEach((row, y) => {
    const length = Array.from(row).length;
    if (length !== def.columns) {
      add(
        'error',
        'DIMENSIONS',
        `La fila ${y} mide ${length} columnas; se esperaban ${def.columns}.`,
      );
    }
  });
  if (issues.length > 0) return { ok: false, issues, stats: null, map };

  // 2. Símbolos fuera de la leyenda.
  for (const { point, symbol } of map.unknownSymbols) {
    add('error', 'UNKNOWN_SYMBOL', `Símbolo desconocido "${symbol}" en ${fmt(point)}.`, point);
  }

  // 3. Borde cerrado: si hay un hueco, el jugador podría salir del mapa.
  for (let y = 0; y < def.rows; y++) {
    for (let x = 0; x < def.columns; x++) {
      const onBorder = x === 0 || y === 0 || x === def.columns - 1 || y === def.rows - 1;
      if (onBorder && map.cells[y]?.[x] !== 'wall') {
        add('error', 'BORDER_OPEN', `El borde no es pared en ${fmt({ x, y })}.`, { x, y });
      }
    }
  }

  // 4. Entidades: el ASCII y las tablas declaradas deben coincidir.
  checkSingle(map.players, def.declared.player, 'jugador', 'PLAYER_COUNT', 'PLAYER_MISMATCH', add);
  checkSingle(map.exits, def.declared.exit, 'salida', 'EXIT_COUNT', 'EXIT_MISMATCH', add);
  checkSameSet(map.hunters, def.declared.hunters, 'Hunter', 'HUNTER_MISMATCH', add);
  checkSameSet(
    map.patrols,
    def.declared.patrols.map((p) => p.start),
    'Patrol',
    'PATROL_MISMATCH',
    add,
  );

  // 5. Gemas: cada `g` del mapa debe estar en la tabla y al revés.
  const declaredGemKeys = new Set<string>();
  for (const gem of def.declared.gems) {
    const key = pointKey(gem);
    if (declaredGemKeys.has(key)) {
      add('error', 'GEM_DUPLICATED', `La gema ${fmt(gem)} está declarada dos veces.`, gem);
    }
    declaredGemKeys.add(key);
  }
  const mapGemKeys = new Set(map.gems.map(pointKey));
  for (const gem of def.declared.gems) {
    if (!mapGemKeys.has(pointKey(gem))) {
      add('error', 'GEM_NOT_IN_MAP', `La gema declarada ${fmt(gem)} no tiene "g" en el mapa.`, gem);
    }
  }
  for (const gem of map.gems) {
    if (!declaredGemKeys.has(pointKey(gem))) {
      add('error', 'GEM_NOT_DECLARED', `Hay una "g" en ${fmt(gem)} que no está en la tabla.`, gem);
    }
  }
  if (def.gemsRequired < 1 || def.gemsRequired > map.gems.length) {
    add(
      'error',
      'GEMS_REQUIRED_INVALID',
      `Se piden ${def.gemsRequired} gemas, pero el mapa tiene ${map.gems.length}.`,
    );
  }

  // 6. Waypoints de cada Patrol.
  def.declared.patrols.forEach((patrol, index) => checkPatrol(patrol, index, map, add));

  // 7. Conectividad desde el inicio del jugador (BFS).
  const start = map.players[0] ?? def.declared.player;
  const reachable = reachableFrom(map.cells, start);
  const isReachable = (p: GridPoint) => reachable.has(pointKey(p));

  for (const exit of map.exits) {
    if (!isReachable(exit)) {
      add(
        'error',
        'EXIT_UNREACHABLE',
        `La salida ${fmt(exit)} no se alcanza desde el inicio.`,
        exit,
      );
    }
  }
  const unreachableGems = map.gems.filter((g) => !isReachable(g));
  if (unreachableGems.length > 0) {
    add(
      'warning',
      'GEMS_UNREACHABLE',
      `Gemas inalcanzables: ${unreachableGems.map(fmt).join(', ')}.`,
    );
  }
  const reachableGems = map.gems.length - unreachableGems.length;
  if (reachableGems < def.gemsRequired) {
    add(
      'error',
      'NOT_ENOUGH_REACHABLE_GEMS',
      `Solo se alcanzan ${reachableGems} gemas y se necesitan ${def.gemsRequired}.`,
    );
  }
  for (const enemy of [...map.hunters, ...map.patrols]) {
    if (!isReachable(enemy)) {
      add(
        'warning',
        'ENEMY_UNREACHABLE',
        `El enemigo en ${fmt(enemy)} está en una zona aislada.`,
        enemy,
      );
    }
  }

  let floorCells = 0;
  map.cells.forEach((row) => row.forEach((cell) => cell === 'floor' && floorCells++));
  if (reachable.size < floorCells) {
    add(
      'warning',
      'ISOLATED_FLOOR',
      `${floorCells - reachable.size} celdas de suelo no se alcanzan desde el inicio.`,
    );
  }

  return {
    ok: !issues.some((i) => i.severity === 'error'),
    issues,
    stats: {
      floorCells,
      reachableCells: reachable.size,
      totalGems: map.gems.length,
      reachableGems,
    },
    map,
  };
}

type AddIssue = (
  severity: IssueSeverity,
  code: IssueCode,
  message: string,
  point?: GridPoint,
) => void;

/** Para entidades que deben existir exactamente una vez (jugador, salida). */
function checkSingle(
  found: readonly GridPoint[],
  declared: GridPoint,
  label: string,
  countCode: IssueCode,
  mismatchCode: IssueCode,
  add: AddIssue,
): void {
  const first = found[0];
  if (found.length !== 1 || !first) {
    add('error', countCode, `Debe haber 1 ${label} en el mapa; hay ${found.length}.`);
    return;
  }
  if (!samePoint(first, declared)) {
    add(
      'error',
      mismatchCode,
      `El ${label} está en ${fmt(first)} en el mapa, pero la tabla dice ${fmt(declared)}.`,
      first,
    );
  }
}

/** Para entidades que pueden repetirse (Hunters, Patrols): mismo conjunto de posiciones. */
function checkSameSet(
  found: readonly GridPoint[],
  declared: readonly GridPoint[],
  label: string,
  code: IssueCode,
  add: AddIssue,
): void {
  const foundKeys = new Set(found.map(pointKey));
  const declaredKeys = new Set(declared.map(pointKey));
  for (const p of declared) {
    if (!foundKeys.has(pointKey(p)))
      add('error', code, `${label} declarado en ${fmt(p)} no está en el mapa.`, p);
  }
  for (const p of found) {
    if (!declaredKeys.has(pointKey(p)))
      add('error', code, `${label} en ${fmt(p)} no está en la tabla.`, p);
  }
}

/**
 * Un Patrol recorre sus waypoints en bucle (último → primero). Comprobamos:
 * - cada waypoint es suelo;
 * - entre dos waypoints seguidos hay una línea recta sin paredes (así el
 *   Patrol de la Fase 5 puede moverse en línea recta sin pathfinding);
 * - la posición inicial está sobre el circuito.
 */
function checkPatrol(patrol: PatrolDefinition, index: number, map: ParsedMap, add: AddIssue): void {
  const name = `Patrol ${index + 1}`;
  const points = patrol.waypoints;
  for (const wp of points) {
    if (!isWalkable(map.cells, wp)) {
      add('error', 'WAYPOINT_BLOCKED', `${name}: el waypoint ${fmt(wp)} no es suelo.`, wp);
    }
  }
  let startOnRoute = false;
  points.forEach((from, i) => {
    const to = points[(i + 1) % points.length]!;
    const segment = straightSegment(from, to);
    if (!segment) {
      add(
        'warning',
        'WAYPOINT_PATH_NOT_STRAIGHT',
        `${name}: el tramo ${fmt(from)} → ${fmt(to)} no es horizontal ni vertical.`,
        from,
      );
      return;
    }
    const wall = segment.find((p) => !isWalkable(map.cells, p));
    if (wall) {
      add(
        'error',
        'WAYPOINT_PATH_BLOCKED',
        `${name}: hay pared en ${fmt(wall)} entre ${fmt(from)} y ${fmt(to)}.`,
        wall,
      );
    }
    if (segment.some((p) => samePoint(p, patrol.start))) startOnRoute = true;
  });
  if (!startOnRoute) {
    add(
      'warning',
      'PATROL_START_OFF_ROUTE',
      `${name}: su inicio ${fmt(patrol.start)} no está sobre su circuito.`,
      patrol.start,
    );
  }
}

/** Celdas de un tramo recto (incluye los extremos), o `null` si no es recto. */
function straightSegment(from: GridPoint, to: GridPoint): GridPoint[] | null {
  if (from.x !== to.x && from.y !== to.y) return null;
  const dx = Math.sign(to.x - from.x);
  const dy = Math.sign(to.y - from.y);
  const cells: GridPoint[] = [from];
  let current = from;
  while (!samePoint(current, to)) {
    current = { x: current.x + dx, y: current.y + dy };
    cells.push(current);
  }
  return cells;
}

import { describe, expect, it } from 'vitest';
import { LEVEL_1 } from '../../src/data/levels';
import { validateLevel, type IssueCode } from '../../src/world/validateLevel';
import { LevelValidationError, loadLevel } from '../../src/world/loadLevel';
import { cloneLevel1, setSymbol } from './helpers';

const codes = (def: Parameters<typeof validateLevel>[0]): IssueCode[] =>
  validateLevel(def).issues.map((i) => i.code);

describe('validateLevel con el Nivel 1 aprobado', () => {
  const report = validateLevel(LEVEL_1);

  it('no tiene errores ni avisos', () => {
    expect(report.issues).toEqual([]);
    expect(report.ok).toBe(true);
  });

  it('reproduce las cifras de la auditoría de la Fase 0', () => {
    expect(report.stats).toEqual({
      floorCells: 311,
      reachableCells: 311,
      totalGems: 25,
      reachableGems: 25,
    });
  });
});

// Cada prueba estropea UNA cosa y comprueba que el validador la detecta.
// Así sabemos que el validador de verdad mira lo que dice mirar.
describe('validateLevel detecta discrepancias (sin corregirlas)', () => {
  it('fila de largo incorrecto', () => {
    const def = cloneLevel1();
    def.tiles[3] = def.tiles[3]!.slice(1);
    expect(codes(def)).toEqual(['DIMENSIONS']);
  });

  it('número de filas incorrecto', () => {
    const def = cloneLevel1();
    def.tiles.pop();
    expect(codes(def)).toContain('DIMENSIONS');
  });

  it('símbolo desconocido', () => {
    const def = cloneLevel1();
    setSymbol(def, 1, 1, 'X');
    expect(codes(def)).toEqual(['UNKNOWN_SYMBOL']);
  });

  it('hueco en el borde', () => {
    const def = cloneLevel1();
    setSymbol(def, 0, 5, '.');
    expect(codes(def)).toEqual(['BORDER_OPEN']);
  });

  it('jugador en otra posición que la declarada', () => {
    const def = cloneLevel1();
    setSymbol(def, 2, 2, '.');
    setSymbol(def, 1, 1, 'P');
    expect(codes(def)).toEqual(['PLAYER_MISMATCH']);
  });

  it('dos jugadores', () => {
    const def = cloneLevel1();
    setSymbol(def, 1, 1, 'P');
    expect(codes(def)).toContain('PLAYER_COUNT');
  });

  it('salida que falta', () => {
    const def = cloneLevel1();
    setSymbol(def, 21, 15, '.');
    expect(codes(def)).toEqual(['EXIT_COUNT']);
  });

  it('Hunter que no coincide con la tabla', () => {
    const def = cloneLevel1();
    setSymbol(def, 6, 5, '.');
    setSymbol(def, 5, 5, 'H');
    expect(codes(def)).toEqual(['HUNTER_MISMATCH', 'HUNTER_MISMATCH']);
  });

  it('gema en el mapa que no está en la tabla', () => {
    const def = cloneLevel1();
    setSymbol(def, 1, 1, 'g');
    expect(codes(def)).toEqual(['GEM_NOT_DECLARED']);
  });

  it('gema de la tabla que no está en el mapa', () => {
    const def = cloneLevel1();
    setSymbol(def, 4, 2, '.');
    expect(codes(def)).toEqual(['GEM_NOT_IN_MAP']);
  });

  it('gema declarada dos veces', () => {
    const def = cloneLevel1();
    def.declared.gems.push({ x: 4, y: 2 });
    expect(codes(def)).toEqual(['GEM_DUPLICATED']);
  });

  it('se piden más gemas de las que hay', () => {
    const def = cloneLevel1();
    def.gemsRequired = 26;
    expect(codes(def)).toContain('GEMS_REQUIRED_INVALID');
  });

  it('waypoint sobre una pared', () => {
    const def = cloneLevel1();
    def.declared.patrols[0]!.waypoints[0] = { x: 15, y: 12 };
    expect(codes(def)).toContain('WAYPOINT_BLOCKED');
  });

  it('pared en mitad del circuito del Patrol', () => {
    const def = cloneLevel1();
    setSymbol(def, 21, 13, '#');
    // (21,13) también era una gema: también falta en el mapa.
    expect(codes(def)).toEqual(expect.arrayContaining(['WAYPOINT_PATH_BLOCKED', 'GEM_NOT_IN_MAP']));
  });

  it('tramo diagonal en el circuito es un aviso, no un error', () => {
    const def = cloneLevel1();
    def.declared.patrols[0]!.waypoints = [
      { x: 17, y: 12 },
      { x: 21, y: 12 },
      { x: 17, y: 14 },
    ];
    const report = validateLevel(def);
    expect(report.ok).toBe(true);
    expect(report.issues.map((i) => i.code)).toContain('WAYPOINT_PATH_NOT_STRAIGHT');
  });

  it('salida encerrada entre paredes', () => {
    const def = cloneLevel1();
    for (const [x, y] of [
      [20, 15],
      [22, 15],
      [21, 14],
      [21, 16],
    ] as const)
      setSymbol(def, x, y, '#');
    expect(codes(def)).toContain('EXIT_UNREACHABLE');
  });

  it('menos de 20 gemas alcanzables', () => {
    const def = cloneLevel1();
    // Una pared de arriba abajo en la columna 9 deja aislado el lado derecho.
    for (let y = 1; y <= 16; y++) {
      if (def.tiles[y]![9] === '.') setSymbol(def, 9, y, '#');
    }
    expect(codes(def)).toEqual(
      expect.arrayContaining(['NOT_ENOUGH_REACHABLE_GEMS', 'GEMS_UNREACHABLE', 'EXIT_UNREACHABLE']),
    );
  });
});

describe('loadLevel', () => {
  it('construye el Nivel 1 listo para usar', () => {
    const { level, warnings } = loadLevel(LEVEL_1);
    expect(warnings).toEqual([]);
    expect(level.gems).toHaveLength(25);
    expect(level.gemsRequired).toBe(20);
    expect(level.cells[0]![0]).toBe('wall');
    expect(level.cells[2]![2]).toBe('floor'); // el jugador está sobre suelo
  });

  it('lanza LevelValidationError con todos los errores si el nivel no es válido', () => {
    const def = cloneLevel1();
    setSymbol(def, 0, 5, '.');
    setSymbol(def, 1, 1, 'X');
    expect(() => loadLevel(def)).toThrow(LevelValidationError);
    try {
      loadLevel(def);
    } catch (error) {
      expect((error as LevelValidationError).issues.map((i) => i.code)).toEqual([
        'UNKNOWN_SYMBOL',
        'BORDER_OPEN',
      ]);
    }
  });
});

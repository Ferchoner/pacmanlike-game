import { describe, expect, it } from 'vitest';
import { GRID } from '../../src/core/GameConstants';
import { LEVEL_1, LEVELS, campaignStartIndex } from '../../src/data/levels';
import { loadLevel } from '../../src/world/loadLevel';
import { levelToTiled } from '../../src/world/tiled/levelToTiled';
import {
  convertTiledMap,
  objectCell,
  tiledToLevel,
  TiledLevelError,
  type TiledIssueCode,
} from '../../src/world/tiled/tiledToLevel';
import nivel1Referencia from '../../tiled/mapas/nivel1_referencia.json';
import plantilla from '../../tiled/plantilla_nivel.json';

const OPTIONS = { source: 'prueba.json' };
const toTiled = () =>
  levelToTiled(LEVEL_1, { tilesetSource: 'paredes_TEMP.tsx', cellSize: GRID.cellSize });

/** Lo que debe sobrevivir a la traducción (source y blueprintVersion cambian a propósito). */
const essentials = (def: typeof LEVEL_1) => ({
  id: def.id,
  name: def.name,
  columns: def.columns,
  rows: def.rows,
  gemsRequired: def.gemsRequired,
  tiles: def.tiles,
  declared: def.declared,
});

/** Mapa mínimo de 5×5: borde de pared, jugador en (1,1), salida en (3,3), gema en (2,2). */
function smallMap(objects: unknown[], overrides: Record<string, unknown> = {}) {
  const W = 5;
  const data = Array.from({ length: W * W }, (_, i) => {
    const x = i % W;
    const y = Math.floor(i / W);
    return x === 0 || y === 0 || x === W - 1 || y === W - 1 ? 1 : 0;
  });
  return {
    orientation: 'orthogonal',
    width: W,
    height: W,
    tilewidth: 32,
    tileheight: 32,
    properties: [
      { name: 'id', type: 'string', value: 'mini' },
      { name: 'nombre', type: 'string', value: 'Mini' },
      { name: 'gemasRequeridas', type: 'int', value: 1 },
    ],
    layers: [
      { type: 'tilelayer', name: 'paredes', width: W, height: W, data },
      { type: 'objectgroup', name: 'entidades', objects },
    ],
    ...overrides,
  };
}
const point = (id: number, type: string, cx: number, cy: number, extra: object = {}) => ({
  id,
  type,
  x: cx * 32 + 16,
  y: cy * 32 + 16,
  point: true,
  ...extra,
});
const BASIC = [point(1, 'jugador', 1, 1), point(2, 'salida', 3, 3), point(3, 'gema', 2, 2)];

function codes(json: unknown): TiledIssueCode[] {
  const result = convertTiledMap(json, OPTIONS);
  return result.ok ? [] : result.issues.map((i) => i.code);
}

describe('Tiled: ida y vuelta con el Nivel 1', () => {
  it('Nivel 1 → Tiled → nivel da exactamente los mismos datos', () => {
    const back = tiledToLevel(toTiled(), OPTIONS);
    expect(essentials(back)).toEqual(essentials(LEVEL_1));
    expect(back.source).toBe('prueba.json');
    expect(back.blueprintVersion).toBe('tiled');
  });

  it('el archivo de referencia guardado sigue igual que el Nivel 1 aprobado', () => {
    // Si alguien edita nivel1_referencia.json en Tiled, esta prueba avisa.
    // Para regenerarlo: npm run level:export-nivel1
    const def = tiledToLevel(nivel1Referencia, OPTIONS);
    expect(essentials(def)).toEqual(essentials(LEVEL_1));
  });

  it('el nivel traducido pasa el validador de la Fase 2 y se carga', () => {
    const { level, warnings } = loadLevel(tiledToLevel(nivel1Referencia, OPTIONS));
    expect(warnings).toEqual([]);
    expect(level.gems).toHaveLength(25);
    expect(level.patrols[0]?.waypoints).toHaveLength(4);
  });
});

describe('Tiled: traducción de un mapa pequeño', () => {
  it('traduce paredes, entidades y propiedades', () => {
    const def = tiledToLevel(smallMap(BASIC), OPTIONS);
    expect(def.tiles).toEqual(['#####', '#P..#', '#.g.#', '#..E#', '#####']);
    expect(def.declared.player).toEqual({ x: 1, y: 1 });
    expect(def.declared.exit).toEqual({ x: 3, y: 3 });
    expect(def.declared.gems).toEqual([{ x: 2, y: 2 }]);
    expect(def.gemsRequired).toBe(1);
    expect(loadLevel(def).level.id).toBe('mini');
  });

  it('acepta el campo `class` (Tiled 1.9) y mayúsculas en la clase', () => {
    const objects = [
      { ...point(1, '', 1, 1), type: undefined, class: 'Jugador' },
      point(2, 'SALIDA', 3, 3),
      point(3, 'gema', 2, 2),
    ];
    expect(convertTiledMap(smallMap(objects), OPTIONS).ok).toBe(true);
  });

  it('un tile volteado (bits altos del gid) sigue contando como pared', () => {
    const map = smallMap(BASIC);
    const data = [...(map.layers[0] as { data: number[] }).data];
    data[2 * 5 + 1] = 0x80000001; // celda (1,2) con el flag "volteado horizontal"
    (map.layers[0] as { data: number[] }).data = data;
    expect(tiledToLevel(map, OPTIONS).tiles[2]).toBe('##g.#');
  });

  it('la ruta del Patrol sale de la polilínea, sin repetir el vértice de cierre', () => {
    const objects = [
      ...BASIC.slice(0, 2),
      // polígono cerrado (1,3) → (3,1)... pasando por el centro de las celdas
      { id: 9, type: 'ruta', x: 48, y: 48, polyline: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 32 }, { x: 0, y: 32 }, { x: 0, y: 0 }] },
      point(4, 'patrol', 2, 1, { properties: [{ name: 'ruta', type: 'object', value: 9 }] }),
      point(3, 'gema', 2, 3),
    ];
    const def = tiledToLevel(smallMap(objects), OPTIONS);
    expect(def.declared.patrols).toEqual([
      {
        start: { x: 2, y: 1 },
        waypoints: [
          { x: 1, y: 1 },
          { x: 3, y: 1 },
          { x: 3, y: 2 },
          { x: 1, y: 2 },
        ],
      },
    ]);
  });
});

describe('Tiled: posición de un objeto → celda', () => {
  it('punto: la celda que contiene el punto', () => {
    expect(objectCell({ id: 1, x: 70, y: 40, point: true }, 32)).toEqual({ x: 2, y: 1 });
  });
  it('rectángulo: la celda de su centro', () => {
    expect(objectCell({ id: 1, x: 64, y: 32, width: 32, height: 32 }, 32)).toEqual({ x: 2, y: 1 });
  });
  it('objeto-tile: (x, y) es la esquina inferior izquierda', () => {
    expect(objectCell({ id: 1, gid: 1, x: 64, y: 64, width: 32, height: 32 }, 32)).toEqual({ x: 2, y: 1 });
  });
});

describe('Tiled: errores que se informan (nunca se corrigen en silencio)', () => {
  it('lo que no es un mapa de Tiled', () => {
    expect(codes({ hola: 1 })).toEqual(['TILED_NOT_A_MAP']);
    expect(codes(null)).toEqual(['TILED_NOT_A_MAP']);
  });

  it('mapa infinito, isométrico o con tiles no cuadrados', () => {
    expect(codes(smallMap(BASIC, { infinite: true }))).toContain('TILED_INFINITE');
    expect(codes(smallMap(BASIC, { orientation: 'isometric' }))).toContain('TILED_ORIENTATION');
    expect(codes(smallMap(BASIC, { tileheight: 16 }))).toContain('TILED_TILE_NOT_SQUARE');
  });

  it('faltan propiedades del mapa o capas', () => {
    expect(codes(smallMap(BASIC, { properties: [] }))).toEqual([
      'TILED_PROPERTY_MISSING',
      'TILED_PROPERTY_MISSING',
      'TILED_PROPERTY_MISSING',
    ]);
    const sinCapas = smallMap(BASIC, { layers: [] });
    expect(codes(sinCapas)).toEqual(['TILED_LAYER_MISSING', 'TILED_LAYER_MISSING']);
  });

  it('capa de paredes comprimida (base64)', () => {
    const map = smallMap(BASIC);
    const layers = [{ ...map.layers[0], data: 'eJxjYAAAAAQAAQ==', encoding: 'base64' }, map.layers[1]];
    expect(codes({ ...map, layers })).toEqual(['TILED_LAYER_ENCODING']);
  });

  it('objetos sin clase, con clase desconocida o fuera del mapa', () => {
    const objects = [...BASIC, point(4, '', 2, 1), point(5, 'fantasma', 2, 3), point(6, 'gema', 9, 9)];
    expect(codes(smallMap(objects))).toEqual([
      'TILED_OBJECT_NO_CLASS',
      'TILED_OBJECT_UNKNOWN_CLASS',
      'TILED_OBJECT_OUTSIDE',
    ]);
  });

  it('entidad sobre pared y dos entidades en la misma celda', () => {
    const objects = [...BASIC, point(4, 'gema', 0, 2), point(5, 'hunter', 2, 2)];
    expect(codes(smallMap(objects))).toEqual(['TILED_OBJECT_ON_WALL', 'TILED_OBJECT_OVERLAP']);
  });

  it('sin jugador o sin salida', () => {
    expect(codes(smallMap([point(3, 'gema', 2, 2)]))).toEqual([
      'TILED_PLAYER_MISSING',
      'TILED_EXIT_MISSING',
    ]);
  });

  it('Patrol sin ruta o con una ruta que no es polilínea', () => {
    const sinRuta = [...BASIC, point(4, 'patrol', 2, 1)];
    expect(codes(smallMap(sinRuta))).toEqual(['TILED_ROUTE_MISSING']);
    const rutaRect = [
      ...BASIC,
      { id: 9, type: 'ruta', x: 32, y: 32, width: 64, height: 32 },
      point(4, 'patrol', 2, 1, { properties: [{ name: 'ruta', type: 'object', value: 9 }] }),
    ];
    expect(codes(smallMap(rutaRect))).toEqual(['TILED_ROUTE_INVALID']);
  });

  it('tiledToLevel lanza TiledLevelError con todos los problemas', () => {
    expect(() => tiledToLevel({}, OPTIONS)).toThrow(TiledLevelError);
  });

  it('la plantilla vacía se traduce solo cuando tiene jugador y salida', () => {
    expect(codes(plantilla)).toEqual(['TILED_PLAYER_MISSING', 'TILED_EXIT_MISSING']);
  });
});

describe('En qué nivel empieza la run (?nivel= solo en desarrollo)', () => {
  it('sin parámetro o en producción siempre es el primer nivel', () => {
    expect(campaignStartIndex('', true)).toBe(0);
    expect(campaignStartIndex(`?nivel=${LEVELS.at(-1)!.id}`, false)).toBe(0);
  });
  it('en desarrollo, ?nivel=<id> empieza en ese nivel; uno desconocido cae al primero', () => {
    LEVELS.forEach((level, i) => expect(campaignStartIndex(`?nivel=${level.id}`, true)).toBe(i));
    expect(campaignStartIndex('?nivel=no-existe', true)).toBe(0);
  });
});

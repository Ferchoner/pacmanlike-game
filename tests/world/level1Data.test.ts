import { describe, expect, it } from 'vitest';
import { GRID } from '../../src/core/GameConstants';
import { LEVEL_1 } from '../../src/data/levels';
// `?raw` es una función de Vite: importa el archivo como texto plano.
import docsMap from '../../docs/02_diseno/MAPA_NIVEL_1_APROBADO.txt?raw';
import contexto from '../../docs/01_contexto/CONTEXTO_MAESTRO.md?raw';

/**
 * El JSON es una COPIA del mapa aprobado. Estas pruebas evitan que la copia y
 * el documento se separen sin que nadie se dé cuenta: si alguien edita uno y
 * no el otro, la prueba falla.
 */
describe('Datos del Nivel 1 vs documentos', () => {
  it('las filas del JSON son idénticas al mapa aprobado', () => {
    const docRows = docsMap.split(/\r?\n/).filter((line) => line.startsWith('#'));
    expect(LEVEL_1.tiles).toEqual(docRows);
  });

  it('las dimensiones coinciden con la cuadrícula del juego', () => {
    expect(LEVEL_1.columns).toBe(GRID.columns);
    expect(LEVEL_1.rows).toBe(GRID.rows);
  });

  it('la tabla de gemas coincide con la declarada en CONTEXTO_MAESTRO', () => {
    // Texto del doc: "Gemas declaradas: Y2 X4,6,11,... ; Y3 X13; ..." (puede partir líneas).
    const section = contexto.split('Gemas declaradas:')[1]!.split('Total declarado')[0]!;
    const fromDocs = [...section.replace(/\s+/g, ' ').matchAll(/Y(\d+) X([\d,]+)/g)].flatMap(
      ([, y, xs]) => xs!.split(',').map((x) => ({ x: Number(x), y: Number(y) })),
    );
    expect(fromDocs).toHaveLength(25);
    expect(LEVEL_1.declared.gems).toEqual(fromDocs);
  });

  it('entidades, waypoints y gemas requeridas coinciden con la especificación', () => {
    expect(LEVEL_1.gemsRequired).toBe(20);
    expect(LEVEL_1.declared.player).toEqual({ x: 2, y: 2 });
    expect(LEVEL_1.declared.hunters).toEqual([
      { x: 6, y: 5 },
      { x: 12, y: 9 },
    ]);
    expect(LEVEL_1.declared.exit).toEqual({ x: 21, y: 15 });
    expect(LEVEL_1.declared.patrols).toEqual([
      {
        start: { x: 18, y: 12 },
        waypoints: [
          { x: 17, y: 12 },
          { x: 21, y: 12 },
          { x: 21, y: 14 },
          { x: 17, y: 14 },
        ],
      },
    ]);
  });
});

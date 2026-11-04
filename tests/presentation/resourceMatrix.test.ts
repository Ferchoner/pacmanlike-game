import { readFileSync } from 'node:fs';
import { unzipSync, strFromU8 } from 'fflate';
import { describe, expect, it } from 'vitest';
import manifestJson from '../../docs/03_recursos/manifest.json';

/**
 * La MATRIZ de recursos (docs/03_recursos/MATRIZ_RECURSOS.csv y .xlsx) se
 * mantiene A MANO (decisión de Fernando, 2026-11-04): es la lista de
 * necesidades que leen las personas. El MANIFEST es lo que lee el juego.
 *
 * Estas pruebas no generan nada: solo avisan si las dos se contradicen
 * (un ID que falta, otra prioridad, o un estado incompatible), para que el
 * desfase se vea en rojo en vez de descubrirlo meses después.
 */

interface MatrixRow {
  readonly id: string;
  readonly priority: string;
  readonly state: string;
}

interface ManifestRow {
  readonly id: string;
  readonly priority: string;
  readonly status: string;
}

/**
 * Qué estados de la matriz son compatibles con cada estado del manifest.
 * El manifest es más grueso: mientras un recurso no se carga, para el juego
 * está `pending`, aunque en la matriz ya esté "En búsqueda" o "Recibido".
 */
const COMPATIBLE: Record<string, readonly string[]> = {
  pending: ['Pendiente', 'En búsqueda', 'Seleccionado', 'Recibido', 'Validando', 'Rechazado', 'Reemplazado'],
  'temp-dev': ['Uso temporal'],
  approved: ['Aprobado'],
};

const MANIFEST = (manifestJson as { assets: ManifestRow[] }).assets;

/** CSV sencillo: comas, comillas dobles para campos con comas, BOM opcional. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  row.push(field);
  if (row.some((f) => f !== '')) rows.push(row);
  return rows;
}

function csvRows(): MatrixRow[] {
  const [header, ...rows] = parseCsv(readFileSync('docs/03_recursos/MATRIZ_RECURSOS.csv', 'utf8'));
  const col = (name: string) => header!.indexOf(name);
  const [iId, iPrio, iState] = [col('ID'), col('Prioridad'), col('Estado')];
  return rows.map((r) => ({ id: r[iId]!, priority: r[iPrio]!, state: r[iState]! }));
}

/**
 * Lee la hoja "Matriz" del .xlsx (un .xlsx es un .zip con XML dentro). Acepta
 * texto en línea y la tabla de textos compartidos, que es como guarda Excel.
 */
function xlsxRows(): MatrixRow[] {
  const files = unzipSync(readFileSync('docs/03_recursos/MATRIZ_RECURSOS.xlsx'));
  const xml = (path: string) => (files[path] ? strFromU8(files[path]) : '');
  const decode = (s: string) =>
    s
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, '&');
  const textOf = (s: string) => decode([...s.matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]).join(''));
  const shared = [...xml('xl/sharedStrings.xml').matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => textOf(m[1]!));

  // La hoja "Matriz" es la primera del libro.
  const sheet = xml('xl/worksheets/sheet1.xml');
  const byRow = new Map<number, Map<string, string>>();
  for (const m of sheet.matchAll(/<c r="([A-Z]+)(\d+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
    const [, column, rowNum, attrs, inner = ''] = m;
    let value: string;
    if (/t="s"/.test(attrs!)) value = shared[Number(/<v>(\d+)<\/v>/.exec(inner)?.[1])] ?? '';
    else if (/t="inlineStr"/.test(attrs!)) value = textOf(inner);
    else value = decode(/<v>([\s\S]*?)<\/v>/.exec(inner)?.[1] ?? '');
    const r = Number(rowNum);
    if (!byRow.has(r)) byRow.set(r, new Map());
    byRow.get(r)!.set(column!, value);
  }
  const header = byRow.get(1)!;
  const colOf = (name: string) => [...header.entries()].find(([, v]) => v === name)?.[0] ?? '?';
  const [cId, cPrio, cState] = [colOf('ID'), colOf('Prioridad'), colOf('Estado')];
  return [...byRow.entries()]
    .filter(([r, cells]) => r > 1 && cells.get(cId))
    .map(([, cells]) => ({ id: cells.get(cId)!, priority: cells.get(cPrio) ?? '', state: cells.get(cState) ?? '' }));
}

function differences(matrix: readonly MatrixRow[]): string[] {
  const problems: string[] = [];
  const inMatrix = new Map(matrix.map((r) => [r.id, r]));
  for (const asset of MANIFEST) {
    const row = inMatrix.get(asset.id);
    if (!row) {
      problems.push(`${asset.id}: está en el manifest pero no en la matriz`);
      continue;
    }
    if (row.priority !== asset.priority) {
      problems.push(`${asset.id}: prioridad ${row.priority} en la matriz y ${asset.priority} en el manifest`);
    }
    const ok = COMPATIBLE[asset.status] ?? [];
    if (!ok.includes(row.state)) {
      problems.push(
        `${asset.id}: estado "${row.state}" en la matriz, pero "${asset.status}" en el manifest (esperado: ${ok.join(' / ') || '?'})`,
      );
    }
  }
  const inManifest = new Set(MANIFEST.map((a) => a.id));
  for (const row of matrix) {
    if (!inManifest.has(row.id)) problems.push(`${row.id}: está en la matriz pero no en el manifest`);
  }
  return problems;
}

describe('Matriz de recursos frente al manifest', () => {
  it('el lector de CSV entiende comillas y comas dentro de un campo', () => {
    expect(parseCsv('﻿a,b\n1,"x, y"\n')).toEqual([
      ['a', 'b'],
      ['1', 'x, y'],
    ]);
  });

  it('MATRIZ_RECURSOS.csv coincide con el manifest (IDs, prioridad y estado)', () => {
    expect(differences(csvRows())).toEqual([]);
  });

  it('MATRIZ_RECURSOS.xlsx coincide con el manifest (IDs, prioridad y estado)', () => {
    expect(differences(xlsxRows())).toEqual([]);
  });

  it('detecta un desfase (si no, las pruebas de arriba no protegerían nada)', () => {
    const rows = csvRows().map((r) => (r.id === 'R-001' ? { ...r, state: 'Pendiente' } : r));
    expect(differences(rows)).toEqual([
      expect.stringContaining('R-001: estado "Pendiente" en la matriz'),
    ]);
  });
});

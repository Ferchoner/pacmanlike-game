import type { Level, LevelDefinition } from './LevelTypes';
import { validateLevel, type LevelIssue } from './validateLevel';

/** Error con la lista completa de problemas, para poder mostrarlos todos. */
export class LevelValidationError extends Error {
  readonly issues: readonly LevelIssue[];

  constructor(levelId: string, issues: readonly LevelIssue[]) {
    super(`El nivel "${levelId}" no pasó la validación (${issues.length} errores).`);
    this.name = 'LevelValidationError';
    this.issues = issues;
  }
}

export interface LoadedLevel {
  readonly level: Level;
  /** Avisos que no bloquean la carga, para mostrarlos en consola. */
  readonly warnings: readonly LevelIssue[];
}

/**
 * Puerta de entrada al mundo: valida y, solo si no hay errores, construye el
 * `Level` que usará el juego. Las posiciones salen del ASCII validado; como
 * ya se comprobó que coinciden con las tablas declaradas, da igual cuál usar.
 */
export function loadLevel(def: LevelDefinition): LoadedLevel {
  const report = validateLevel(def);
  const errors = report.issues.filter((i) => i.severity === 'error');
  if (!report.ok) throw new LevelValidationError(def.id, errors);

  const { map } = report;
  const level: Level = {
    id: def.id,
    name: def.name,
    columns: def.columns,
    rows: def.rows,
    gemsRequired: def.gemsRequired,
    cells: map.cells,
    playerStart: def.declared.player,
    hunters: def.declared.hunters,
    patrols: def.declared.patrols,
    exit: def.declared.exit,
    gems: def.declared.gems,
  };
  return { level, warnings: report.issues.filter((i) => i.severity === 'warning') };
}

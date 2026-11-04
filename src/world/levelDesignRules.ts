import type { LevelDefinition } from './LevelTypes';

/**
 * Reglas de DISEÑO de niveles (no de validez). Un nivel que las incumple se
 * puede jugar, así que `validateLevel` no las mira; las avisa `level:check`
 * al dibujar un mapa nuevo y las vigila la prueba de la campaña.
 *
 * Regla de Fernando (2026-11-04): en cada nivel SOBRAN entre 5 y 8 gemas
 * (gemas del mapa − gemas requeridas). Así siempre hay margen para no tener
 * que recoger hasta la última, pero no tanto que sobren medio mapa.
 */
export const GEM_SURPLUS = { min: 5, max: 8 } as const;

/** Cuántas gemas sobran: las del mapa menos las que abren la puerta. */
export function gemSurplus(def: LevelDefinition): number {
  return def.declared.gems.length - def.gemsRequired;
}

/** Aviso en español si el nivel incumple la regla de gemas sobrantes; si la cumple, `null`. */
export function gemSurplusWarning(def: LevelDefinition): string | null {
  const surplus = gemSurplus(def);
  if (surplus >= GEM_SURPLUS.min && surplus <= GEM_SURPLUS.max) return null;
  const total = def.declared.gems.length;
  const lo = Math.max(0, total - GEM_SURPLUS.max);
  const hi = total - GEM_SURPLUS.min;
  return (
    `Sobran ${surplus} gemas (${total} en el mapa, ${def.gemsRequired} requeridas); ` +
    `la regla es que sobren entre ${GEM_SURPLUS.min} y ${GEM_SURPLUS.max}. ` +
    `Con ${total} gemas, "gemasRequeridas" debería estar entre ${lo} y ${hi}.`
  );
}

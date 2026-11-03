/**
 * Lectura y validación de `docs/03_recursos/manifest.json` (Fase 8).
 *
 * El manifest es el INVENTARIO de recursos externos: qué arte y audio existe,
 * de dónde viene, con qué licencia y dónde está el archivo. El juego no
 * escribe rutas a mano: todo lo que carga sale de aquí.
 *
 * Este módulo es PURO (sin Phaser): recibe el JSON y decide qué se puede
 * cargar. Así se prueba con Vitest y un error en el manifest se detecta en
 * las pruebas, no jugando.
 *
 * Regla clave: solo se carga un recurso con `status: "approved"`. Aprobado
 * significa que pasó el checklist de recepción (docs/05_control): tiene
 * archivo, autor y licencia registrados y una ficha técnica (`load`). Lo que
 * no está aprobado sigue con su placeholder TEMP.
 */

/** Una animación de un spritesheet, tal como la documenta su ficha técnica. */
export interface AnimationSpec {
  /** Índices de frame en orden (0 = arriba a la izquierda, por filas). */
  readonly frames: readonly number[];
  /** Fotogramas por segundo. */
  readonly fps: number;
  /** true = se repite (caminar); false = una vez (muerte, golpe). */
  readonly loop: boolean;
}

/**
 * Cómo cargarlo en Phaser: la parte técnica de la ficha. NO se rellena
 * adivinando: cada número sale de la documentación del proveedor.
 */
export type AssetLoadSpec =
  | { readonly kind: 'image'; readonly key: string; readonly origin?: Origin }
  | {
      readonly kind: 'spritesheet';
      readonly key: string;
      readonly frameWidth: number;
      readonly frameHeight: number;
      readonly margin?: number;
      readonly spacing?: number;
      readonly origin?: Origin;
      readonly animations?: Readonly<Record<string, AnimationSpec>>;
    }
  | {
      readonly kind: 'audio';
      readonly key: string;
      /** 0..1, volumen relativo de la ficha de audio (1 si no se indica). */
      readonly volume?: number;
      readonly loop?: boolean;
    };

export interface Origin {
  readonly x: number;
  readonly y: number;
}

/** Una entrada del manifest tal como está en el JSON (solo los campos que usamos). */
export interface ManifestEntry {
  readonly id: string;
  readonly entity: string;
  readonly description: string;
  readonly priority: string;
  readonly format: string;
  readonly animation_or_event: string;
  readonly status: string;
  readonly path: string | null;
  readonly author_or_vendor: string | null;
  readonly license: string | null;
  readonly load?: unknown;
}

export interface AssetManifest {
  readonly visual_spec: { readonly base_tile_px: number; readonly logical_cell_px: number };
  readonly assets: readonly ManifestEntry[];
}

/** Un recurso listo para encolar en el loader. */
export interface ReadyAsset {
  readonly id: string;
  /** Ruta relativa a `public/` (p. ej. `assets/audio/gem.ogg`). */
  readonly path: string;
  readonly load: AssetLoadSpec;
}

/** Un recurso que todavía no se puede cargar, y por qué (para el informe). */
export interface MissingAsset {
  readonly id: string;
  readonly priority: string;
  readonly what: string;
  readonly reason: string;
}

export interface ManifestIssue {
  readonly id: string;
  readonly message: string;
}

export interface ManifestReport {
  readonly ready: readonly ReadyAsset[];
  readonly missing: readonly MissingAsset[];
  /** Entradas APROBADAS con algún problema: no se cargan, y hay que arreglarlas. */
  readonly errors: readonly ManifestIssue[];
}

const IMAGE_EXT = ['.png'];
const AUDIO_EXT = ['.ogg', '.mp3', '.wav'];

/**
 * Revisa todo el manifest y lo separa en: listos, faltantes y errores.
 * Nunca lanza: un manifest con fallos no debe impedir jugar con TEMP.
 */
export function readManifest(manifest: AssetManifest): ManifestReport {
  const ready: ReadyAsset[] = [];
  const missing: MissingAsset[] = [];
  const errors: ManifestIssue[] = [];
  /** key → ruta, para detectar dos archivos distintos con la misma clave. */
  const pathByKey = new Map<string, string>();

  for (const entry of manifest.assets) {
    const what = `${entry.entity} · ${entry.description}`;
    if (entry.status !== 'approved') {
      missing.push({ id: entry.id, priority: entry.priority, what, reason: `estado "${entry.status}"` });
      continue;
    }
    const problems = checkApproved(entry);
    if (problems.length > 0 || !isLoadSpec(entry.load) || entry.path === null) {
      for (const message of problems) errors.push({ id: entry.id, message });
      missing.push({ id: entry.id, priority: entry.priority, what, reason: 'aprobado pero con errores' });
      continue;
    }
    const load = entry.load;
    const previous = pathByKey.get(load.key);
    if (previous !== undefined && previous !== entry.path) {
      errors.push({
        id: entry.id,
        message: `la clave "${load.key}" ya se usa para ${previous}; una clave = un archivo`,
      });
      missing.push({ id: entry.id, priority: entry.priority, what, reason: 'clave duplicada' });
      continue;
    }
    pathByKey.set(load.key, entry.path);
    ready.push({ id: entry.id, path: entry.path, load });
  }
  return { ready, missing, errors };
}

/** Lista de problemas de una entrada aprobada (vacía = se puede cargar). */
function checkApproved(entry: ManifestEntry): string[] {
  const problems: string[] = [];
  if (!entry.path) problems.push('aprobado sin "path"');
  if (!entry.license) problems.push('aprobado sin "license" (no se integra nada sin licencia)');
  if (!entry.author_or_vendor) problems.push('aprobado sin "author_or_vendor"');
  if (entry.path && !isSafePublicPath(entry.path)) {
    problems.push(`"path" debe ir dentro de public/assets/ (p. ej. "assets/audio/x.ogg"): ${entry.path}`);
  }
  const load = entry.load;
  if (load === undefined || load === null) {
    problems.push('aprobado sin ficha técnica "load" (tipo, clave, frames…)');
    return problems;
  }
  problems.push(...checkLoadSpec(load));
  if (entry.path && isLoadSpec(load)) {
    const allowed = load.kind === 'audio' ? AUDIO_EXT : IMAGE_EXT;
    if (!allowed.some((ext) => entry.path!.toLowerCase().endsWith(ext))) {
      problems.push(`un recurso "${load.kind}" debe ser ${allowed.join('/')}: ${entry.path}`);
    }
  }
  return problems;
}

function isSafePublicPath(path: string): boolean {
  return path.startsWith('assets/') && !path.includes('..') && !path.includes('\\');
}

/** Valida la forma de `load` sin suponer nada: cada número debe venir de la ficha. */
function checkLoadSpec(load: unknown): string[] {
  if (typeof load !== 'object' || load === null) return ['"load" debe ser un objeto'];
  const l = load as Record<string, unknown>;
  const problems: string[] = [];
  if (typeof l.key !== 'string' || l.key.length === 0) problems.push('"load.key" vacío');
  switch (l.kind) {
    case 'image':
      break;
    case 'audio':
      if (l.volume !== undefined && !(typeof l.volume === 'number' && l.volume >= 0 && l.volume <= 1)) {
        problems.push('"load.volume" debe estar entre 0 y 1');
      }
      break;
    case 'spritesheet': {
      for (const field of ['frameWidth', 'frameHeight'] as const) {
        if (!isPositiveInt(l[field])) problems.push(`"load.${field}" debe ser un entero > 0 (dato del proveedor)`);
      }
      const anims = l.animations;
      if (anims !== undefined) {
        if (typeof anims !== 'object' || anims === null) {
          problems.push('"load.animations" debe ser un objeto');
        } else {
          for (const [name, spec] of Object.entries(anims)) problems.push(...checkAnimation(name, spec));
        }
      }
      break;
    }
    default:
      problems.push(`"load.kind" debe ser image, spritesheet o audio (es ${String(l.kind)})`);
  }
  return problems;
}

function checkAnimation(name: string, spec: unknown): string[] {
  if (typeof spec !== 'object' || spec === null) return [`animación "${name}" no es un objeto`];
  const s = spec as Record<string, unknown>;
  const problems: string[] = [];
  const frames = s.frames;
  if (!Array.isArray(frames) || frames.length === 0 || !frames.every((f) => Number.isInteger(f) && f >= 0)) {
    problems.push(`animación "${name}": "frames" debe ser una lista de índices ≥ 0`);
  }
  if (!(typeof s.fps === 'number' && s.fps > 0)) problems.push(`animación "${name}": "fps" debe ser > 0`);
  if (typeof s.loop !== 'boolean') problems.push(`animación "${name}": "loop" debe ser true o false`);
  if (name === 'death' && s.loop === true) {
    problems.push('animación "death" no puede repetirse: la secuencia de muerte necesita un final');
  }
  return problems;
}

function isPositiveInt(value: unknown): boolean {
  return Number.isInteger(value) && (value as number) > 0;
}

function isLoadSpec(load: unknown): load is AssetLoadSpec {
  return checkLoadSpec(load).length === 0;
}

/**
 * Escala con la que se dibuja el pixel art: celda lógica / tile base
 * (32 / 16 = 2). Sale del propio manifest, no de un número mágico, y es
 * entera para que los píxeles se vean nítidos (contrato v0.2).
 */
export function artScale(manifest: AssetManifest): number {
  const { logical_cell_px, base_tile_px } = manifest.visual_spec;
  return Math.max(1, Math.floor(logical_cell_px / base_tile_px));
}

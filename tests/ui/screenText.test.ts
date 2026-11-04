import { describe, expect, it } from 'vitest';
import {
  MENU_LINES,
  gameOverLines,
  hudText,
  levelCompleteLines,
  victoryLines,
} from '../../src/presentation/ui/screenText';
import { isRunSummary, type RunSummary } from '../../src/systems/runSummary';
import { GAME_TITLE } from '../../src/core/release';

const run = (over: Partial<RunSummary> = {}): RunSummary => ({
  outcome: 'won',
  gems: 20,
  totalGems: 25,
  gemsRequired: 20,
  hearts: 3,
  maxHearts: 3,
  levelName: 'El Primer Laberinto',
  levelNumber: 1,
  levelCount: 3,
  campaign: { levelIndex: 0, hearts: 3, gemsSoFar: 20 },
  ...over,
});
const texts = (lines: { text: string }[] | readonly { text: string }[]) => lines.map((l) => l.text).join('\n');

describe('HUD', () => {
  const base = { gems: 0, gemsRequired: 20, hearts: 3, maxHearts: 3, exitOpen: false, levelNumber: 2, levelCount: 3 };

  it('muestra recolectadas/20, corazones y cuántas gemas faltan', () => {
    const h = hudText(base);
    expect(h.gems.text).toBe('Nivel 2/3  Gemas: 0/20');
    expect(h.hearts.text).toBe('Corazones: 3/3');
    expect(h.exit.text).toBe('Puerta: faltan 20');
    expect(h.exit.tone).toBe('bad');
  });

  it('refleja el estado real: 2 corazones, 7 gemas', () => {
    const h = hudText({ ...base, gems: 7, hearts: 2 });
    expect(h.gems.text).toBe('Nivel 2/3  Gemas: 7/20');
    expect(h.hearts.text).toBe('Corazones: 2/3');
    expect(h.exit.text).toBe('Puerta: faltan 13');
  });

  it('el último corazón se marca como peligro', () => {
    expect(hudText({ ...base, hearts: 1 }).hearts.tone).toBe('bad');
    expect(hudText({ ...base, hearts: 2 }).hearts.tone).toBe('normal');
  });

  it('con la puerta abierta lo anuncia, y el contador sigue pasando de 20', () => {
    const h = hudText({ ...base, gems: 22, exitOpen: true });
    expect(h.gems.text).toBe('Nivel 2/3  Gemas: 22/20');
    expect(h.gems.tone).toBe('good');
    expect(h.exit.text).toBe('¡Puerta abierta!');
  });
});

describe('Pantallas', () => {
  it('el menú explica objetivo, controles y cómo empezar', () => {
    const t = texts(MENU_LINES);
    expect(t).toMatch(/gemas que pide cada nivel/);
    expect(t).toMatch(/no se recuperan entre niveles/);
    expect(t).toMatch(/WASD o flechas/);
    expect(t).toMatch(/ENTER/);
  });

  it('Game Over muestra las gemas reales y avisa del reinicio', () => {
    const t = texts(gameOverLines(run({ outcome: 'died', gems: 13, hearts: 0 })));
    expect(t).toMatch(/GAME OVER/);
    expect(t).toMatch(/13\/25/);
    expect(t).toMatch(/desde cero, en el Nivel 1/);
    expect(t).toMatch(/Nivel 1\/3: El Primer Laberinto/);
    expect(t).toMatch(/ESC/);
  });

  it('Nivel completado muestra gemas, opcionales y corazones restantes', () => {
    const t = texts(levelCompleteLines(run({ gems: 23, hearts: 2 }), 2));
    expect(t).toMatch(/Gemas: 23\/25 \(\+3 opcionales\)/);
    expect(t).toMatch(/Corazones: 2\/3/);
    expect(t).toMatch(/Escapaste del Nivel 1\/3: El Primer Laberinto/);
  });

  it('si quedan niveles ofrece el siguiente y dice con cuántos corazones entras', () => {
    const t = texts(levelCompleteLines(run({ hearts: 2 }), 2));
    expect(t).toMatch(/siguiente nivel con 2\/3 corazones/);
    expect(t).toMatch(/ENTER o ESPACIO: siguiente nivel/);
  });

  it('en el último nivel ya no hay "siguiente": se continúa a la Victoria', () => {
    const t = texts(levelCompleteLines(run({ levelNumber: 3 }), 3));
    expect(t).not.toMatch(/siguiente nivel/);
    expect(t).toMatch(/continuar/);
  });

  it('la Victoria resume toda la partida', () => {
    const t = texts(victoryLines(run({ levelNumber: 3, hearts: 1, campaign: { levelIndex: 2, hearts: 1, gemsSoFar: 71 } })));
    expect(t).toMatch(/VICTORIA/);
    expect(t).toMatch(/3 niveles/);
    expect(t).toMatch(/Gemas en toda la partida: 71/);
    expect(t).toMatch(/Corazones al final: 1\/3/);
  });

  it('sin gemas opcionales no muestra el "+0"', () => {
    expect(texts(levelCompleteLines(run(), 3))).not.toMatch(/opcionales/);
  });

  it('los textos dicen "partida", no "run" (decisión de Fernando, 2026-11-04)', () => {
    const all = [
      texts(MENU_LINES),
      texts(gameOverLines(run({ outcome: 'died' }))),
      texts(levelCompleteLines(run(), 3)),
      texts(levelCompleteLines(run({ levelNumber: 3 }), 3)),
      texts(victoryLines(run({ levelNumber: 3 }))),
    ]
      .join('\n')
      .replaceAll(GAME_TITLE, ''); // el nombre del juego ("Search and Run") sí lleva "Run"
    expect(all).not.toMatch(/\brun\b/i);
    expect(all).toMatch(/partida/);
  });
});

describe('RunSummary', () => {
  it('acepta un resumen válido', () => {
    expect(isRunSummary(run())).toBe(true);
  });

  it('rechaza datos vacíos o con forma incorrecta', () => {
    expect(isRunSummary(undefined)).toBe(false);
    expect(isRunSummary({})).toBe(false);
    expect(isRunSummary({ ...run(), outcome: 'paused' })).toBe(false);
    expect(isRunSummary({ ...run(), gems: -1 })).toBe(false);
    expect(isRunSummary({ ...run(), hearts: '3' })).toBe(false);
    expect(isRunSummary({ ...run(), levelNumber: 4 })).toBe(false);
    expect(isRunSummary({ ...run(), campaign: undefined })).toBe(false);
  });

  it('al morir no exige una campaña que continúe (0 corazones)', () => {
    expect(isRunSummary(run({ outcome: 'died', hearts: 0, campaign: { levelIndex: 0, hearts: 0, gemsSoFar: 3 } }))).toBe(true);
  });
});

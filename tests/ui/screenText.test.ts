import { describe, expect, it } from 'vitest';
import {
  MENU_LINES,
  gameOverLines,
  hudText,
  levelCompleteLines,
} from '../../src/presentation/ui/screenText';
import { isRunSummary, type RunSummary } from '../../src/systems/runSummary';

const run = (over: Partial<RunSummary> = {}): RunSummary => ({
  outcome: 'won',
  gems: 20,
  totalGems: 25,
  gemsRequired: 20,
  hearts: 3,
  maxHearts: 3,
  ...over,
});
const texts = (lines: { text: string }[] | readonly { text: string }[]) => lines.map((l) => l.text).join('\n');

describe('HUD', () => {
  const base = { gems: 0, gemsRequired: 20, hearts: 3, maxHearts: 3, exitOpen: false };

  it('muestra recolectadas/20, corazones y cuántas gemas faltan', () => {
    const h = hudText(base);
    expect(h.gems.text).toBe('Gemas: 0/20');
    expect(h.hearts.text).toBe('Corazones: 3/3');
    expect(h.exit.text).toBe('Puerta: faltan 20');
    expect(h.exit.tone).toBe('bad');
  });

  it('refleja el estado real: 2 corazones, 7 gemas', () => {
    const h = hudText({ ...base, gems: 7, hearts: 2 });
    expect(h.gems.text).toBe('Gemas: 7/20');
    expect(h.hearts.text).toBe('Corazones: 2/3');
    expect(h.exit.text).toBe('Puerta: faltan 13');
  });

  it('el último corazón se marca como peligro', () => {
    expect(hudText({ ...base, hearts: 1 }).hearts.tone).toBe('bad');
    expect(hudText({ ...base, hearts: 2 }).hearts.tone).toBe('normal');
  });

  it('con la puerta abierta lo anuncia, y el contador sigue pasando de 20', () => {
    const h = hudText({ ...base, gems: 22, exitOpen: true });
    expect(h.gems.text).toBe('Gemas: 22/20');
    expect(h.gems.tone).toBe('good');
    expect(h.exit.text).toBe('¡Puerta abierta!');
  });
});

describe('Pantallas', () => {
  it('el menú explica objetivo, controles y cómo empezar', () => {
    const t = texts(MENU_LINES);
    expect(t).toMatch(/20 gemas/);
    expect(t).toMatch(/WASD o flechas/);
    expect(t).toMatch(/ENTER/);
  });

  it('Game Over muestra las gemas reales y avisa del reinicio', () => {
    const t = texts(gameOverLines(run({ outcome: 'died', gems: 13, hearts: 0 })));
    expect(t).toMatch(/GAME OVER/);
    expect(t).toMatch(/13\/25/);
    expect(t).toMatch(/desde cero/);
    expect(t).toMatch(/ESC/);
  });

  it('Nivel completado muestra gemas, opcionales y corazones restantes', () => {
    const t = texts(levelCompleteLines(run({ gems: 23, hearts: 2 })));
    expect(t).toMatch(/Gemas: 23\/25 \(\+3 opcionales\)/);
    expect(t).toMatch(/Corazones: 2\/3/);
  });

  it('sin gemas opcionales no muestra el "+0"', () => {
    expect(texts(levelCompleteLines(run()))).not.toMatch(/opcionales/);
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
  });
});

import type Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import type { GridPoint, Level } from '../world/LevelTypes';
import { cellCenter, cellToWorld } from '../world/gridMath';

/**
 * TEMP: dibuja el nivel con formas geométricas simples para poder VER los datos.
 * No es arte del juego: en la Fase 8 se sustituye por el tileset y los sprites
 * externos (manifest.json) sin tocar `world/` ni las reglas.
 *
 * Por eso vive en `presentation/`: recibe un `Level` ya validado y solo pinta.
 * Gameplay → datos; presentación → cómo se ven esos datos.
 */
const TEMP_COLORS = {
  floor: 0x111111,
  wall: 0x555566,
  gem: 0xffd23f,
  exitClosed: 0xcc3333,
  hunter: 0xff4444,
  patrol: 0xff9933,
  patrolRoute: 0x996633,
} as const;

const CELL = GRID.cellSize;

export function renderTempLevel(scene: Phaser.Scene, level: Level): void {
  const g = scene.add.graphics();

  // Suelo y paredes: un rectángulo por celda.
  level.cells.forEach((row, y) => {
    row.forEach((cell, x) => {
      const { x: px, y: py } = cellToWorld({ x, y });
      g.fillStyle(cell === 'wall' ? TEMP_COLORS.wall : TEMP_COLORS.floor, 1);
      g.fillRect(px, py, CELL, CELL);
    });
  });

  // Ruta del Patrol (línea de depuración entre waypoints, en bucle).
  g.lineStyle(2, TEMP_COLORS.patrolRoute, 1);
  for (const patrol of level.patrols) {
    patrol.waypoints.forEach((from, i) => {
      const to = patrol.waypoints[(i + 1) % patrol.waypoints.length]!;
      const a = cellCenter(from);
      const b = cellCenter(to);
      g.lineBetween(a.x, a.y, b.x, b.y);
    });
  }

  // Gemas: cuadrados pequeños.
  g.fillStyle(TEMP_COLORS.gem, 1);
  for (const gem of level.gems) {
    const c = cellCenter(gem);
    g.fillRect(c.x - 5, c.y - 5, 10, 10);
  }

  // Salida (cerrada al empezar): marco rojo.
  const exit = cellToWorld(level.exit);
  g.lineStyle(3, TEMP_COLORS.exitClosed, 1);
  g.strokeRect(exit.x + 3, exit.y + 3, CELL - 6, CELL - 6);
  addLetter(scene, level.exit, 'E', TEMP_COLORS.exitClosed);

  // Enemigos: círculos con su letra del mapa ASCII. Son solo marcadores de
  // posición inicial; su movimiento llega en la Fase 5. El jugador ya no se
  // dibuja aquí: tiene su propia vista (TempPlayerView) porque se mueve.
  for (const h of level.hunters) drawMarker(scene, g, h, TEMP_COLORS.hunter, 'H');
  for (const p of level.patrols) drawMarker(scene, g, p.start, TEMP_COLORS.patrol, 'T');
}

function drawMarker(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  point: GridPoint,
  color: number,
  letter: string,
): void {
  const c = cellCenter(point);
  g.fillStyle(color, 1);
  g.fillCircle(c.x, c.y, CELL / 2 - 4);
  addLetter(scene, point, letter, 0x000000);
}

function addLetter(scene: Phaser.Scene, point: GridPoint, letter: string, color: number): void {
  const c = cellCenter(point);
  scene.add
    .text(c.x, c.y, letter, {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: `#${color.toString(16).padStart(6, '0')}`,
    })
    .setOrigin(0.5);
}

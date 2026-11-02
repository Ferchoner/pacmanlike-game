import type Phaser from 'phaser';
import { GRID } from '../core/GameConstants';
import type { Level } from '../world/LevelTypes';
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
  hunterHome: 0x663333,
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

  // Las gemas y la puerta ya NO se dibujan aquí: cambian durante la partida
  // (desaparecen / se abre), así que tienen sus propias vistas
  // (TempGemsView, TempExitView). Este archivo pinta solo lo que no cambia.

  // Enemigos: desde la Fase 5 se mueven y tienen su propia vista
  // (TempEnemyView). Aquí solo queda un aro fino en la "casa" de cada Hunter,
  // la celda a la que vuelve cuando deja de perseguir (ayuda a depurar).
  g.lineStyle(1, TEMP_COLORS.hunterHome, 1);
  for (const h of level.hunters) {
    const c = cellCenter(h);
    g.strokeCircle(c.x, c.y, CELL / 2 - 3);
  }
}

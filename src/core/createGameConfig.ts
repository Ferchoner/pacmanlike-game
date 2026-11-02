import Phaser from 'phaser';
import { BACKGROUND_COLOR, VIEW } from './GameConstants';
import { BootScene } from '../scenes/BootScene';
import { PreloadScene } from '../scenes/PreloadScene';
import { MenuScene } from '../scenes/MenuScene';
import { GameScene } from '../scenes/GameScene';
import { GameOverScene } from '../scenes/GameOverScene';

/**
 * Construye la configuración de Phaser. Separarla de `main.ts` deja claro
 * qué decide el motor (renderizado, escalado, física) y qué arranca el juego.
 */
export function createGameConfig(parent: string): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO, // WebGL si el navegador lo soporta; si no, Canvas.
    parent,
    width: VIEW.width,
    height: VIEW.height,
    backgroundColor: BACKGROUND_COLOR,
    // pixelArt desactiva el suavizado al escalar: el pixel art se ve nítido.
    pixelArt: true,
    scale: {
      // FIT agranda o reduce el juego para llenar la ventana sin deformarlo.
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      // Arcade es la física simple de Phaser (cajas y círculos): basta para
      // un laberinto. Se activará de verdad en la Fase 3.
      default: 'arcade',
      arcade: { debug: false },
    },
    // La primera escena de la lista es la que arranca.
    scene: [BootScene, PreloadScene, MenuScene, GameScene, GameOverScene],
  };
}

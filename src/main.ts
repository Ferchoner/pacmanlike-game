import Phaser from 'phaser';
import { createGameConfig } from './core/createGameConfig';

// Punto de entrada: Vite carga este archivo desde index.html.
new Phaser.Game(createGameConfig('game'));

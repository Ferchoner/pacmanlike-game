import Phaser from 'phaser';
import { axisFromKeys, type DirectionInput } from '../systems/movement';

/**
 * Adaptador de entrada: traduce el teclado de Phaser (flechas y WASD) a una
 * `DirectionInput`. Es la ÚNICA parte del movimiento que conoce Phaser; si
 * mañana añadimos mando, solo se escribe otro adaptador como este.
 */
export class KeyboardPlayerInput {
  private readonly keys: Record<'up' | 'down' | 'left' | 'right' | 'w' | 'a' | 's' | 'd', Phaser.Input.Keyboard.Key>;

  constructor(keyboard: Phaser.Input.Keyboard.KeyboardPlugin) {
    const K = Phaser.Input.Keyboard.KeyCodes;
    this.keys = {
      up: keyboard.addKey(K.UP),
      down: keyboard.addKey(K.DOWN),
      left: keyboard.addKey(K.LEFT),
      right: keyboard.addKey(K.RIGHT),
      w: keyboard.addKey(K.W),
      a: keyboard.addKey(K.A),
      s: keyboard.addKey(K.S),
      d: keyboard.addKey(K.D),
    };
  }

  read(): DirectionInput {
    const k = this.keys;
    return {
      x: axisFromKeys(k.left.isDown || k.a.isDown, k.right.isDown || k.d.isDown),
      y: axisFromKeys(k.up.isDown || k.w.isDown, k.down.isDown || k.s.isDown),
    };
  }
}

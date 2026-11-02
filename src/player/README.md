# player

Jugador: estado y movimiento (Fase 3). Sin ataque, arma ni Dash en el MVP.

| Archivo | Para qué |
|---|---|
| `Player.ts` | Modelo del jugador sin Phaser: posición (centro del cuerpo), `facing`, `moving` y `update(input, dt)`. |
| `KeyboardPlayerInput.ts` | Adaptador Phaser: flechas + WASD → `DirectionInput`. Única pieza que conoce el teclado. |

El dibujo provisional está en `presentation/TempPlayerView.ts` (TEMP).

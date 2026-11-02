# systems

Sistemas de reglas independientes: movimiento, colisiones, daño, recolección, progresión, IA y HUD (Fases 3–7).
No importan Phaser para poder probarlos con Vitest.

| Archivo | Para qué |
|---|---|
| `movement.ts` | Teclas → dirección → velocidad con la diagonal normalizada. |
| `wallCollision.ts` | Colisión de un cuerpo cuadrado con las paredes de la rejilla: ejes separados (deslizarse por el muro), sin atravesar paredes y asistencia en esquinas. Reutilizable por enemigos. |

# systems

Sistemas de reglas independientes: movimiento, colisiones, daño, recolección, progresión, IA y HUD (Fases 3–7).
No importan Phaser para poder probarlos con Vitest.

| Archivo | Para qué |
|---|---|
| `movement.ts` | Teclas → dirección → velocidad con la diagonal normalizada. |
| `wallCollision.ts` | Colisión de un cuerpo cuadrado con las paredes de la rejilla: ejes separados (deslizarse por el muro), sin atravesar paredes y asistencia en esquinas. Reutilizable por enemigos. |
| `overlap.ts` | ¿Se solapan dos cajas (AABB)? Base de la recogida de gemas y del toque a la puerta (y luego del daño por contacto). |
| `gemCollection.ts` | Qué gemas se recogieron; cada una cuenta una sola vez. Devuelve los índices recogidos en este fotograma. |
| `playerHealth.ts` | Corazones e invulnerabilidad: un contacto resta 1 corazón, luego 0.8 s sin daño; con 0, muerto. Devuelve eventos (`damaged`, `died`). |
| `levelProgress.ts` | Máquina de estados de la puerta (cerrada → abierta con 20 gemas → nivel completado al tocarla). Devuelve eventos que la escena traduce a vista y HUD. |

# enemies

Hunter (persigue) y Patrol (recorre waypoints), Fase 5. Comportamiento separado de su presentación
(`presentation/TempEnemyView.ts`). Sin Phaser: todo se prueba con Vitest (`tests/enemies/`).

| Archivo | Para qué |
|---|---|
| `GridWalker.ts` | Movimiento de centro a centro de celdas vecinas. Los enemigos solo "piensan" al llegar a un centro, y nunca eligen una pared. |
| `Patrol.ts` | Recorre su circuito de waypoints en bucle; no persigue (MVP). |
| `Hunter.ts` | Máquina de estados `idle → chasing → returning → idle`; detecta por distancia de pasillo, con histéresis (detecta a 5 pasos, se rinde a más de 8). |
| `EnemyGroup.ts` | Crea los enemigos desde los datos del nivel, los actualiza y responde `touching` (lo usa el daño, `systems/playerHealth`). |

El "camino" sale de `world/distanceField.ts`: un BFS que anota cuántos pasos hay desde cada celda
hasta un objetivo. Para acercarse, basta con ir a la vecina con menos pasos.

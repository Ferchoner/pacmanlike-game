# world

Carga, validación y construcción del nivel a partir de datos (Fase 2). El mapa nunca se escribe a mano en `GameScene`.

Flujo: `data/levels/level1.json` → `parseMap` (lee el ASCII) → `validateLevel` (comprueba, no corrige) → `loadLevel` (devuelve un `Level` listo o lanza `LevelValidationError`).

| Archivo | Para qué |
|---|---|
| `LevelTypes.ts` | Tipos: `GridPoint`, `LevelDefinition` (lo que hay en el JSON) y `Level` (lo que usa el juego). |
| `parseMap.ts` | Leyenda del ASCII (`#` pared, `.` suelo, `P`, `H`, `T`, `E`, `g`) y lectura del mapa. |
| `validateLevel.ts` | Dimensiones, borde, entidades vs tablas, gemas, waypoints, conectividad (BFS). Errores bloquean; avisos no. |
| `gridSearch.ts` | BFS (¿qué es alcanzable?) y utilidades de celdas. |
| `distanceField.ts` | BFS con distancias: cuántos pasos hay a un objetivo desde cada celda. Navegación de Hunter y Patrol (Fase 5). |
| `gridMath.ts` | Conversión celda ↔ píxeles (celda = 32 px). |
| `loadLevel.ts` | Valida y construye el `Level`. |
| `tiled/tiledToLevel.ts` | Traduce un mapa JSON de Tiled al mismo `LevelDefinition` (luego pasa por `validateLevel` como cualquier nivel). |
| `tiled/levelToTiled.ts` | Lo inverso: genera la copia de referencia del Nivel 1 para Tiled. |
| `tiled/TiledTypes.ts` | Los campos del JSON de Tiled que leemos. |

Guía para crear niveles: `docs/08_niveles/GUIA_CREACION_NIVELES.md`.

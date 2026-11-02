# Auditoría del mapa — Nivel 1 (Blueprint v0.1)

> **Fase:** 0 — Auditoría
> **Fecha:** 2026-11-02
> **Archivo auditado:** `MAPA_NIVEL_1_APROBADO.txt` (sin modificar)
> **Resultado:** sin discrepancias. El mapa puede usarse tal cual para la Fase 2.

## Comprobaciones

| Comprobación | Esperado | Encontrado | Estado |
|---|---|---|---|
| Dimensiones | 24×18 | 24 columnas × 18 filas, todas las filas de 24 | OK |
| Borde | cerrado | filas 0 y 17 y columnas 0 y 23 son `#` | OK |
| Jugador `P` | (2,2) | (2,2) | OK |
| Hunters `H` | (6,5), (12,9) | (6,5), (12,9) | OK |
| Patrol `T` | (18,12) | (18,12) | OK |
| Salida `E` | (21,15) | (21,15) | OK |
| Gemas `g` | 25, según tabla | 25, coinciden 1:1 con la tabla declarada | OK |
| Waypoints Patrol | transitables | (17,12), (21,12), (21,14), (17,14) son suelo, sin paredes entre ellos | OK |
| Conectividad | todo conectado | 311 celdas de suelo, todas alcanzables desde el inicio (BFS 4 direcciones) | OK |
| Acceso a ≥20 gemas | ≥20 | las 25 gemas y la salida son alcanzables | OK |

Coordenadas en formato (x, y), origen (0,0) en la esquina superior izquierda.

## Observaciones de diseño (no son errores, no se cambió nada)

1. **El circuito del Patrol pasa por encima de dos gemas**, (17,13) y (21,13). Recogerlas
   obliga a cruzar su ruta. Puede ser intencional (zona "ruta de riesgo").
2. **Hunter1 está a 7 celdas del inicio** (distancia Manhattan). Si su rango de detección es
   amplio, la "zona de inicio segura" deja de serlo. El rango aún está pendiente de definir.
3. **Los pasillos miden 1 celda (32 px).** El cuerpo de colisión del jugador y de los enemigos
   debe ser menor a 32 px para que el movimiento continuo no se atasque en las esquinas.

## Decisiones que siguen pendientes

Rango de detección del Hunter, cámara fija o con seguimiento, valores finales de velocidad e
invulnerabilidad, y dimensiones reales de los sprites (dependen del proveedor de arte).

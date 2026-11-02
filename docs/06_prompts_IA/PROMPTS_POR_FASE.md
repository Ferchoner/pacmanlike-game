# Prompts por fase

## Fase 0 --- Auditoría

Lee todo el paquete, valida el mapa sin modificarlo y presenta plan.
Espera aprobación.

## Fase 1 --- Fundación

Crea proyecto Phaser 4 + TypeScript + Vite, scripts, estructura modular
y README. No implementar mecánicas aún. Ejecuta build y explica.

## Fase 2 --- Mundo y datos

Implementa validador y carga de datos del nivel. No hardcodear mapa en
GameScene. Validar mapa y esperar aprobación si hay discrepancias.

## Fase 3 --- Jugador

Movimiento continuo, WASD/flechas, diagonal normalizada y colisión con
paredes. Velocidad configurable. Pruebas.

## Fase 4 --- Gemas y salida

Recolección única, HUD counter, umbral 20, puerta bloqueada/desbloqueada
y finalización al tocarla. Pruebas.

## Fase 5 --- Enemigos

Hunter y Patrol con navegación que respete paredes. Configuración
separada de comportamiento y presentación.

## Fase 6 --- Daño y reinicio

3 corazones, daño por contacto, invulnerabilidad configurable, Game Over
y reinicio completo.

## Fase 7 --- UI y escenas

Menú mínimo, HUD, Game Over y nivel completado. UI refleja estado real.

## Fase 8 --- Recursos externos

Inspecciona archivos y manifest. No inventes metadatos. Implementa
loaders, AnimationManager y AudioManager. Reporta incompatibilidades
antes de convertir.

## Fase 9 --- Pruebas/publicación

Build de producción, controles, resolución, assets, audio, rendimiento y
paquete HTML5 para itch.io. Documenta publicación; no publiques sin
permiso.

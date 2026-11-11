# Search and Run

Juego 2D top-down arcade de laberinto con ambientación de fantasía medieval, para un jugador
(nombre de trabajo original: PAC-BIG-MAN). Un guerrero sin ataque recoge gemas, evita monstruos y
escapa por una puerta que se abre al reunir las gemas que pide cada nivel. Son 3 niveles con 3
corazones para toda la aventura; si los pierdes todos, vuelves a empezar desde el primero.

Stack: **Phaser 4** (motor) + **TypeScript** estricto + **Vite** (servidor de desarrollo y build) + **Vitest** (pruebas).
La documentación de diseño, recursos y reglas de trabajo vive en [`docs/`](docs/README.md).

## Requisitos

- Node.js 22.18 o superior y npm (los scripts de `tools/` son TypeScript y Node los ejecuta directamente).
- [Tiled](https://www.mapeditor.org/) solo si vas a dibujar niveles.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias (solo la primera vez o al cambiar `package.json`). |
| `npm run dev` | Arranca el servidor de desarrollo con recarga automática (normalmente en http://localhost:5173). Con `?nivel=<id>` en la URL empiezas en ese nivel. |
| `npm run build` | Revisa los tipos con TypeScript y genera la versión publicable en `dist/`. |
| `npm run preview` | Sirve `dist/` para probar el build tal como se publicará. |
| `npm test` | Ejecuta las pruebas una vez. |
| `npm run test:watch` | Ejecuta las pruebas cada vez que guardas un archivo. |
| `npm run typecheck` | Solo revisa los tipos, sin generar build. |
| `npm run level:check -- <archivo.json>` | Traduce (si es de Tiled) y valida un nivel desde la terminal. |
| `npm run level:export-nivel1` | Regenera `tiled/mapas/nivel1_referencia.json` desde el Nivel 1 original. |
| `npm run package:itch` | Build + revisión de publicación; crea el .zip para itch.io en `release/` solo si no hay bloqueos. |
| `npm run package:itch:beta` | Igual, pero admite el arte temporal y el audio que falta como aviso (versión beta). |
| `npm run package:itch:prueba` | Con bloqueos, crea un .zip de PRUEBA (no publicar). |

## Estructura

```
index.html            Página que carga el juego
src/
  main.ts             Punto de entrada: crea el Phaser.Game
  core/               Configuración del motor, constantes, nombre del juego y etapa (beta/final)
  scenes/             Boot → Preload → Menu → Game → LevelComplete → … → Victory / GameOver
  player/             Jugador
  enemies/            Hunter y Patrol
  world/              Carga y validación de niveles; traductor de Tiled (world/tiled/)
  systems/            Movimiento, colisiones, daño, recolección, progresión y campaña
  presentation/       Vistas (sprites o TEMP), AnimationManager y AudioManager
  data/               Valores de ajuste (gameTuning.ts) y registro de niveles (levels/index.ts)
tests/                Pruebas con Vitest
tiled/                Proyecto de Tiled, plantilla y mapas de la campaña (tiled/mapas/)
tools/levels/         level:check y exportación del Nivel 1 a Tiled
tools/release/        Revisión de publicación y empaquetado para itch.io
assets/source/        Originales de los recursos externos (no se modifican)
public/assets/        Recursos preparados para cargar (rutas en docs/03_recursos/manifest.json)
.github/workflows/    CI: tipos, pruebas, mapas y build en cada PR
```

## Estado (2026-11-11)

| Entrega | Qué quedó |
|---|---|
| Fase 0: auditoría | Mapa del Nivel 1 (Blueprint v0.1) auditado sin discrepancias. |
| Fase 1: fundación | Proyecto base y flujo de escenas. |
| Fase 2: mundo y datos | Niveles cargados desde datos y validados (`src/world/validateLevel.ts`); si un nivel tiene errores, se muestran en pantalla. |
| Fase 3: jugador | Movimiento continuo con flechas o WASD, diagonal normalizada y colisión con paredes. |
| Fase 4: gemas y salida | Recogida única, contador en el HUD, puerta que se abre con las gemas requeridas y se completa al tocarla. |
| Fase 5: enemigos | Hunter (persigue respetando paredes) y Patrol (recorre su ruta). |
| Fase 6: daño y reinicio | Tocar un enemigo resta un corazón, 0.8 s de invulnerabilidad y empujón; con 0 corazones, Game Over y reinicio completo. |
| Fase 7: UI y escenas | Menú, HUD, Game Over, Nivel completado y secuencia de muerte antes del Game Over. |
| Fase 8: recursos externos | Carga desde `manifest.json`; 14 recursos de uso temporal (`temp-dev`). Guía: [`GUIA_INTEGRACION_RECURSOS.md`](docs/03_recursos/GUIA_INTEGRACION_RECURSOS.md). |
| Fase 9: publicación | `npm run package:itch`; beta 0.1.0-beta.1 (un solo nivel) subida a [itch.io](https://ferchoner77.itch.io/search-and-run) el 2026-11-03. Segunda beta **0.2.0-beta.1** (campaña de 3 niveles) en validación: [`CHECKLIST_VALIDACION_BETA_2.md`](docs/07_publicacion/CHECKLIST_VALIDACION_BETA_2.md). Guía: [`PUBLICACION_ITCHIO.md`](docs/07_publicacion/PUBLICACION_ITCHIO.md). |
| Niveles con Tiled | Traductor, `level:check` y guía: [`GUIA_CREACION_NIVELES.md`](docs/08_niveles/GUIA_CREACION_NIVELES.md). |
| Campaña | Comienzo de las mazmorras → Las Catacumbas → La Sala del Guardián → Victoria. |
| Mantenimiento | Nombre Search and Run, CI en GitHub, matriz de recursos al día y documentación revisada. |

Falta para la versión final: arte definitivo, el audio (SFX P0 R-020 a R-023) y el icono del
contador de gemas (R-016). La segunda beta (0.2.0-beta.1, con los 3 niveles) se valida con
[`CHECKLIST_VALIDACION_BETA_2.md`](docs/07_publicacion/CHECKLIST_VALIDACION_BETA_2.md).

En el menú, ENTER, ESPACIO o clic inician. En el juego: flechas/WASD mueven y B (solo con
`npm run dev`) muestra el cuerpo de colisión. Entre niveles, ENTER o ESPACIO siguen. En Game Over o
Victoria, ENTER o ESPACIO empiezan una partida nueva y ESC vuelve al menú.

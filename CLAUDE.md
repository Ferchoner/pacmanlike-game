# CLAUDE.md — Search and Run

Guía para Claude (y cualquier IA) que trabaje en este repositorio. **Responde siempre en español.**
El responsable está aprendiendo desarrollo de videojuegos: explica las decisiones de forma didáctica;
eres copiloto y tutor, no sustituto de sus decisiones.

## Qué es

**Search and Run** (nombre de trabajo original: PAC-BIG-MAN). Juego 2D top-down arcade de laberinto,
fantasía medieval, un jugador. Un guerrero sin ataque recoge gemas, evita monstruos (Hunter y Patrol)
y escapa por una puerta que se desbloquea con las gemas requeridas de cada nivel. Campaña de 3 niveles
y pantalla de Victoria. Objetivo: un juego pequeño, completo y publicable en itch.io.

## Stack

Phaser 4 + TypeScript (modo estricto) + Vite, navegador HTML5. Git/GitHub.

## Fuente de verdad (leer antes de trabajar)

Toda la documentación vive en `docs/`. Si algo aquí contradice `docs/`, gana `docs/`.

- `docs/01_contexto/CONTEXTO_MAESTRO.md` — decisiones aprobadas, provisionales y pendientes.
- `docs/02_diseno/GDD_REFERENCIA.md`, `ESPECIFICACION_NIVEL_1.md`, `MAPA_NIVEL_1_APROBADO.txt`.
- `docs/02_diseno/AUDITORIA_MAPA_NIVEL_1.md` — resultado de la Fase 0.
- `docs/03_recursos/CONTRATO_TECNICO_RECURSOS_v0.2.md`, `MATRIZ_RECURSOS.csv/.xlsx`, `manifest.json`.
- `docs/05_control/` — checklist de recepción y registro de licencias.
- `docs/06_prompts_IA/REGLAS_DE_TRABAJO_IA.md` y `PROMPTS_POR_FASE.md` (fases 0–9).
- `docs/07_publicacion/` — publicación en itch.io y checklist de pruebas.
- `docs/08_niveles/GUIA_CREACION_NIVELES.md` — cómo crear niveles con Tiled.

## Reglas no negociables

1. **No crear, generar, redibujar ni sustituir** arte, sprites, escenarios, animaciones, música o SFX.
   Todo es externo. Solo placeholders técnicos, marcados `TEMP` y reemplazables.
2. **No modificar el mapa Blueprint v0.1 ni sus coordenadas** sin aprobación humana. Si encuentras
   discrepancias, infórmalas y propone alternativas; no corrijas en silencio.
3. **No ampliar el alcance del MVP** (combate, Dash, inventario, etc. están fuera) sin aprobación.
4. **No inventar** licencias, proveedores, dimensiones, índices de frames ni metadatos.
5. **No sobrescribir originales.** Originales en `assets/source/`, preparados para carga en
   `public/assets/`. Las rutas se declaran en `manifest.json`, no hardcodeadas.

## Arquitectura esperada

- Carpetas en `src/`: `core`, `scenes`, `player`, `enemies`, `world`, `systems`, `presentation`, `data`.
- Escenas: Boot, Preload, Menu, Game, GameOver (y LevelComplete si conviene).
- Sistemas separados: movimiento, colisiones, daño, recolección, progresión, IA, HUD.
  `AnimationManager` y `AudioManager` separados de la lógica.
- Niveles data-driven: el mapa se carga y valida desde datos, nunca hardcodeado en `GameScene`.
- Separar gameplay de presentación; evitar una `GameScene` monolítica; módulos pequeños.
- Separar tamaño visual del sprite y cuerpo de colisión (los pasillos miden 1 celda = 32 px).

## Valores clave

Grid 24×18, celda lógica 32×32 px (768×576), tiles visuales 16×16 (2×2 por celda). Campaña
(`src/data/levels/index.ts`): Comienzo de las mazmorras (30/25 gemas), Las Catacumbas (35/28) y
La Sala del Guardián (40/33); en cada nivel sobran entre 5 y 8 gemas. Tocar la puerta abierta
completa el nivel. 3 corazones para toda la run, sin curarse entre niveles; morir reinicia la run
desde el primer nivel.
Provisionales (deben ser configurables): jugador 160 px/s, Hunter 120 px/s, invulnerabilidad 0.8 s.
El Nivel 1 original (Blueprint v0.1, `level1.json`: 25/20) es solo referencia histórica.

## Forma de trabajar

- Por fases pequeñas (ver `PROMPTS_POR_FASE.md`): objetivo, alcance, propuesta, archivos,
  implementación incremental, pruebas, explicación didáctica, resumen y siguiente decisión.
- Para funcionalidades grandes usa el flujo spec-driven: `/spec` crea la spec en `specs/` y
  `/spec-impl` implementa una spec con estado Aprobado.
- Antes de declarar una fase terminada: ejecuta build y pruebas, e informa archivos modificados,
  resultados, riesgos y siguiente paso. La CI de GitHub (`.github/workflows/ci.yml`) lo repite en cada PR.
- Al cerrar una fase, revisa qué documentos de `docs/` y el `README.md` quedaron desfasados.
- La matriz de recursos (.csv y .xlsx) se mantiene **a mano**; si cambias un estado en el manifest,
  cambia también la matriz (`tests/presentation/resourceMatrix.test.ts` lo comprueba).

## Comandos

- `npm install` — instalar dependencias.
- `npm run dev` — servidor de desarrollo (Vite).
- `npm run build` — `tsc --noEmit` + build de producción en `dist/`.
- `npm test` — pruebas con Vitest (`tests/**/*.test.ts`).
- `npm run typecheck` — solo comprobación de tipos.
- `npm run level:check -- <archivo.json>` — traduce (si es de Tiled) y valida un nivel desde la terminal.
- `npm run level:export-nivel1` — regenera `tiled/mapas/nivel1_referencia.json` (copia de referencia).
- `npm run package:itch` / `:beta` / `:prueba` — build + revisión de publicación + .zip para itch.io.
  Publicar lo hace Fernando, solo con su permiso.

Niveles nuevos: se dibujan en Tiled (`tiled/`) siguiendo `docs/08_niveles/GUIA_CREACION_NIVELES.md`.
Todos los niveles de la campaña viven en `tiled/mapas/`; `src/data/levels/level1.json` (Blueprint v0.1)
solo se conserva como referencia y para las pruebas del traductor.

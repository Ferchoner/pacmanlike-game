# CLAUDE.md — PAC-BIG-MAN

Guía para Claude (y cualquier IA) que trabaje en este repositorio. **Responde siempre en español.**
El responsable está aprendiendo desarrollo de videojuegos: explica las decisiones de forma didáctica;
eres copiloto y tutor, no sustituto de sus decisiones.

## Qué es

Juego 2D top-down arcade de laberinto, fantasía medieval, un jugador. Un guerrero sin ataque recoge
gemas, evita monstruos (Hunter y Patrol) y escapa por una puerta que se desbloquea con 20 de 25 gemas.
Objetivo: un juego pequeño, completo y publicable en itch.io.

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

## Valores clave del Nivel 1

Grid 24×18, celda lógica 32×32 px (768×576), tiles visuales 16×16 (2×2 por celda). 25 gemas,
20 requeridas; tocar la puerta abierta completa el nivel. 3 corazones; morir reinicia toda la run.
Provisionales (deben ser configurables): jugador 160 px/s, Hunter 120 px/s, invulnerabilidad 0.8 s.

## Forma de trabajar

- Por fases pequeñas (ver `PROMPTS_POR_FASE.md`): objetivo, alcance, propuesta, archivos,
  implementación incremental, pruebas, explicación didáctica, resumen y siguiente decisión.
- Para funcionalidades grandes usa el flujo spec-driven: `/spec` crea la spec en `specs/` y
  `/spec-impl` implementa una spec con estado Aprobado.
- Antes de declarar una fase terminada: ejecuta build y pruebas, e informa archivos modificados,
  resultados, riesgos y siguiente paso.

## Comandos

- `npm install` — instalar dependencias.
- `npm run dev` — servidor de desarrollo (Vite).
- `npm run build` — `tsc --noEmit` + build de producción en `dist/`.
- `npm test` — pruebas con Vitest (`tests/**/*.test.ts`).
- `npm run typecheck` — solo comprobación de tipos.

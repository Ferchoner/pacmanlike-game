# Search and Run --- Contexto maestro

> Nombre público decidido por Fernando el 2026-11-04. El nombre de trabajo
> original era "PAC-BIG-MAN"; algunos documentos históricos lo conservan.

## Identidad y objetivo

Videojuego 2D top-down de acción/supervivencia/laberinto arcade,
ambientación de fantasía medieval. Un jugador. Plataforma inicial
navegador HTML5 y publicación objetivo itch.io. Stack: Phaser 4,
TypeScript, Vite y Git/GitHub. El objetivo es crear un juego pequeño,
completo y publicable mientras el responsable aprende desarrollo de
videojuegos. La IA es copiloto y tutor, no sustituto de las decisiones
del usuario.

## Concepto y ciclo

Un guerrero comienza sin armadura ni arma y no puede atacar. Explora
laberintos infestados de monstruos, recoge gemas suficientes para
desbloquear una salida y debe alcanzar físicamente la puerta sin morir.
Ciclo: entrar → explorar → recoger gemas → evitar/sobrevivir →
desbloquear puerta → llegar a puerta → completar nivel. Inspiraciones
generales: laberintos arcade, recolección y fantasía medieval de acción.
No copiar personajes, mapas, arte, música, nombres ni elementos
protegidos de otras obras.

## Decisiones aprobadas

-   Salud inicial: 3 corazones.
-   Sin ataque, arma, armadura ni Dash en Nivel 1.
-   Movimiento continuo, WASD/flechas, cuatro direcciones y diagonal
    normalizada.
-   Paredes bloquean el movimiento.
-   Nivel 1: 25 gemas disponibles; 20 requeridas para desbloquear la
    salida.
-   Las gemas se recogen una sola vez. No son moneda en el MVP.
-   Abrir la puerta no completa el nivel: el jugador debe tocarla.
-   Sin límite de tiempo ni checkpoints.
-   Muerte reinicia toda la partida desde Nivel 1; pierde gemas y
    progreso.
-   Dos arquetipos: Hunter (persigue) y Patrol (recorre waypoints);
    ambos dañan por contacto.
-   Invulnerabilidad tras daño propuesta: 0.8 s, provisional.
-   Velocidad propuesta: jugador 160 px/s y Hunter 120 px/s,
    provisionales.
-   Dash es una habilidad futura, no de Nivel 1.
-   Campaña de varios niveles (aprobado por Fernando el 2026-11-04):
    Comienzo de las mazmorras → Las Catacumbas → La Sala del Guardián →
    pantalla de Victoria. Los corazones se arrastran entre niveles sin
    curar (configurable: `carryHeartsBetweenLevels`); las gemas empiezan
    en 0 en cada nivel. Morir reinicia la run desde el primer nivel.
    Todos los mapas viven en Tiled (`tiled/mapas/`). El primer nivel es
    el rediseño de Fernando del Nivel 1; el Blueprint v0.1 de abajo queda
    como referencia histórica y ya no está en la campaña.
-   Nombre del juego: **Search and Run** (Fernando, 2026-11-04), en el
    menú, en el build, en los créditos y en itch.io.
-   Fase de mantenimiento antes de publicar otra versión (Fernando,
    2026-11-04): de momento no se publica; faltan detalles del juego.
-   La matriz de recursos se mantiene a mano (Fernando, 2026-11-04). Una
    prueba (`tests/presentation/resourceMatrix.test.ts`) avisa si no
    coincide con el manifest en IDs, prioridad o estado.

## Recursos externos: decisión obligatoria

Todo el arte, diseño visual, personajes, escenarios, sprites,
animaciones, música y efectos de sonido serán proporcionados
externamente. La IA solo programa e integra. No crear, rediseñar,
generar ni sustituir contenido audiovisual. Placeholders técnicos
temporales solo para desarrollo, claramente marcados TEMP y
reemplazables. No sobrescribir originales.

Decisiones de recursos: origen mixto (gratuito, comercial y encargado);
pixel art base 16×16 px; animaciones en spritesheets. Mapa lógico:
celdas de 32×32 px, cada celda equivale a 2×2 tiles de 16×16 px.

## Nivel 1 --- El Primer Laberinto

-   Cuadrícula 24×18; celda lógica 32×32 px; tamaño lógico 768×576 px.
-   25 gemas, 20 requeridas.
-   2 Hunters y 1 Patrol.
-   3 corazones, una salida, sin tiempo límite ni checkpoints.
-   Zonas didácticas: inicio seguro, exploración, primer peligro, zona
    central, ruta de riesgo y salida.

### Mapa ASCII aprobado --- no modificar

``` text
########################
#......................#
#.P.g.g.#..g.....gg.g..#
#.......#....g.#.......#
#..g.g.........#.#.##..#
#.....H.#.g............#
#.##.####...g.g#.....g.#
#.......#......#.......#
#..g....####.###..g.g..#
#....g..#...H..#.......#
#.........g..g.####.##.#
#.......#..............#
#..##.#.#......#..T....#
#.......#......#.g.g.g.#
#...g..................#
#.....g....g...#.....E.#
#......................#
########################
```

Coordenadas declaradas (x,y; origen 0,0): jugador (2,2), Hunter1 (6,5),
Hunter2 (12,9), Patrol (18,12), salida (21,15). Waypoints Patrol:
(17,12) → (21,12) → (21,14) → (17,14) → repetir. Gemas declaradas: Y2
X4,6,11,17,18,20; Y3 X13; Y4 X3,5; Y5 X10; Y6 X12,14,21; Y8 X3,18,20; Y9
X5; Y10 X10,13; Y13 X17,19,21; Y14 X4; Y15 X6,11. Total declarado 25.

**Validación pendiente obligatoria:** comprobar dimensiones, índices,
correspondencia entre `g` y lista de gemas, coordenadas de entidades,
waypoints transitables, conectividad y acceso a 20 gemas. No corregir
silenciosamente. Informar discrepancias y proponer Blueprint v0.2 para
aprobación humana.

## Arquitectura de referencia

Phaser 4 + TypeScript + Vite. Separar core, scenes, player, enemies,
world, systems, presentation y data. Escenas sugeridas Boot, Preload,
Menu, Game y GameOver (y LevelComplete si conviene). Sistemas separados
para movimiento, colisiones, daño, recolección, progresión, IA y HUD.
AnimationManager y AudioManager separados. Niveles data-driven, no
hardcodeados en GameScene. TypeScript estricto; evitar GameScene
monolítica.

## Pendientes

Estado al 2026-11-04:

-   Arte definitivo: hoy hay 14 recursos de uso temporal (`temp-dev`,
    válidos para la beta, no para la versión final).
-   Audio: no hay ninguno. Faltan los SFX P0 R-020 (gema), R-021 (daño),
    R-022 (muerte) y R-023 (puerta), y el icono del contador de gemas
    R-016.
-   FPS de las animaciones: provisionales (idle 6, walk 10, daño 12,
    muerte 4) hasta tener el arte definitivo.
-   Balance: valores definitivos de velocidad, detección e
    invulnerabilidad; densidad de enemigos y gemas por nivel.
-   Mezcla de audio, cuando llegue el audio.
-   Cámara: hoy fija (el mapa cabe en 768×576); revisar si un nivel
    futuro es más grande.

## Principio rector

Primero una versión pequeña, completa, comprensible y publicable. No
añadir alcance sin explicar impacto y pedir aprobación.

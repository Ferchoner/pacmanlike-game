# PAC-BIG-MAN

Juego 2D top-down arcade de laberinto con ambientación de fantasía medieval, para un jugador.
Un guerrero sin ataque recoge gemas, evita monstruos y escapa por una puerta que se abre con 20 de 25 gemas.

Stack: **Phaser 4** (motor) + **TypeScript** estricto + **Vite** (servidor de desarrollo y build) + **Vitest** (pruebas).
La documentación de diseño, recursos y reglas de trabajo vive en [`docs/`](docs/README.md).

## Requisitos

- Node.js 20.19 o superior (probado con Node 22) y npm.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala las dependencias (solo la primera vez o al cambiar `package.json`). |
| `npm run dev` | Arranca el servidor de desarrollo con recarga automática (normalmente en http://localhost:5173). |
| `npm run build` | Revisa los tipos con TypeScript y genera la versión publicable en `dist/`. |
| `npm run preview` | Sirve `dist/` para probar el build tal como se publicará. |
| `npm test` | Ejecuta las pruebas una vez. |
| `npm run test:watch` | Ejecuta las pruebas cada vez que guardas un archivo. |
| `npm run typecheck` | Solo revisa los tipos, sin generar build. |

## Estructura

```
index.html            Página que carga el juego
src/
  main.ts             Punto de entrada: crea el Phaser.Game
  core/               Configuración del motor, constantes técnicas y claves de escena
  scenes/             Boot → Preload → Menu → Game → GameOver
  player/             Jugador (Fase 3)
  enemies/            Hunter y Patrol (Fase 5)
  world/              Carga y validación del nivel desde datos (Fase 2)
  systems/            Movimiento, colisiones, daño, recolección, progresión, IA, HUD
  presentation/       Placeholders TEMP; AnimationManager y AudioManager (Fase 8)
  data/               Valores de ajuste y datos de niveles
tests/                Pruebas con Vitest
assets/source/        Originales de los recursos externos (no se modifican)
public/assets/        Recursos preparados para cargar (rutas en docs/03_recursos/manifest.json)
```

## Estado

- Fase 1 (fundación): proyecto base y flujo de escenas con textos `TEMP`.
- Fase 2 (mundo y datos): el Nivel 1 se carga desde `src/data/levels/level1.json`, se valida
  (`src/world/validateLevel.ts`) y se dibuja con formas `TEMP`. Si el nivel tuviera errores, la
  escena de juego los muestra en pantalla en vez de dibujarlo.
- Fase 3 (jugador): movimiento continuo con flechas o WASD, diagonal normalizada y colisión con
  paredes (`src/systems/`). Velocidad, tamaño del cuerpo de colisión y asistencia en esquinas son
  configurables en `src/data/gameTuning.ts`.
- Fase 6 (daño y reinicio): tocar un enemigo resta un corazón (`src/systems/playerHealth.ts`),
  luego 0.8 s de invulnerabilidad (el jugador parpadea). Con 0 corazones llega el Game Over y la
  siguiente partida empieza de cero.

En el menú, ENTER inicia. En la escena de juego: flechas/WASD mueven y B (TEMP) muestra el cuerpo de
colisión. En Game Over o nivel completado, ENTER vuelve al menú.

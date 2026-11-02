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

Fase 1 (fundación): proyecto base y flujo de escenas con textos `TEMP`, sin mecánicas.
En el menú, ENTER inicia; en la escena de juego, ESC (atajo TEMP) lleva a Game Over; ENTER vuelve al menú.

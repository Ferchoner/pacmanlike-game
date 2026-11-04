# Checklist de pruebas de la Fase 9

Resultado de las pruebas del 2026-11-03 sobre el paquete de PRUEBA
(`npm run package:itch:prueba`), descomprimido y servido dentro de un `<iframe>` de 768×576 que
imita la página de itch.io, con Chromium sin GPU (Playwright).

> **Actualización 2026-11-04 (fase de mantenimiento).** Lo de abajo es el resultado del
> 2026-11-03, con un solo nivel. Hoy, sobre la campaña de 3 niveles: `npm run typecheck` sin
> errores, `npm test` con 27 archivos y 227 pruebas en verde, build correcto (JS 1,45 MB, 380 kB
> gzip), los 4 mapas de `tiled/mapas/` válidos con `level:check` y prueba de humo en Chromium sin
> errores. Desde ahora la CI de GitHub (`.github/workflows/ci.yml`) repite lo automático en cada
> PR. **Las pruebas manuales siguen pendientes** y conviene hacerlas con la campaña completa
> antes de la próxima publicación.

Leyenda: ✅ comprobado · ⚠️ comprobado con observaciones · ⬜ pendiente (manual, en navegador real).

## Automático (lo repite `npm test` o `npm run package:itch`)

| Área | Resultado |
|---|---|
| Tipos (`npm run typecheck`) | ✅ sin errores |
| Pruebas (`npm test`) | ✅ 23 archivos, 180 pruebas (9 nuevas de la revisión de publicación) |
| Build de producción | ✅ `index.html` 0.43 kB + JS 1.42 MB (374 kB gzip); Phaser es casi todo el peso |
| Rutas relativas en `index.html` | ✅ |
| Archivos del manifest presentes en `dist/` (mayúsculas exactas) | ✅ los 11 archivos de los 14 recursos temp-dev |
| Límites de itch.io | ✅ 12 archivos, 1.38 MB sin comprimir, 0.39 MB comprimido |
| Recursos | ⚠️ **bloquea**: 14 `temp-dev` y faltan 5 P0 (R-016, R-020…R-023) |

## En navegador (iframe tipo itch.io)

| Área | Resultado |
|---|---|
| Carga sin errores | ✅ 0 errores, 0 peticiones fallidas (incluido `Blood Monster_A_Walk.png`, con espacio en el nombre) |
| Aviso de consola esperado | ✅ `[recursos] USO TEMPORAL (no publicar así): …` |
| Controles: ENTER inicia, flechas y WASD mueven | ✅ |
| Foco del teclado en el iframe | ✅ Phaser toma el foco al arrancar; tras hacer clic fuera, un clic en el juego lo recupera |
| Recoger gemas y HUD | ✅ el contador y "Puerta: faltan N" se actualizan |
| Daño, corazones y Game Over | ✅ 3 golpes → secuencia de muerte → Game Over con el resumen real |
| Reinicio completo | ✅ ENTER en Game Over → partida nueva con 0/25 gemas y 3 corazones |
| Resolución 768×576 (embed) | ✅ escala ×1 exacta |
| Resolución 1920×1080 y 1366×768 (fullscreen) | ⚠️ centrado y sin barras de scroll; escala no entera (1.875 y 1.333): píxeles ligeramente desiguales |
| Pantalla pequeña 667×375 | ⚠️ se ve (escala 0.65) pero no hay controles táctiles: marcar *no mobile friendly* |
| Rendimiento | ⚠️ ~50 FPS, peor fotograma 33 ms, 16 MB de memoria JS **sin GPU** (renderizado por software). No es representativo: comprobar en un navegador real (ver abajo) |
| Audio | ⚠️ no hay recursos de audio; `AudioManager` funciona en silencio sin errores |

## Manual pendiente (Fernando, en un navegador real)

Lo más sencillo: `npm run build` y luego `npm run preview` (sirve `dist/` en http://localhost:4173).
Para probar exactamente el .zip, súbelo como proyecto **Draft** (privado) a itch.io.

- ⬜ Chrome y Firefox: el juego carga, ENTER/ESPACIO/clic inician.
- ⬜ Completar cada nivel (gemas requeridas → tocar la puerta), pasar al siguiente y llegar a la Victoria tras el nivel 3.
- ⬜ Morir y comprobar el reinicio completo.
- ⬜ Rendimiento: en Chrome, F12 → *Performance* o *Rendering → Frame rendering stats*. Esperado:
  60 FPS estables (o la frecuencia de tu monitor).
- ⬜ Pantalla completa con el botón de itch.io y volver.
- ⬜ Cuando llegue el audio: que suene tras el primer ENTER, y que no se dupliquen sonidos.

## Decisiones de Fernando (2026-11-03)

- **Herramientas de desarrollo ocultas en producción.** El pie "TEMP: UI provisional" y la tecla B
  (hitbox) solo existen con `npm run dev`; en `npm run build` desaparecen (`src/core/devTools.ts`).
  Comprobado: el texto ya no está en el JS del build.
- **Escalado en pantalla completa: se acepta la escala no entera** de `Scale.FIT`. En el embed de
  768×576 sigue siendo ×1 exacta.

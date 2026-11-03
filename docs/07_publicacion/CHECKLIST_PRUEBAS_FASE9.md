# Checklist de pruebas de la Fase 9

Resultado de las pruebas del 2026-11-03 sobre el paquete de PRUEBA
(`npm run package:itch:prueba`), descomprimido y servido dentro de un `<iframe>` de 768×576 que
imita la página de itch.io, con Chromium sin GPU (Playwright).

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
- ⬜ Completar el nivel (20 gemas → tocar la puerta) y ver "Nivel completado".
- ⬜ Morir y comprobar el reinicio completo.
- ⬜ Rendimiento: en Chrome, F12 → *Performance* o *Rendering → Frame rendering stats*. Esperado:
  60 FPS estables (o la frecuencia de tu monitor).
- ⬜ Pantalla completa con el botón de itch.io y volver.
- ⬜ Cuando llegue el audio: que suene tras el primer ENTER, y que no se dupliquen sonidos.

## Decisiones pendientes para Fernando antes de publicar

- **Textos TEMP visibles.** "TEMP: UI provisional" al pie de los menús y la tecla B que muestra el
  hitbox. Son herramientas de desarrollo: ¿se quitan para la versión publicada? (Propuesta: ocultarlos
  automáticamente en el build de producción.)
- **Escalado en pantalla completa.** ¿Se acepta la escala no entera, o prefieres escala entera
  (×1, ×2…) con bordes negros más anchos? Cambia cómo se ve, por eso es tu decisión.

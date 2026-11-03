# Publicación en itch.io (Fase 9)

> **Estado al 2026-11-03: NO publicable.** Hay 14 recursos `temp-dev` (arte gratuito sin licencia
> registrada) y faltan 5 recursos P0 (R-016 icono del contador de gemas y los SFX R-020…R-023).
> `npm run package:itch` lo comprueba y se niega a crear el paquete final mientras sea así.
> Publicar es decisión de Fernando: este documento prepara el camino, no publica nada.

## 1. Cómo funciona un juego HTML5 en itch.io

itch.io no "ejecuta" tu proyecto: sirve archivos estáticos. Subes un `.zip` con un `index.html` en
la raíz y itch.io lo muestra dentro de un `<iframe>` (una página dentro de su página). Por eso:

- **Rutas relativas.** El juego no vive en la raíz del dominio sino en una subcarpeta. Una ruta
  `/assets/x.png` buscaría en la raíz de itch.io y fallaría. `vite.config.ts` usa `base: './'`
  desde la Fase 1, y la revisión de publicación lo vuelve a comprobar.
- **Mayúsculas.** En Windows `Tiles.png` y `tiles.png` son el mismo archivo; en el servidor de
  itch.io no. La revisión compara las rutas del manifest con `dist/` de forma exacta.
- **Límites del .zip** ([documentación de itch.io](https://itch.io/docs/creators/html5)):
  máximo 1000 archivos, 500 MB descomprimido, 200 MB por archivo y rutas de 240 caracteres.
  Hoy estamos en 12 archivos y ~1.4 MB (0.39 MB comprimido).

## 2. Generar el paquete

| Comando | Qué hace |
|---|---|
| `npm run package:itch` | Build + revisión. Si no hay bloqueos, crea `release/pac-big-man-v<versión>-html5.zip`. Si los hay, los lista y termina con error. |
| `npm run package:itch:prueba` | Igual, pero con bloqueos crea `release/…-PRUEBA-NO-PUBLICAR.zip` para probar en local o en un borrador privado. |

Requiere Node 22.18 o superior: el script está en TypeScript (`tools/release/packageItch.ts`) y Node
lo ejecuta directamente quitando los tipos.

La revisión (`tools/release/releaseCheck.ts`, con pruebas en `tests/release/`) separa:

- **Bloqueos** (impiden publicar): recursos `temp-dev`, recursos P0 que faltan, errores del
  manifest, falta `index.html`, rutas absolutas, archivo del manifest que no está en `dist/`,
  límites de itch.io superados.
- **Avisos** (se puede publicar): recursos P1/P2 que faltan y archivos de `public/` que el manifest
  no usa. Esos archivos **no se meten en el .zip**: no tiene sentido distribuir arte que el juego no
  carga (y cuya licencia tampoco está registrada). Hoy son 10: `Round_LBs_8x8.png`, `autotiles.*`,
  `player/16x16 *` (incluidos los `.aseprite`) y `tiles.txt`.

`release/` está en `.gitignore`: el .zip se regenera cuando haga falta, no se versiona.

## 3. Antes de publicar (lista de Fernando)

1. Sustituir cada recurso `temp-dev` por uno aprobado (ver `docs/03_recursos/GUIA_INTEGRACION_RECURSOS.md`)
   y registrar su licencia en `docs/05_control/REGISTRO_LICENCIAS.csv`.
2. Integrar los recursos P0 que faltan: R-016 (icono del contador de gemas) y los SFX R-020 a R-023.
3. Si alguna licencia exige atribución, preparar el texto de créditos (para la página de itch.io y,
   si se decide, una pantalla de créditos en el juego: eso sería alcance nuevo y necesita aprobación).
4. Revisar que no quede nada marcado `TEMP` en pantalla. El pie "TEMP: UI provisional" y la tecla B
   del hitbox ya se ocultan solos en el build de producción (`src/core/devTools.ts`).
5. Subir `version` en `package.json` si corresponde y ejecutar `npm test` y `npm run package:itch`
   sin bloqueos.
6. Repasar el checklist de pruebas manuales en un navegador real (Chrome y Firefox como mínimo).

## 4. Configuración recomendada en itch.io

En *Dashboard → Create new project* (puedes dejarlo en **Draft** para probar sin que sea público):

| Campo | Valor recomendado | Por qué |
|---|---|---|
| Kind of project | **HTML** | Juego para navegador. |
| Uploads | el `.zip` y marcar **This file will be played in the browser** | itch.io busca `index.html` dentro. |
| Embed options | **Embed in page**, viewport **768 × 576** | Es el tamaño lógico del juego: escala ×1 exacta, el pixel art se ve nítido. |
| Fullscreen button | **Activado** | El juego ya se adapta a cualquier tamaño (`Scale.FIT`). |
| Mobile friendly | **Desactivado** | El juego solo tiene controles de teclado. |
| Automatically start on page load | **Desactivado** (dejar *Click to play*) | El clic da el foco del teclado al juego y permite que el audio arranque (los navegadores bloquean el sonido sin interacción). |
| Scrollbars | Desactivadas | El juego cabe en el viewport. |

Para probar sin publicar: deja el proyecto en **Draft** (solo tú lo ves) o usa **Restricted** con
contraseña. Pasarlo a **Public** es el paso que no se deshace del todo (otras personas pueden
descargarlo); hazlo solo cuando el paso 3 esté completo.

## 5. Notas técnicas comprobadas en la Fase 9

- **Foco del teclado en el iframe.** Phaser llama a `window.focus()` al arrancar y en cada clic
  (`autoFocus`, activado por defecto). Si la persona hace clic fuera del juego, las teclas dejan de
  llegar hasta que vuelve a hacer clic dentro. Es el comportamiento normal de itch.io.
- **Escalado.** `Scale.FIT` mantiene la proporción 4:3. En fullscreen la escala no es entera (por
  ejemplo 1.875 en 1920×1080), así que algunos píxeles se ven un poco más anchos que otros; Fernando
  lo aceptó el 2026-11-03. En el embed a 768×576 la escala es exactamente 1.
- **Audio.** Hoy no hay audio (`AudioManager` funciona en silencio). Cuando llegue, Phaser lo
  desbloquea con la primera tecla o clic; como el menú siempre pide ENTER o clic, no hace falta nada
  extra.

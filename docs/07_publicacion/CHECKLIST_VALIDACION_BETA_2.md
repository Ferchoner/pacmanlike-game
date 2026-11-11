# Validación de la segunda beta (0.2.0-beta.1)

Proceso para dar por buena la **segunda versión beta** de Search and Run: la campaña de 3 niveles
con el arte temporal de terceros. Sigue el mismo estilo que
[`CHECKLIST_PRUEBAS_FASE9.md`](CHECKLIST_PRUEBAS_FASE9.md) (la primera beta, de un solo nivel).

Leyenda: ✅ comprobado · ⚠️ comprobado con observaciones · ⬜ pendiente · ❌ falla (bloquea la firma).

## 0. Qué es esta versión

| Dato | Valor |
|---|---|
| Versión (`package.json`) | `0.2.0-beta.1` (la primera beta fue `0.1.0-beta.1`) |
| .zip | `release/search-and-run-v0.2.0-beta.1-html5.zip` (`npm run package:itch:beta`) |
| Campaña | Comienzo de las mazmorras (30 gemas / 25 requeridas, 2 Hunter, 2 Patrol) → Las Catacumbas (35/28, 3 Hunter, 3 Patrol) → La Sala del Guardián (40/33, 4 Hunter, 3 Patrol) → Victoria |
| Reglas | 3 corazones para toda la partida, sin curarse entre niveles; morir reinicia desde el primer nivel; tocar la puerta abierta completa el nivel |
| Arte | 14 recursos `temp-dev` de terceros (ver `CREDITOS.txt` dentro del .zip) |
| Sin audio | Faltan los SFX P0 R-020…R-023; el juego funciona en silencio |
| Cambios desde la primera beta | Campaña de 3 niveles (PR #13), mantenimiento y nombre Search and Run (PR #14), detalles de UI (PR #15), limpieza de `public/` y aviso `GEM_SURPLUS` (PR #16), ruta del Patrol de Catacumbas (PR #17) y una pared abierta en La Sala del Guardián (celda x=19, y=5; este PR) |

**¿Por qué subir el número de versión?** Para no tener dos juegos distintos con el mismo número.
Si alguien te escribe "en la 0.1.0-beta.1 pasa X", así sabes que habla de la versión de un nivel.
Seguimos [versionado semántico](https://semver.org/lang/es/): el segundo número (`0.2.0`) sube
porque hay contenido nuevo (la campaña) y `-beta.1` dice que sigue siendo una beta.

## 1. Preparar (una vez)

1. Fusionar el PR de esta versión en `main` y, en tu PC, `git checkout main` y `git pull`.
2. `npm install` (por si cambió alguna dependencia).
3. Confirmar que `git status` está limpio: lo que pruebas debe ser exactamente lo que está en `main`.

## 2. Pruebas automáticas (las repite la CI en cada PR)

| Paso | Comando | Se espera | Resultado (2026-11-11) |
|---|---|---|---|
| Tipos | `npm run typecheck` | sin errores | ✅ |
| Pruebas | `npm test` | todo en verde | ✅ 28 archivos, 233 pruebas |
| Mapas | `npm run level:check -- tiled/mapas/<mapa>.json` (los 4) | `✔ Nivel válido.` en cada uno, todas las gemas alcanzables | ✅ los 4 (La Sala del Guardián: 243 celdas de suelo, 40/40 gemas alcanzables) |
| Paquete | `npm run package:itch:beta` | crea el .zip; solo avisos, ningún bloqueo | ✅ 12 archivos, 1.41 MB sin comprimir, 0.40 MB el .zip |
| Prueba de humo | `npm run preview` y abrir http://localhost:4173 | carga sin errores en la consola (F12) | ✅ en Chromium (Playwright): 0 errores, 0 peticiones fallidas |

Si algo sale ❌ aquí, no sigas: se corrige primero en un PR.

## 3. Pruebas manuales en un navegador real (Fernando)

Hazlas con el build de producción (`npm run build` y `npm run preview`), **no** con `npm run dev`:
en dev aparecen herramientas (tecla B, pie TEMP, `?nivel=`) que el jugador no tendrá.
Repite la sección en **Chrome** y en **Firefox**.

### 3.1 Arranque y menú

- ⬜ El juego carga y el menú se ve entero (ningún texto cortado por los lados).
- ⬜ El menú dice **Search and Run** y muestra las dos líneas del aviso BETA.
- ⬜ ENTER, ESPACIO y clic inician la partida.
- ⬜ No aparece el pie "TEMP: UI provisional" y la tecla B no hace nada (solo existen en dev).

### 3.2 Recorrer la campaña completa (sin morir)

Para cada nivel, anota en la tabla de la sección 6 si pasa:

- ⬜ **Comienzo de las mazmorras:** el HUD muestra `0/25`, la franja negra se ve detrás del HUD,
  la puerta se abre al llegar a 25 gemas y tocarla muestra "Nivel completado".
- ⬜ **Las Catacumbas:** empieza con los corazones que te quedaban (no se curan) y `0/28`; los
  3 Patrol recorren su ruta por los pasillos (ninguno atraviesa paredes ni se queda atascado).
- ⬜ **La Sala del Guardián:** `0/33`; el paso abierto en este PR (fila 6 contando desde arriba,
  columna 20 contando desde la izquierda, en la mitad derecha del mapa) se puede cruzar y ningún enemigo se queda atascado
  en él.
- ⬜ Tras la Sala del Guardián aparece la **Victoria** con el resumen real de la partida.
- ⬜ En Victoria, ENTER/ESPACIO empiezan una partida nueva desde el nivel 1 con 3 corazones;
  ESC vuelve al menú.

### 3.3 Daño, muerte y reinicio

- ⬜ Un golpe resta un corazón, el jugador parpadea ~0.8 s (invulnerable) y recibe un empujón.
- ⬜ Morir en el **nivel 2 o 3**: secuencia de muerte → Game Over con el resumen
  ("Gemas: X/N (había M)") → ENTER reinicia desde **Comienzo de las mazmorras** con 3 corazones
  y 0 gemas.
- ⬜ ESC en Game Over vuelve al menú.

### 3.4 Rendimiento y pantalla

- ⬜ 60 FPS estables (o la frecuencia de tu monitor). En Chrome: F12 → menú ⋮ → *More tools →
  Rendering → Frame rendering stats*.
- ⬜ Ninguna "trampa" de foco: tras hacer clic fuera del juego, un clic dentro devuelve el teclado.

## 4. Prueba en itch.io (como la verá el jugador)

1. Sube el .zip `search-and-run-v0.2.0-beta.1-html5.zip` a la página de itch.io
   (*Edit game → Uploads*), marcado **This file will be played in the browser**. Si quieres
   probar antes sin que nadie lo vea, deja la página en **Draft** o usa la URL secreta de itch.io.
2. Borra o desactiva el .zip de la beta anterior, para que no haya dos jugables.
3. Comprueba en la página publicada:
   - ⬜ Embed 768×576, *Click to run*, sin marcar *Mobile friendly*.
   - ⬜ Carga, se juega con teclado y el botón de pantalla completa funciona (escala no entera
     aceptada, ver la Fase 9).
   - ⬜ La descripción dice que es una **beta**, que **no tiene sonido** y que el arte es
     **temporal de terceros**, con los créditos de `CREDITOS.txt` (texto sugerido en
     [`PUBLICACION_ITCHIO.md`](PUBLICACION_ITCHIO.md), sección 6).
   - ⬜ El .zip no se ofrece como descarga (las licencias no permiten redistribuir los packs).

> **Ojo con la versión que ya subiste.** Si el .zip que está ahora en itch.io lo generaste antes de
> este PR, se llama `…v0.1.0-beta.1…` y su `CREDITOS.txt` dice `0.1.0-beta.1`, aunque ya tenga los
> 3 niveles. Después de fusionar, genera el .zip otra vez y sustitúyelo: así lo publicado y lo que
> hay en `main` coinciden.

## 5. Criterios para firmar

La segunda beta queda **validada** cuando:

1. Toda la sección 2 está ✅.
2. En la sección 3, Chrome y Firefox no tienen ningún ❌. Un ⚠️ se acepta si se anota y no impide
   terminar la campaña.
3. La sección 4 está ✅ en la página real de itch.io.
4. Cualquier fallo encontrado queda anotado en `docs/01_contexto/CONTEXTO_MAESTRO.md`
   ("Detalles a corregir del juego") para la siguiente versión.

**No bloquea esta beta** (ya se sabe y está en los créditos o en los pendientes): el arte temporal,
la falta de audio (R-019…R-025), el icono de gemas (R-016), la UI provisional (R-017, R-018, R-026).
`npm run package:itch` (modo final) seguirá bloqueando por eso: es lo esperado.

## 6. Registro de resultados y firma

| Prueba | Chrome | Firefox | Notas |
|---|---|---|---|
| 3.1 Arranque y menú | ⬜ | ⬜ | |
| 3.2 Comienzo de las mazmorras | ⬜ | ⬜ | |
| 3.2 Las Catacumbas | ⬜ | ⬜ | |
| 3.2 La Sala del Guardián | ⬜ | ⬜ | |
| 3.2 Victoria y partida nueva | ⬜ | ⬜ | |
| 3.3 Daño, muerte y reinicio | ⬜ | ⬜ | |
| 3.4 Rendimiento y foco | ⬜ | ⬜ | |
| 4 Página de itch.io | ⬜ | ⬜ | |

| Firma | |
|---|---|
| Versión validada | `0.2.0-beta.1` |
| Commit de `main` | |
| Fecha | |
| Validada por | Fernando |
| Decisión | ⬜ Publicada · ⬜ Necesita otra beta (`0.2.0-beta.2`) |

Si hace falta corregir algo después de publicar, la siguiente beta con los mismos niveles sería
`0.2.0-beta.2`; si se añade contenido nuevo (otro nivel, audio), `0.3.0-beta.1`.

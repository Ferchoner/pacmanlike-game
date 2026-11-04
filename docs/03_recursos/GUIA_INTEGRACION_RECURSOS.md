# Guía de integración de recursos (Fase 8)

Cómo pasa un archivo de arte o audio de "lo tengo" a "se ve/suena en el juego".
El código ya está preparado: **no hay que tocar código para integrar un recurso**, solo copiar el
archivo y rellenar su entrada en `manifest.json`.

## 1. Flujo para cada recurso

1. Guarda el **original** sin tocar en `assets/source/` (con su licencia o recibo al lado).
2. Copia el archivo preparado para el juego en `public/assets/` (p. ej. `public/assets/audio/gem.ogg`).
   Si hay que convertir formato o recortar, se hace sobre la copia, nunca sobre el original,
   y se anota en `notes`.
3. En `docs/03_recursos/manifest.json`, en la entrada de ese recurso:
   - `path`: ruta **relativa a `public/`** → `"assets/audio/gem.ogg"`.
   - `author_or_vendor`, `source_url`, `license`: datos reales (sin licencia no se carga).
   - `load`: la ficha técnica (ver abajo).
   - `status`: `"approved"` cuando el checklist de `docs/05_control/` esté completo, o
     `"temp-dev"` para un recurso gratuito que solo se usa mientras se desarrolla (ver 6).
4. Registra la licencia en `docs/05_control/REGISTRO_LICENCIAS.csv`.
5. Actualiza **a mano** la fila del recurso en `MATRIZ_RECURSOS.csv` y `MATRIZ_RECURSOS.xlsx`
   (Estado, Proveedor/autor, URL/licencia). Equivalencias: `pending` = Pendiente (o En búsqueda,
   Seleccionado, Recibido, Validando…), `temp-dev` = Uso temporal, `approved` = Aprobado.
   Si se te olvida, `tests/presentation/resourceMatrix.test.ts` falla y dice qué fila no cuadra.
6. `npm test` (valida el manifest y la matriz) y `npm run dev` para verlo. La consola del navegador muestra
   `[recursos] N aprobados · M pendientes` y cualquier error de la ficha.

Mientras un recurso no esté `"approved"`, el juego usa su placeholder TEMP. Si un archivo
aprobado falla al cargar, también vuelve al TEMP y lo dice en consola: el juego nunca se rompe
por un recurso.

## 2. La ficha `load` (campo nuevo de cada entrada)

Solo se rellena con datos del proveedor o medidos en el archivo real. Nada se adivina.

**Imagen suelta** (gema estática, puerta, corazón):

```json
"load": { "kind": "image", "key": "gem" }
```

**Spritesheet** (personajes). `frames` son índices contados por filas desde 0 (arriba a la
izquierda). Puedes revisar los índices abriendo el PNG en un editor con rejilla del tamaño del frame.

```json
"load": {
  "kind": "spritesheet",
  "key": "player",
  "frameWidth": 16,
  "frameHeight": 16,
  "margin": 0,
  "spacing": 0,
  "animations": {
    "idle-down":  { "frames": [0, 1],        "fps": 4,  "loop": true },
    "walk-down":  { "frames": [4, 5, 6, 7],   "fps": 8,  "loop": true },
    "walk-right": { "frames": [8, 9, 10, 11], "fps": 8,  "loop": true },
    "damage":     { "frames": [12, 13],      "fps": 10, "loop": false },
    "death":      { "frames": [16, 17, 18, 19, 20], "fps": 8, "loop": false }
  }
}
```

*(Los números del ejemplo son ilustrativos: hay que poner los del sheet real.)*

**Audio**:

```json
"load": { "kind": "audio", "key": "gem:collected", "volume": 0.8 }
```

`volume` (0 a 1) y `loop` son opcionales; la música (`music:level`) va en bucle por defecto.

Campos opcionales de un spritesheet:

- `actor`: personaje al que pertenecen sus animaciones. Así un personaje puede tener cada
  animación en un PNG distinto (`Soldier_Walk.png`, `Soldier_Death.png`…): cada PNG lleva su
  propia `key` y todos el mismo `actor`.
- `namedFrames`: piezas sueltas con nombre dentro de un sheet grande (tileset, iconos):
  `{ "wall-top": 34, "exit-open": 275 }`. Los índices salen de su documentación (p. ej. `tiles.txt`).
- `scale`: escala entera de dibujo; por defecto ×2. Un tileset de 32 px por celda va a `1`.

### Convenciones que el código espera

| Recurso | Nombre | Notas |
|---|---|---|
| R-001…R-004 Jugador | `actor: "player"` | Animaciones `idle`, `walk`, `damage`, `death` (con o sin dirección). |
| R-005/R-006/R-027 Hunter | `actor: "hunter"` | |
| R-007/R-008 Patrol | `actor: "patrol"` | |
| R-009 Suelo | frame `floor` (+ opcionales `floor-2`, `floor-3`, `floor-4`) | Las piezas del mapa deben estar en el mismo PNG. |
| R-010 Paredes | frames `wall-top` y `wall-side` | `wall-side` = cara frontal, cuando hay suelo justo debajo. |
| R-012 Gema | frame `gem` | |
| R-013 / R-014 Puerta | frames `exit-closed` y `exit-open` | Hacen falta los dos para dejar el TEMP. |
| R-015 Corazones | frames `heart-full` y `heart-empty` | Hacen falta los dos. |

Un "frame" se busca primero en los `namedFrames` de los sheets, y si no, como una imagen suelta
cuya `key` sea ese nombre.
| R-019 Música | `music:level` | |
| R-020…R-024 SFX | el nombre del evento: `gem:collected`, `player:damaged`, `player:died`, `exit:unlocked`, `level:completed` | Igual que la columna `animation_or_event`. |

Nombres de animación: `idle`, `walk`, `damage`, `death`, con o sin dirección (`walk-up`,
`walk-down`, `walk-left`, `walk-right`). Si solo existe `-right`, la izquierda se muestra volteada
(y al revés). Si el sheet es solo de vista lateral, al subir o bajar el personaje sigue mirando
al último lado. Sin `idle`, el personaje se queda quieto en el primer frame de `walk`. `death` no puede
tener `loop: true`, y **su duración (frames / fps) es la duración de la secuencia de muerte**.

## 3. Escala y tamaño

Todo el arte se dibuja a escala entera **×2** (celda lógica 32 px / tile 16 px, sale de
`visual_spec` del manifest). Un personaje de 16×16 ocupa una celda (32 px en pantalla).
Si un recurso llega con otra densidad de píxel (p. ej. un personaje de 32×32), se verá al doble
de lo debido: hay que decidir antes cómo encajarlo, no reescalarlo a escondidas.
Lo que se ve y lo que choca son cosas distintas: el cuerpo de colisión sigue siendo 22 px
(`gameTuning.ts`), sea cual sea el sprite.

## 4. Qué falta para dejar los TEMP (P0)

| ID | Qué necesito | Formato | Tamaño esperado | Datos que hay que traer |
|---|---|---|---|---|
| R-001…R-004 | Spritesheet del guerrero: idle, caminar en 4 direcciones (o derecha + arriba + abajo), daño y **muerte** | PNG con transparencia | Frames de 16×16 (contrato: pixel art base 16) | Tamaño de frame, índices de cada animación, FPS, autor, licencia |
| R-005 | Spritesheet del Hunter caminando | PNG | Frames de 16×16 | Igual que arriba |
| R-007 | Spritesheet del Patrol caminando | PNG | Frames de 16×16 | Igual que arriba |
| R-009 / R-010 | Tileset de mazmorra: suelo y paredes (rectas, esquinas, uniones, extremos) | PNG | Tiles de 16×16 | Qué índice es cada pieza |
| R-012 | Gema | PNG | 16×16 | Si tiene brillo: frames y FPS |
| R-013 / R-014 | Puerta cerrada y abierta | PNG (2 imágenes o un sheet de 2 frames) | 16×16 (si es otro tamaño, avisar antes) | |
| R-015 | Corazón lleno y vacío | PNG | 16×16 | |
| R-016 | Contador de gemas | PNG o fuente | — | Puede seguir siendo texto con la fuente R-026 |
| R-020…R-023 | SFX: gema, daño, muerte, puerta abierta | OGG (preferido) o WAV | Cortos (< 2 s) | Duración, autor, licencia, volumen relativo |

**Nota sobre el tileset (R-009/R-010):** hoy se usa una regla simple de "autotiling": cara
frontal si hay suelo debajo, parte de arriba si no (`presentation/levelTiles.ts`). Un tileset
definitivo con esquinas y uniones permitiría una regla más completa.

Pendiente P1 (no bloquea): R-006, R-008, R-011, R-017, R-018, R-019 (música), R-024. P2: R-025, R-026.

## 5. Notas técnicas

- En `npm run dev`, si un archivo no existe Vite devuelve la página HTML en su lugar, así que el
  error que verás es "Unable to decode audio data" o una imagen rota, no un 404. En el build final
  (itch.io) sí es un 404. En ambos casos el juego sigue con el TEMP.
- El navegador no deja sonar audio hasta el primer clic o tecla. El menú ya pide ENTER o clic,
  así que al empezar la partida el audio ya está desbloqueado.

## 6. Recursos temporales (`temp-dev`), estado al 2026-11-03

Fernando subió recursos **gratuitos sin licencia registrada** para poder desarrollar (decisión
suya del 2026-11-03: "en su momento obtendremos los propios"). Se cargan con `status: "temp-dev"`:
el juego los usa, la consola avisa `USO TEMPORAL (no publicar así)` y una prueba lo comprueba.
**La Fase 9 no puede publicar mientras quede uno.**

| ID | Archivo | Uso |
|---|---|---|
| R-001…R-004 | `player2/Soldier_Idle/Walk/Hurt/Death.png` | Jugador (frames de 100×100, personaje de ~20 px centrado, vista lateral) |
| R-005 / R-027 | `hunter/Orc_Walk.png` / `Orc_Idle.png` | Hunter (caminar / quieto; R-027 es un ID nuevo) |
| R-007 / R-008 | `patrol/Blood Monster_A_Walk.png` / `_Idle.png` | Patrol |
| R-009 / R-010 / R-013 / R-014 | `tiles.png` (tiles de **32×32**, índices de `tiles.txt`) | Suelo 102–105, pared 34 (arriba) y 35 (frente), puerta 274 (cerrada) y 275 (abierta) |
| R-012 / R-015 | `Heart_Drop_Star_16x16.png` | Gema = estrella amarilla completa sin borde (72, elegida por Fernando; no hay gema real); corazones 3 (lleno) y 5 (vacío) |

Los FPS no venían documentados: son **provisionales** (idle 6, caminar 10, daño 12, muerte 4)
y se ajustan cambiando un número en el manifest.

No usados: `player/16x16 *-Sheet.png` (otro estilo, sin daño ni muerte; sus `.aseprite` están
vacíos, 0 bytes), `autotiles.png` (agua y pantano), `Round_LBs_8x8.png` (barras de UI).

Sigue faltando: **todo el audio** (R-019…R-025), R-006, R-011, R-016…R-018, R-026.

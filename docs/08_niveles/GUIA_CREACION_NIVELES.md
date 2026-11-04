# Guía de creación y edición de niveles (Tiled)

Esta guía explica cómo dibujar un nivel nuevo de PAC-BIG-MAN con **Tiled**, comprobar que es
jugable y probarlo en el juego. Está pensada para aprender: cada paso dice **qué** hacer y
**por qué** el juego lo necesita así.

> **El Nivel 1 no se edita con Tiled.** Su mapa es el Blueprint v0.1 aprobado
> (`docs/02_diseno/MAPA_NIVEL_1_APROBADO.txt`) y el juego lo sigue cargando desde
> `src/data/levels/level1.json`. En `tiled/mapas/nivel1_referencia.json` hay una **copia de
> referencia** para que veas cómo luce un nivel real en Tiled; si la modificas, una prueba falla
> a propósito para avisarte.

---

## 1. Cómo funciona por dentro (la idea en un dibujo)

```
 Tiled (.json)  ──tiledToLevel──▶  LevelDefinition  ──validateLevel──▶  loadLevel ──▶ juego
                                   (mismo formato que level1.json)
```

- **Tiled** es solo el editor: tú dibujas paredes y colocas objetos.
- **`tiledToLevel`** (`src/world/tiled/tiledToLevel.ts`) traduce el JSON de Tiled al formato de
  nivel que el juego ya conocía (mapa ASCII + tablas de coordenadas).
- **`validateLevel`** es el mismo validador de la Fase 2: borde cerrado, salida alcanzable,
  gemas suficientes, rutas de Patrol rectas y sin paredes...

Por qué así: el juego tiene **un solo formato de nivel** y **un solo validador**. Tiled es una
forma más cómoda de producir ese formato, no un segundo sistema que mantener.

**Lo que Tiled NO decide: el arte.** La capa de paredes solo dice "aquí hay pared". El aspecto
(qué tile de pared, variantes de suelo) lo sigue eligiendo el juego con su autotiling
(`src/presentation/levelTiles.ts`) y los recursos del `manifest.json`. Por eso el tileset de
Tiled es un cuadro gris **TEMP**: sirve para editar, nunca aparece en el juego.

---

## 2. Instalar Tiled

1. Descarga Tiled desde <https://www.mapeditor.org> (gratis; en itch.io puedes pagar 0).
   Usa la **versión 1.10 o más nueva**: así funcionan las clases de objeto del proyecto.
2. Abre Tiled y elige **File → Open File or Project…** y abre `tiled/pac-big-man.tiled-project`
   (está en la raíz del repositorio).

El archivo de proyecto define las **clases** (`jugador`, `hunter`, `patrol`, `salida`, `gema`,
`ruta`) con un color cada una, así los objetos se distinguen a simple vista y aparecen en una
lista desplegable en vez de tener que escribirlas.

> Si Tiled está en español, los menús se llaman distinto (Archivo, Mapa, Capa...). En esta guía
> se usan los nombres en inglés entre paréntesis cuando ayuda.

---

## 3. Crear un nivel nuevo

1. Copia `tiled/plantilla_nivel.json` a `tiled/mapas/nivel2.json` (o el nombre que quieras) y
   ábrelo en Tiled. La plantilla ya trae:
   - tamaño **24×18 tiles de 32 px** (la pantalla del juego es fija: 768×576);
   - la capa de tiles **`paredes`** con el borde cerrado;
   - la capa de objetos **`entidades`** vacía;
   - el tileset `paredes_TEMP` y las propiedades del mapa.
2. En **Map → Map Properties** revisa las propiedades personalizadas (Custom Properties):

   | Propiedad | Tipo | Para qué |
   |---|---|---|
   | `id` | string | Identificador único, sin espacios. Ej.: `level-2`. |
   | `nombre` | string | Nombre visible. Ej.: `La Cripta`. |
   | `gemasRequeridas` | int | Gemas necesarias para abrir la puerta. |

   Comprueba también que **Orientation = Orthogonal**, **Infinite** desmarcado y
   **Tile Layer Format = CSV** (si eliges Base64 o zlib, el juego no puede leer la capa y te lo dirá).

### 3.1 Pintar las paredes (capa `paredes`)

1. Selecciona la capa `paredes` en el panel **Layers**.
2. Elige el tile gris del tileset y pinta con el **Stamp Brush (B)**; borra con el
   **Eraser (E)**. Para rectángulos grandes, **Rectangular Fill**.
3. Regla: **tile pintado = pared**, **vacío = suelo**. Da igual qué tile uses o si está volteado.

Reglas de diseño que el validador comprobará:
- El **borde** del mapa debe ser todo pared (si no, el jugador se saldría).
- Los **pasillos miden 1 celda** (32 px), igual que en el Nivel 1.
- Todo el suelo debería ser alcanzable desde el inicio del jugador (si no, recibes un aviso).

### 3.2 Colocar las entidades (capa `entidades`)

Selecciona la capa `entidades`. Para cada entidad:
1. Usa **Insert Rectangle (R)** con **View → Snap to Grid** activado y arrastra sobre **una
   celda**, o usa **Insert Point (I)** y haz clic **dentro** de la celda.
2. En el panel **Properties**, en **Class**, elige la clase:

   | Clase | Cuántos | Qué es |
   |---|---|---|
   | `jugador` | exactamente 1 | Dónde empieza el guerrero. |
   | `salida` | exactamente 1 | La puerta; se abre con las gemas requeridas. |
   | `gema` | 1 o más | Una gema recogible. |
   | `hunter` | 0 o más | Enemigo que persigue al jugador. |
   | `patrol` | 0 o más | Enemigo que recorre un circuito fijo (ver 3.3). |

   El campo **Name** es opcional, pero ayuda: los errores lo citan ("Objeto 7 «Hunter norte»").

Cómo se decide la celda de un objeto: la de su **centro** (rectángulos) o la del **punto**. Por
eso conviene no dejar objetos a caballo entre dos celdas.

Reglas: nada sobre una pared, y **nunca dos entidades en la misma celda** (el mapa ASCII interno
solo tiene un símbolo por celda).

### 3.3 Rutas de Patrol (polilínea + referencia)

Un Patrol necesita dos objetos:

1. **La ruta**: con **Insert Polyline (L)** haz clic en el centro de cada esquina del circuito y
   termina con clic derecho o Enter. Ponle la clase **`ruta`**. Cada vértice es un *waypoint*.
   Puedes volver a hacer clic en el primero para cerrar el dibujo; el juego quita ese vértice
   repetido porque el Patrol ya vuelve solo del último al primero.
2. **El Patrol**: un rectángulo o punto de clase **`patrol`** donde aparece. En su propiedad
   **`ruta`** (tipo *object*) haz clic en el selector y luego en la polilínea.

Reglas que comprueba el validador:
- Cada tramo entre dos vértices debe ser **horizontal o vertical** y **sin paredes en medio**.
- El Patrol debería empezar **sobre** su circuito (si no, es un aviso).

¿Por qué una referencia y no "la ruta más cercana"? Porque con dos Patrols cerca el juego no
puede adivinar cuál es de quién. Una referencia explícita no tiene ambigüedad.

### 3.4 Guardar y exportar

Guarda con **Ctrl+S**. Como el archivo es `.json`, Tiled ya guarda en el formato que el juego lee
(no hace falta *Export As*). Si prefieres trabajar en `.tmx`, usa **File → Export As → JSON map**
y guarda el `.json` en `tiled/mapas/`.

---

## 4. Comprobar el nivel (sin abrir el juego)

```bash
npm run level:check -- tiled/mapas/nivel2.json
```

Verás el mapa traducido a ASCII (`#` pared, `.` suelo, `P` jugador, `H` Hunter, `T` Patrol,
`E` salida, `g` gema), las estadísticas y la lista de problemas:

- **✖ error**: el nivel no se puede jugar. Hay que arreglarlo en Tiled.
- **⚠ aviso**: se puede jugar, pero revísalo (gemas inalcanzables, suelo aislado...).

El comando también acepta niveles escritos a mano: `npm run level:check -- src/data/levels/level1.json`.

### Errores frecuentes

| Código | Qué significa | Cómo se arregla |
|---|---|---|
| `TILED_LAYER_MISSING` | No encuentra `paredes` o `entidades`. | Revisa el nombre exacto y que no estén dentro de un grupo. |
| `TILED_LAYER_ENCODING` | La capa está comprimida. | Map Properties → Tile Layer Format = CSV. |
| `TILED_PROPERTY_MISSING` | Falta `id`, `nombre` o `gemasRequeridas`. | Map → Map Properties → Custom Properties. |
| `TILED_OBJECT_NO_CLASS` / `_UNKNOWN_CLASS` | Objeto sin clase o mal escrita. | Elige la clase en el desplegable. |
| `TILED_OBJECT_ON_WALL` | Entidad encima de una pared. | Muévela o borra la pared. |
| `TILED_OBJECT_OVERLAP` | Dos entidades en la misma celda. | Separa una de ellas. |
| `TILED_ROUTE_MISSING` | El Patrol no apunta a su ruta. | Propiedad `ruta` → selecciona la polilínea. |
| `BORDER_OPEN` | Hay un hueco en el borde. | Pinta pared en esa celda. |
| `EXIT_UNREACHABLE` | La salida queda encerrada. | Abre un pasillo hasta ella. |
| `NOT_ENOUGH_REACHABLE_GEMS` | No se alcanzan suficientes gemas. | Baja `gemasRequeridas` o abre pasillos. |
| `WAYPOINT_PATH_BLOCKED` | La ruta de un Patrol cruza una pared. | Mueve los vértices de la polilínea. |

Las coordenadas de los mensajes son **(columna, fila)** de celda, empezando en (0,0) arriba a la
izquierda. En Tiled la celda bajo el ratón aparece en la barra de estado inferior.

---

## 5. Registrar el nivel y jugarlo

1. En `src/data/levels/index.ts`, tradúcelo y añádelo a `LEVELS`. **`LEVELS` es la campaña**: el
   orden de la lista es el orden en que se juegan (así están `comienzo_mazmorras`, `catacumbas` y `sala_del_guardian`):

   ```ts
   import nivel4Tiled from '../../../tiled/mapas/nivel4.json';

   export const LEVEL_4 = tiledToLevel(nivel4Tiled, { source: 'tiled/mapas/nivel4.json' });
   export const LEVELS: readonly LevelDefinition[] = [COMIENZO_MAZMORRAS, CATACUMBAS, SALA_DEL_GUARDIAN, LEVEL_4];
   ```

   Y actualiza la prueba `tests/world/campaignLevels.test.ts`, que resume gemas y enemigos de
   cada nivel: así un cambio en un mapa nunca pasa desapercibido.

2. Arranca el juego en modo desarrollo (`npm run dev`) y abre la URL con `?nivel=<id>`, por ejemplo
   `http://localhost:5173/?nivel=catacumbas`. La run empieza en ese nivel y, al completarlo, sigue con
   el siguiente de la campaña. Ese parámetro **solo funciona en desarrollo**; la versión publicada
   siempre empieza en el Nivel 1.
3. Si algo falla, depende de en qué paso:
   - **Errores de validación** (`BORDER_OPEN`, `EXIT_UNREACHABLE`...): la partida no empieza y la
     pantalla muestra "Nivel inválido (TEMP)" con la lista de problemas.
   - **Errores de traducción** (`TILED_...`): `tiledToLevel` falla al importar el archivo, así
     que **el juego entero no carga** (pantalla vacía, error en la consola del navegador, F12).

   Por eso conviene pasar siempre antes `npm run level:check`, que muestra ambos tipos.
4. Ejecuta `npm test` y `npm run build` antes de hacer commit.

> **Cómo se encadenan los niveles:** al tocar la puerta abierta aparece "Nivel completado" y ENTER
> lleva al siguiente nivel con los corazones que te quedaron (`src/systems/campaign.ts`). Tras el
> último nivel llega la pantalla de Victoria. Morir siempre vuelve al Nivel 1.

---

## 6. Archivos de referencia

| Archivo | Qué es |
|---|---|
| `tiled/pac-big-man.tiled-project` | Proyecto de Tiled con las clases y sus colores. |
| `tiled/plantilla_nivel.json` | Punto de partida para un nivel nuevo. |
| `tiled/mapas/nivel1_referencia.json` | Nivel 1 en Tiled (solo lectura; se regenera con `npm run level:export-nivel1`). |
| `tiled/tilesets/paredes_TEMP.tsx` / `.png` | Tileset técnico TEMP para pintar paredes. |
| `src/world/tiled/tiledToLevel.ts` | Traductor Tiled → nivel del juego. |
| `src/world/tiled/levelToTiled.ts` | Traductor inverso (genera la referencia del Nivel 1). |
| `tools/levels/checkLevel.ts` | El comando `npm run level:check`. |

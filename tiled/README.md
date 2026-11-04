# tiled/

Espacio de trabajo de **Tiled** (https://www.mapeditor.org) para crear niveles.
Guía completa: `docs/08_niveles/GUIA_CREACION_NIVELES.md`.

| Archivo | Qué es |
|---|---|
| `search-and-run.tiled-project` | Ábrelo en Tiled: define las clases `jugador`, `hunter`, `patrol`, `salida`, `gema`, `ruta`. |
| `plantilla_nivel.json` | Cópiala a `mapas/` para empezar un nivel nuevo (24×18, borde cerrado). |
| `mapas/nivel1_referencia.json` | Nivel 1 en formato Tiled. **Solo referencia**: el juego carga `src/data/levels/level1.json`. |
| `tilesets/paredes_TEMP.*` | Tileset técnico **TEMP** (cuadro gris) para pintar paredes. El juego no lo usa: el arte sale del manifest. |

Comprobar un nivel: `npm run level:check -- tiled/mapas/<nivel>.json`

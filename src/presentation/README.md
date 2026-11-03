# presentation

Todo lo visual y sonoro. La lógica del juego no depende de esta carpeta.

Desde la Fase 8 cada vista tiene dos versiones: la de **arte externo** (si el recurso está aprobado en `docs/03_recursos/manifest.json` y se cargó) y la **TEMP**. Una fábrica (`createPlayerView`, `createEnemyView`, `createGemsView`, `createExitView`) elige; la escena no distingue. Cómo integrar un recurso: `docs/03_recursos/GUIA_INTEGRACION_RECURSOS.md`.

| Archivo (Fase 8) | Para qué |
|---|---|
| `assets/assetManifest.ts` | Lee y valida el manifest (puro, con pruebas): listos, faltantes y errores. Solo carga lo `approved` con licencia. |
| `assets/gameAssets.ts` | El manifest real ya revisado y la escala del pixel art (×2). |
| `assets/assetKeys.ts` | Qué clave espera el código para cada papel (jugador, gema, SFX…). |
| `assets/animationChoice.ts` | Elegir animación por acción y dirección, y medir su duración (puro, con pruebas). |
| `AssetLoader.ts` | Encola los recursos aprobados en Preload; si uno falla, se avisa y queda TEMP. |
| `AnimationManager.ts` | Crea las animaciones desde las fichas y avisa si los índices no existen en la imagen. |
| `AudioManager.ts` / `phaserAudio.ts` | Único sitio que reproduce sonido: evento → SFX, música; si falta, silencio. |
| `PlayerView.ts`, `EnemyView.ts`, `PickupViews.ts`, `SpriteActor.ts` | Vistas con sprite y sus fábricas. |
| `LevelView.ts` / `levelTiles.ts` | Mapa con tileset (Tilemap de Phaser); qué pieza va en cada celda (puro, con pruebas). |


| Archivo (todos TEMP) | Para qué |
|---|---|
| `TempLevelRenderer.ts` | Lo que no cambia: suelo, paredes, ruta del Patrol y la "casa" de cada Hunter. |
| `TempEnemyView.ts` | Cada enemigo (círculo + letra); el color del Hunter indica su estado y el borde blanco, contacto con el jugador. |
| `TempPlayerView.ts` | El jugador (círculo + dirección); parpadea durante la invulnerabilidad; B muestra el hitbox (solo en desarrollo). |
| `TempGemsView.ts` | Una forma por gema, para ocultar solo la recogida. |
| `TempExitView.ts` | Puerta cerrada (marco rojo) / abierta (verde). |
| `TempHud.ts` | "Gemas: N/20", "Corazones: N/3" y "Puerta: faltan N" / "¡Puerta abierta!". Se redibuja desde los sistemas reales. |
| `ui/screenText.ts` | Textos de menú, HUD, Game Over y Nivel completado como funciones puras (con pruebas). No es TEMP: es QUÉ se muestra. |
| `ui/uiTheme.ts` | Fuente y colores provisionales; aquí entra la fuente externa (R-026). |
| `ui/TempScreen.ts` | Dibuja una pantalla de texto y conecta ENTER/ESPACIO/ESC (y clic en el menú) con retardo anti-salto. |
| `tempLabel.ts` | Textos técnicos de desarrollo. |

# presentation

Todo lo visual y sonoro: placeholders `TEMP` hoy; `AnimationManager` y `AudioManager` en la Fase 8. La lógica del juego no depende de esta carpeta.

| Archivo (todos TEMP) | Para qué |
|---|---|
| `TempLevelRenderer.ts` | Lo que no cambia: suelo, paredes, ruta del Patrol y la "casa" de cada Hunter. |
| `TempEnemyView.ts` | Cada enemigo (círculo + letra); el color del Hunter indica su estado y el borde blanco, contacto con el jugador. |
| `TempPlayerView.ts` | El jugador (círculo + dirección); parpadea durante la invulnerabilidad; B muestra el hitbox. |
| `TempGemsView.ts` | Una forma por gema, para ocultar solo la recogida. |
| `TempExitView.ts` | Puerta cerrada (marco rojo) / abierta (verde). |
| `TempHud.ts` | "Gemas: N/20", "Corazones: N/3" y "Puerta: faltan N" / "¡Puerta abierta!". Se redibuja desde los sistemas reales. |
| `ui/screenText.ts` | Textos de menú, HUD, Game Over y Nivel completado como funciones puras (con pruebas). No es TEMP: es QUÉ se muestra. |
| `ui/uiTheme.ts` | Fuente y colores provisionales; aquí entra la fuente externa (R-026). |
| `ui/TempScreen.ts` | Dibuja una pantalla de texto y conecta ENTER/ESPACIO/ESC (y clic en el menú) con retardo anti-salto. |
| `tempLabel.ts` | Textos técnicos de desarrollo. |

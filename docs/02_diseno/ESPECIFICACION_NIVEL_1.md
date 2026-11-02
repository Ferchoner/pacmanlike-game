# Nivel 1 --- El Primer Laberinto

-   Grid: 24×18 celdas.
-   Celda lógica: 32×32 px; mapa 768×576 px.
-   Tiles visuales base: 16×16 px, 2×2 por celda.
-   Gemas: 25 disponibles, 20 requeridas.
-   Enemigos: 2 Hunters y 1 Patrol.
-   Jugador: 3 corazones.
-   Salida: 1; sin tiempo límite ni checkpoints.
-   Player (2,2); Hunter1 (6,5); Hunter2 (12,9); Patrol (18,12); Exit
    (21,15).
-   Patrol waypoints: (17,12) → (21,12) → (21,14) → (17,14).
-   Reglas: recoger gemas una vez; 20 desbloquea puerta; tocar puerta
    abierta completa nivel; muerte reinicia run.
-   Validar mapa ASCII y tabla de gemas antes de implementación. No
    corregir automáticamente.

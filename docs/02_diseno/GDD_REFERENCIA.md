# Search and Run --- GDD de referencia v0.2

> v0.2 (2026-11-04): nombre del juego y campaña de 3 niveles. Lo demás
> sigue como en la v0.1, cuando el juego se llamaba "PAC-BIG-MAN".

## Visión y pilares

Juego arcade top-down de fantasía medieval: un guerrero vulnerable
explora laberintos, recoge gemas, evita monstruos y escapa por una
puerta desbloqueable. Pilares: lectura inmediata, vulnerabilidad
inicial, decisiones de ruta, progresión clara y alcance controlado.

## Jugador

3 corazones; movimiento continuo no basado en casillas; WASD/flechas;
cuatro direcciones y diagonal normalizada; paredes bloquean. Sin ataque,
arma, armadura ni Dash en Nivel 1. Velocidad pendiente de balance.

## Gemas y salida

Gemas de recogida única. Cada nivel define cuántas hay y cuántas se
requieren; sobran entre 5 y 8 (regla de Fernando, 2026-11-04). El HUD
muestra recogidas/requeridas del nivel. La puerta inicia cerrada, se abre
al llegar a las requeridas y el nivel solo termina cuando el jugador la
toca.

## Enemigos

Hunter detecta y persigue dentro de rango; debe respetar paredes y
navegación. Patrol sigue waypoints transitables y no persigue en el MVP.
Ambos dañan por contacto.

## Daño y muerte

Contacto válido resta un corazón. Invulnerabilidad posterior propuesta
de 0.8 s, provisional. Los corazones se arrastran entre niveles sin
curarse. A cero corazones: Game Over y reinicio completo desde el primer
nivel de la campaña, 3 corazones, 0 gemas y puerta cerrada.

## Campaña (aprobada 2026-11-04)

Tres niveles de 24×18 celdas lógicas de 32 px, dibujados en Tiled
(`tiled/mapas/`), y una pantalla de Victoria al salir del último:

| Orden | Nivel | Gemas | Requeridas | Hunters | Patrol |
|---|---|---|---|---|---|
| 1 | Comienzo de las mazmorras | 30 | 25 | 2 | 2 |
| 2 | Las Catacumbas | 35 | 28 | 3 | 3 |
| 3 | La Sala del Guardián | 40 | 33 | 4 | 3 |

El Nivel 1 original, "El Primer Laberinto" (Blueprint v0.1: 25 gemas, 20
requeridas, 2 Hunters, 1 Patrol), queda como referencia histórica y ya no
está en la campaña. Una campaña de varios niveles no es "mundos
múltiples": todos comparten reglas, enemigos y ambientación.

## Fuera del MVP

Combate, armas, Dash, inventario, gemas especiales, trampas, NPC,
tiendas, jefes, mundos múltiples, XP, árbol de habilidades y crafting.

## Éxito del MVP

Iniciar, moverse, chocar con paredes, recoger gemas, recibir daño,
evitar enemigos, desbloquear y alcanzar salida, perder/reiniciar y
generar build web publicable.

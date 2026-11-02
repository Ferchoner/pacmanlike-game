# PAC-BIG-MAN --- GDD de referencia v0.1

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

Gemas de recogida única. HUD muestra recolectadas/20. Hay 25 y se
requieren 20. Cinco son opcionales. La puerta inicia cerrada, se abre al
llegar a 20 y el nivel solo termina cuando el jugador la toca.

## Enemigos

Hunter detecta y persigue dentro de rango; debe respetar paredes y
navegación. Patrol sigue waypoints transitables y no persigue en el MVP.
Ambos dañan por contacto.

## Daño y muerte

Contacto válido resta un corazón. Invulnerabilidad posterior propuesta
de 0.8 s, provisional. A cero corazones: Game Over y reinicio completo
desde Nivel 1, 3 corazones, 0 gemas y puerta cerrada.

## Nivel 1

"El Primer Laberinto": 24×18 celdas lógicas de 32 px, 25 gemas, 20
requeridas, 2 Hunters, 1 Patrol y una salida.

## Fuera del MVP

Combate, armas, Dash, inventario, gemas especiales, trampas, NPC,
tiendas, jefes, mundos múltiples, XP, árbol de habilidades y crafting.

## Éxito del MVP

Iniciar, moverse, chocar con paredes, recoger gemas, recibir daño,
evitar enemigos, desbloquear y alcanzar salida, perder/reiniciar y
generar build web publicable.

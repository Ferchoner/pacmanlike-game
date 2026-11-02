# Contrato técnico de recursos v0.2

## Decisiones

Origen mixto (gratuito, comercial adquirido y encargado externamente).
Pixel art base 16×16 px. Spritesheets como estándar. PNG preferido para
gráficos; OGG/MP3/WAV para audio. Celda lógica de mapa 32×32 px = 2×2
tiles visuales.

## Regla no negociable

Todo arte, diseño visual, personajes, escenarios, sprites, animaciones,
música y SFX son externos. La IA programa su carga e integración, pero
no crea, genera, redibuja, compone, anima ni sustituye contenido.
Placeholders técnicos TEMP solo durante desarrollo. Preservar originales
y guardar derivados por separado.

## Resolución y presentación

Mapa Nivel 1: 24×18 celdas = 768×576 px lógicos. Mantener pixel art
nítido y evitar suavizado no deseado. Escalado entero cuando sea viable.
Separar tamaño visual del sprite y cuerpo de colisión. El arte nunca
determina por sí solo colisión o reglas físicas.

## Ficha de spritesheet

Documentar archivo, entidad, dimensiones totales, frame width/height,
filas/columnas, índices/rangos de frames por animación, FPS, loop,
direcciones, márgenes, spacing, origin/anchor, proveedor y licencia. No
inferir secuencias o índices sin documentación. Si se entregan frames
individuales, solicitar spritesheet o registrar excepción aprobada.

## Audio

Documentar formato, duración, frecuencia de muestreo, canales, loop,
volumen relativo, evento asociado, proveedor y licencia. Centralizar
reproducción en AudioManager.

## Manifest y validación

`manifest.json` es inventario técnico central. Validar existencia,
formato, dimensiones, metadatos y licencia antes de aprobar. No
dispersar rutas hardcodeadas.

## Responsabilidad de la IA

Programar loaders, AnimationManager, AudioManager, asociaciones
estado→animación y evento→sonido, gestión de errores y documentación de
faltantes. No sobrescribir originales. Mantener presentación desacoplada
de gameplay.

## Licencias

No incorporar recursos sin procedencia y licencia identificadas.
Verificar permisos de distribución y uso comercial si corresponde;
conservar evidencia de compra/autorización.

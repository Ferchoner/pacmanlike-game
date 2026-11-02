/**
 * Valores de ajuste ("tuning") del juego.
 *
 * Todos son PROVISIONALES según CONTEXTO_MAESTRO.md y están aquí, en un
 * solo lugar, para poder cambiarlos sin tocar la lógica. Los del jugador ya
 * se usan (Fase 3); los de enemigos y daño se conectarán en las fases 5 y 6.
 *
 * Los datos propios de cada nivel (gemas totales, gemas requeridas, posiciones)
 * NO van aquí: viven en los datos del nivel (`src/data/levels/`).
 */
export const GAME_TUNING = {
  /** Corazones al empezar una run (aprobado). */
  startingHearts: 3,
  /** Velocidad del jugador en px/s (provisional). */
  playerSpeed: 160,
  /**
   * Lado del cuerpo de colisión (cuadrado) del jugador, en px (provisional).
   * Debe ser MENOR que la celda (32 px) para que quepa por los pasillos de
   * 1 celda con algo de holgura. No depende del tamaño del sprite.
   */
  playerBodySize: 22,
  /**
   * Asistencia en esquinas, en px (provisional; 0 = desactivada).
   * Si el jugador empuja hacia un pasillo lateral y está desalineado como
   * mucho esta distancia, se le "empuja" suavemente hacia el centro del
   * carril para que entre en vez de quedarse trabado en la esquina.
   */
  cornerAssistPx: 12,
  /** Velocidad del Hunter en px/s (provisional). */
  hunterSpeed: 120,
  /** Invulnerabilidad tras recibir daño, en segundos (provisional). */
  invulnerabilitySeconds: 0.8,
  /**
   * Tope del paso de tiempo por fotograma, en segundos. Si el navegador se
   * congela (cambio de pestaña), el siguiente fotograma traería un `delta`
   * enorme y el jugador "saltaría". Con el tope, como mucho avanza esto.
   */
  maxFrameSeconds: 0.05,
} as const;

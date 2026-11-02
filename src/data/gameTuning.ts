/**
 * Valores de ajuste ("tuning") del juego.
 *
 * Todos son PROVISIONALES según CONTEXTO_MAESTRO.md y están aquí, en un
 * solo lugar, para poder cambiarlos sin tocar la lógica. Todavía no los usa
 * ningún sistema: se conectarán en las fases 3 (jugador), 5 (enemigos) y 6 (daño).
 *
 * Los datos propios de cada nivel (gemas totales, gemas requeridas, posiciones)
 * NO van aquí: se cargarán desde los datos del nivel en la Fase 2.
 */
export const GAME_TUNING = {
  /** Corazones al empezar una run (aprobado). */
  startingHearts: 3,
  /** Velocidad del jugador en px/s (provisional). */
  playerSpeed: 160,
  /** Velocidad del Hunter en px/s (provisional). */
  hunterSpeed: 120,
  /** Invulnerabilidad tras recibir daño, en segundos (provisional). */
  invulnerabilitySeconds: 0.8,
} as const;

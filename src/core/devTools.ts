/**
 * ¿Mostramos las herramientas de desarrollo? (Fase 9, decisión de Fernando
 * del 2026-11-03: ocultarlas en la versión publicada).
 *
 * Vite define `import.meta.env.DEV`: es `true` con `npm run dev` (y en las
 * pruebas) y `false` en `npm run build`. Al compilar, Vite sustituye la
 * expresión por `false` y el código que depende de ella ni siquiera llega al
 * .zip ("dead code elimination").
 *
 * Qué se oculta en producción:
 * - el pie "TEMP: UI provisional" de las pantallas de texto;
 * - la tecla B que muestra los cuerpos de colisión.
 */
export const SHOW_DEV_TOOLS: boolean = import.meta.env.DEV;

import { defineConfig } from 'vitest/config';

// Configuración de Vite (servidor de desarrollo y build) y de Vitest (pruebas).
export default defineConfig({
  // Rutas relativas: el build funciona dentro de un iframe de itch.io
  // o en cualquier subcarpeta, no solo en la raíz del dominio.
  base: './',
  build: {
    outDir: 'dist',
    // Phaser pesa más de 1 MB; subimos el umbral del aviso para que no moleste.
    chunkSizeWarningLimit: 2000,
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});

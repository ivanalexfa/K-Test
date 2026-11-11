// Pruebas de componentes (Vitest + Testing Library). Config aparte de vite.config.ts
// para no levantar el plugin de la API ni SQLite en las pruebas.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
});

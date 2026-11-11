// Pruebas de punta a punta. Levantan su propio Vite en el puerto 5174 con una base
// SQLite temporal (e2e/.tmp), así que no tocan data/paa_platform.sqlite y conviven
// con `npm run dev`. Decisión en docs/general/decisiones/0002-calidad-lint-y-pruebas.md
import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const PUERTO = 5174;
const URL_BASE = `http://localhost:${PUERTO}`;

export default defineConfig({
  testDir: './e2e',
  outputDir: './e2e/.tmp/resultados',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: URL_BASE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'escritorio', use: { ...devices['Desktop Chrome'] } },
    { name: 'movil', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npx vite --port ${PUERTO} --strictPort --host localhost --open false`,
    url: URL_BASE,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      SQLITE_DB_PATH: path.resolve('e2e/.tmp/e2e.sqlite'),
    },
  },
});

import { test as base, expect } from '@playwright/test';

/**
 * `test` con vigilancia: una prueba falla si la página lanza una excepción,
 * escribe un error en la consola o la API responde 5xx.
 * Úsalo en lugar de `@playwright/test` en todas las pruebas de e2e/.
 */
export const test = base.extend<{ vigilancia: void }>({
  vigilancia: [
    async ({ page }, use) => {
      const problemas: string[] = [];

      page.on('pageerror', (error) => problemas.push(`Excepción: ${error.message}`));
      page.on('console', (mensaje) => {
        if (mensaje.type() === 'error') problemas.push(`Consola: ${mensaje.text()}`);
      });
      page.on('response', (respuesta) => {
        if (respuesta.url().includes('/api/') && respuesta.status() >= 500) {
          problemas.push(`API ${respuesta.status()}: ${respuesta.url()}`);
        }
      });

      await use();

      expect(problemas, 'La página no debe tener errores').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

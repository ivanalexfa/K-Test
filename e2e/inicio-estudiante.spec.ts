import type { Page } from '@playwright/test';
import { test, expect } from './ayudantes';

/** Inicio del estudiante (/inicio). ADR estudiante/0001. Sesión simulada con stu-1. */
async function entrarComoEstudiante(page: Page) {
  await page.addInitScript(() => window.sessionStorage.setItem('ktest_usuario', 'stu-1'));
}

test.describe('Inicio del estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await entrarComoEstudiante(page);
  });

  test('muestra Pruebas, Material y Mis resultados', async ({ page }) => {
    await page.goto('/inicio');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola');
    for (const titulo of ['Pruebas', 'Material', 'Mis resultados']) {
      await expect(page.getByRole('heading', { level: 2, name: titulo })).toBeVisible();
    }
    await expect(
      page.getByRole('navigation', { name: 'Portal del estudiante' }).getByRole('link', { name: 'Inicio' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('en escritorio las tres secciones caben sin scroll (1440×900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/inicio');
    await expect(page.getByRole('heading', { level: 2, name: 'Mis resultados' })).toBeVisible();

    const { altoPagina, alto } = await page.evaluate(() => ({
      altoPagina: document.documentElement.scrollHeight,
      alto: window.innerHeight,
    }));
    expect(altoPagina).toBeLessThanOrEqual(alto);
  });

  test('un sprint empieza con un solo clic', async ({ page }) => {
    await page.goto('/inicio');
    await page
      .getByRole('button', { name: /Redacción Indirecta: Concisión/ })
      .click();
    await expect(page).toHaveURL(/\/examen\/sprint-read-2$/);
    await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();
  });

  test('un material se abre directo desde el inicio', async ({ page }) => {
    await page.goto('/inicio');
    const primero = page.getByRole('region', { name: 'Material' }).getByRole('link').nth(1);
    const href = await primero.getAttribute('href');
    await primero.click();
    await expect(page).toHaveURL(new RegExp(`${href!.replace(/[?]/g, '\\?')}$`));
    await expect(
      page.getByRole('navigation', { name: 'Portal del estudiante' }).getByRole('link', { name: 'Material' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('en celular nada se sale de la pantalla (390 y 320 px)', async ({ page }) => {
    for (const ancho of [390, 320]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto('/inicio');
      await expect(page.getByRole('heading', { level: 2, name: 'Pruebas' })).toBeVisible();
      const fuera = await page.evaluate(() =>
        [...document.querySelectorAll('header a, header button, main a, main button')].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
        }).length,
      );
      expect(fuera, `a ${ancho} px`).toBe(0);
    }
  });
});

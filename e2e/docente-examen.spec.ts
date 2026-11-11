import type { Page } from '@playwright/test';
import { test, expect } from './ayudantes';

/** Portal del docente, examen y resultados con el estilo de líneas de Key (ADR docente/0001, examen/0001). */
async function entrarComo(page: Page, usuarioId: string) {
  await page.addInitScript((id) => window.sessionStorage.setItem('ktest_usuario', id), usuarioId);
}

async function nadaSeSale(page: Page) {
  return page.evaluate(() => ({
    desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    fuera: [...document.querySelectorAll('header a, header button, footer button, main a, main button')].filter((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
    }).length,
  }));
}

test.describe('Portal del docente', () => {
  test.beforeEach(async ({ page }) => {
    await entrarComo(page, 'tch-1');
  });

  test('el menú de celdas cambia entre Resultados y Material', async ({ page }) => {
    await page.goto('/docente');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola');
    const menu = page.getByRole('navigation', { name: 'Portal del docente' });
    await expect(menu.getByRole('button', { name: /Resultados/ })).toHaveAttribute('aria-current', 'page');

    await menu.getByRole('button', { name: /Material/ }).click();
    await expect(menu.getByRole('button', { name: /Material/ })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('button', { name: 'Publicar material' })).toBeVisible();
  });

  test('a 320 px nada se sale de la pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/docente');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await nadaSeSale(page)).toEqual({ desborde: 0, fuera: 0 });
  });
});

test.describe('Examen y resultados', () => {
  test.beforeEach(async ({ page }) => {
    await entrarComo(page, 'stu-1');
  });

  test('a 320 px el examen y el solucionario caben en la pantalla', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/examen/sprint-math-1');
    await page.getByRole('button', { name: 'Empezar examen' }).click();
    await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();
    expect(await nadaSeSale(page), 'examen').toEqual({ desborde: 0, fuera: 0 });

    for (let i = 0; i < 2; i++) {
      await page.getByRole('radio').first().click();
      await page.getByRole('button', { name: /Siguiente/ }).click();
    }
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Entregar y Guardar/ }).click();
    await page.getByRole('button', { name: /Guardar y Ver Resultados/ }).click();

    await expect(page).toHaveURL(/\/resultados\/att-[\w-]+$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Solucionario paso a paso' })).toBeVisible();
    expect(await nadaSeSale(page), 'resultados').toEqual({ desborde: 0, fuera: 0 });
  });
});

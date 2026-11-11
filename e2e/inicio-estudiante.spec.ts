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

  test('el simulacro es la acción protagonista; sprints, resultados y material acompañan', async ({ page }) => {
    await page.goto('/inicio');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola');
    for (const titulo of ['Haz la prueba como el día del examen', 'Sprints por materia', 'Mis resultados', 'Material']) {
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
      await expect(page.getByRole('heading', { level: 2, name: 'Sprints por materia' })).toBeVisible();
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

test.describe('Pruebas, Material y Mis resultados', () => {
  test.beforeEach(async ({ page }) => {
    await entrarComoEstudiante(page);
  });

  test('Pruebas agrupa los sprints por materia y el simulacro empieza con un clic', async ({ page }) => {
    await page.goto('/inicio/pruebas');
    await expect(page.getByRole('heading', { level: 2, name: 'Sprints de Lectura y Redacción' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Sprints de Matemáticas' })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar simulacro' }).click();
    await expect(page).toHaveURL(/\/examen\/simulacro$/);
  });

  test('Material filtra por materia y abre el material de la URL con sus fórmulas', async ({ page }) => {
    await page.goto('/inicio/material');
    const primero = page.getByRole('list', { name: 'Materiales' }).getByRole('button').first();
    const titulo = (await primero.locator('span').nth(1).textContent())!.trim();
    await primero.click();
    await expect(page.getByRole('heading', { level: 2, name: titulo })).toBeVisible();

    const filtros = page.getByRole('group', { name: 'Filtrar por materia' });
    await filtros.getByRole('button', { name: /^Matemáticas/ }).click();
    await expect(filtros.getByRole('button', { name: /^Matemáticas/ })).toHaveAttribute('aria-pressed', 'true');
    for (const item of await page.getByRole('list', { name: 'Materiales' }).getByRole('button').all()) {
      await expect(item).toContainText('Matemáticas');
    }
  });

  test('Mis resultados lista los intentos y cada uno abre su solucionario', async ({ page }) => {
    await page.goto('/inicio/resultados');
    const verSolucionario = page.getByRole('link', { name: 'Ver solucionario' }).first();
    await expect(verSolucionario).toBeVisible();
    await verSolucionario.click();
    await expect(page).toHaveURL(/\/resultados\/[\w-]+$/);
  });

  test('ninguna de las tres pantallas se sale a 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const ruta of ['/inicio/pruebas', '/inicio/material', '/inicio/resultados']) {
      await page.goto(ruta);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const problemas = await page.evaluate(() => ({
        desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        fuera: [...document.querySelectorAll('main a, main button')].filter((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
        }).length,
      }));
      expect(problemas, ruta).toEqual({ desborde: 0, fuera: 0 });
    }
  });
});

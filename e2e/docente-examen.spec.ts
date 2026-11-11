import type { Page } from '@playwright/test';
import { test, expect } from './ayudantes';

/** Portal del docente, examen y resultados con el estilo de líneas de Key (ADR docente/0001 y 0002, examen/0001 y 0002). */
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

  test('cada sección del docente tiene su URL en el menú de celdas', async ({ page }) => {
    await page.goto('/docente');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hola');
    const menu = page.getByRole('navigation', { name: 'Portal del docente' });
    await expect(menu.getByRole('link', { name: 'Estudiantes' })).toHaveAttribute('aria-current', 'page');

    await menu.getByRole('link', { name: 'Intentos' }).click();
    await expect(page).toHaveURL(/\/docente\/intentos$/);
    await menu.getByRole('link', { name: 'Material' }).click();
    await expect(page).toHaveURL(/\/docente\/material$/);
    await expect(page.getByRole('link', { name: 'Publicar material' })).toBeVisible();
  });

  test('la ficha de un estudiante es su propia pantalla y vuelve con los filtros', async ({ page }) => {
    await page.goto('/docente');
    await page.getByLabel('Buscar', { exact: true }).fill('Sofía');
    await expect(page).toHaveURL(/q=Sof/);
    await page.getByRole('link', { name: /^Ver ficha de Sofía/ }).click();

    await expect(page).toHaveURL(/\/docente\/estudiantes\/stu-1$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sofía Martínez');
    await expect(page.getByRole('heading', { level: 2, name: 'Sus intentos' })).toBeVisible();
    // «Estudiantes» sigue activa en el menú mientras se ve una ficha.
    await expect(
      page.getByRole('navigation', { name: 'Portal del docente' }).getByRole('link', { name: 'Estudiantes' }),
    ).toHaveAttribute('aria-current', 'page');

    await page.getByRole('link', { name: 'Todos los estudiantes' }).click();
    await expect(page).toHaveURL(/\/docente\?q=Sof/);
    await expect(page.getByLabel('Buscar', { exact: true })).toHaveValue('Sofía');
  });

  test('publicar material: valida los campos y muestra la vista previa', async ({ page, isMobile }, info) => {
    const titulo = `Guía e2e ${info.project.name} ${Date.now()}`;
    await page.goto('/docente/material/nuevo');
    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page.getByRole('alert')).toContainText('Revisa los campos');
    await expect(page.getByText('Escribe un título.')).toBeVisible();
    await expect(page.getByLabel('Título')).toBeFocused();

    await page.getByLabel('Título').fill(titulo);
    await page.getByLabel('Tema').fill('Geometría');
    await page.getByLabel('Resumen').fill('Áreas básicas');
    await page.getByLabel('Guía para el estudiante').fill('El área es $A = \\pi r^2$');
    // En celular la vista previa está en la otra celda.
    if (isMobile) await page.getByRole('button', { name: 'Vista previa' }).click();
    const previa = page.getByRole('complementary', { name: 'Vista previa' });
    await expect(previa.getByRole('heading', { name: titulo })).toBeVisible();

    await page.getByRole('button', { name: 'Publicar' }).click();
    await expect(page).toHaveURL(/\/docente\/material$/);
    await expect(page.getByRole('status')).toHaveText('Material publicado');
    await expect(page.getByRole('link', { name: titulo })).toBeVisible();
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

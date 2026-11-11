import type { Page } from '@playwright/test';
import { test, expect } from './ayudantes';

/**
 * Rutas de K-test (ADR general/0005). La sesión se simula con los usuarios demo de la
 * base temporal de e2e (stu-1, estudiante con cohorte; tch-1, docente), guardando su id
 * en sessionStorage como hace SesionProvider al entrar con Google o Microsoft.
 */
async function entrarComo(page: Page, usuarioId: string) {
  await page.addInitScript((id) => {
    window.sessionStorage.setItem('ktest_usuario', id);
  }, usuarioId);
}

test.describe('Rutas sin sesión', () => {
  test('una ruta interna manda al acceso', async ({ page }) => {
    await page.goto('/inicio/material');
    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page.getByText('Continuar con Google')).toBeVisible();
  });

  test('una ruta que no existe vuelve al inicio', async ({ page }) => {
    await page.goto('/no-existe');
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe('Estudiante', () => {
  test.beforeEach(async ({ page }) => {
    await entrarComo(page, 'stu-1');
  });

  test('el acceso con sesión lleva a su inicio', async ({ page }) => {
    await page.goto('/entrar');
    await expect(page).toHaveURL(/\/inicio$/);
  });

  test('cada pestaña tiene su URL y «Atrás» vuelve a la anterior', async ({ page }) => {
    await page.goto('/inicio/pruebas');
    const menu = page.getByRole('navigation', { name: 'Portal del estudiante' });
    await menu.getByRole('link', { name: 'Material' }).click();
    await expect(page).toHaveURL(/\/inicio\/material$/);

    await menu.getByRole('link', { name: 'Resultados' }).click();
    await expect(page).toHaveURL(/\/inicio\/resultados$/);

    await page.goBack();
    await expect(page).toHaveURL(/\/inicio\/material$/);
  });

  test('recargar no cierra la sesión', async ({ page }) => {
    await page.goto('/inicio/material');
    await page.reload();
    await expect(page).toHaveURL(/\/inicio\/material$/);
  });

  test('el simulacro abre /examen/simulacro y al recargar pide empezarlo de nuevo', async ({ page }) => {
    await page.goto('/inicio/pruebas');
    await page.getByRole('button', { name: 'Empezar simulacro' }).click();
    await expect(page).toHaveURL(/\/examen\/simulacro$/);
    await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Simulacro completo PAA' })).toBeVisible();
    await page.getByRole('button', { name: 'Empezar examen' }).click();
    await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();
  });

  test('al entregar un sprint abre /resultados/<id> y vuelve a sus resultados', async ({ page }) => {
    await page.goto('/examen/sprint-read-2');
    await page.getByRole('button', { name: 'Empezar examen' }).click();
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Siguiente/ }).click();
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Entregar y Guardar/ }).click();
    await page.getByRole('button', { name: /Guardar y Ver Resultados/ }).click();

    await expect(page).toHaveURL(/\/resultados\/att-[\w-]+$/);
    await page.getByRole('button', { name: /Volver al Portal/ }).click();
    await expect(page).toHaveURL(/\/inicio\/resultados$/);
  });

  test('no puede entrar al portal del docente', async ({ page }) => {
    await page.goto('/docente');
    await expect(page).toHaveURL(/\/inicio$/);
  });
});

test.describe('Docente', () => {
  test('entra a /docente y no al portal del estudiante', async ({ page }) => {
    await entrarComo(page, 'tch-1');
    await page.goto('/inicio/pruebas');
    await expect(page).toHaveURL(/\/docente$/);
  });
});

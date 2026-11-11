import { test, expect } from './ayudantes';

test.describe('Pantalla de inicio', () => {
  test('carga y ofrece entrar con Google y con Microsoft', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/K-test/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Continuar con Google')).toBeVisible();
    await expect(page.getByText('Continuar con Microsoft')).toBeVisible();
  });

  test('no se desborda a lo ancho', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    const desborde = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(desborde).toBeLessThanOrEqual(0);
  });
});

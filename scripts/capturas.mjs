/**
 * Capturas de antes y después del rediseño, para el PR a main (Fase 7).
 *
 *   node scripts/capturas.mjs despues http://localhost:5173
 *   node scripts/capturas.mjs antes   http://localhost:5175   (main viejo, con VITE_ENABLE_DEMO_ACCOUNTS=true)
 *
 * Guarda JPG en docs/entrega/capturas/<version>-<pantalla>-<tamaño>.jpg.
 * «despues» simula la sesión con los usuarios demo (stu-1, tch-1) en sessionStorage;
 * «antes» entra con el panel de cuentas demo de la versión anterior.
 */
import { mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';

const [version = 'despues', base = 'http://localhost:5173'] = process.argv.slice(2);
const carpeta = 'docs/entrega/capturas';
mkdirSync(carpeta, { recursive: true });

const TAMANOS = {
  escritorio: { viewport: { width: 1440, height: 900 } },
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const navegador = await chromium.launch();

async function foto(page, pantalla, tamano) {
  await page.waitForTimeout(600);
  const ruta = `${carpeta}/${version}-${pantalla}-${tamano}.jpg`;
  await page.screenshot({ path: ruta, type: 'jpeg', quality: 72 });
  console.log('✓', ruta);
}

async function pagina(tamano, usuario) {
  const contexto = await navegador.newContext(TAMANOS[tamano]);
  if (usuario) await contexto.addInitScript((u) => sessionStorage.setItem('ktest_usuario', u), usuario);
  return contexto.newPage();
}

async function terminarSprint(page) {
  for (let i = 0; i < 10; i++) {
    await page.getByRole('radio').first().click();
    const siguiente = page.getByRole('button', { name: /Siguiente/ });
    if (!(await siguiente.isVisible())) break;
    await siguiente.click();
  }
  await page.getByRole('button', { name: /Entregar y Guardar/ }).click();
  await page.getByRole('button', { name: /Guardar y Ver Resultados/ }).click();
  await page.getByRole('button', { name: /Volver al Portal/ }).waitFor();
}

async function despues(tamano) {
  let p = await pagina(tamano);
  await p.goto(`${base}/`);
  await foto(p, '1-landing', tamano);
  await p.goto(`${base}/entrar`);
  await foto(p, '2-acceso', tamano);

  p = await pagina(tamano, 'stu-1');
  await p.goto(`${base}/inicio`);
  await p.getByRole('heading', { level: 1 }).waitFor();
  await foto(p, '3-estudiante', tamano);
  await p.goto(`${base}/examen/sprint-math-1`);
  await p.getByRole('button', { name: 'Empezar examen' }).click();
  await p.getByRole('button', { name: /Siguiente/ }).waitFor();
  await foto(p, '4-examen', tamano);
  await terminarSprint(p);
  await foto(p, '5-solucionario', tamano);

  p = await pagina(tamano, 'tch-1');
  await p.goto(`${base}/docente`);
  await p.getByRole('heading', { level: 1 }).waitFor();
  await foto(p, '6-docente', tamano);
}

async function entrarDemo(p, nombre) {
  await p.goto(`${base}/`);
  await p.getByRole('button', { name: /Cuentas Demo/ }).click();
  await p.getByRole('button', { name: new RegExp(nombre) }).click();
  await p.getByRole('button', { name: /Cambiar usuario/ }).waitFor();
}

async function antes(tamano) {
  let p = await pagina(tamano);
  await p.goto(`${base}/`);
  await p.getByRole('button', { name: /Microsoft/ }).waitFor();
  await foto(p, '2-acceso', tamano);

  await entrarDemo(p, 'Sofía Martínez');
  await foto(p, '3-estudiante', tamano);
  await p.getByRole('button', { name: /Sprints de Matemáticas/ }).click();
  await p.getByRole('button', { name: 'Iniciar', exact: true }).first().click();
  await p.getByRole('button', { name: /Siguiente/ }).waitFor();
  await foto(p, '4-examen', tamano);
  await terminarSprint(p);
  await foto(p, '5-solucionario', tamano);

  p = await pagina(tamano);
  await entrarDemo(p, 'Dr. Roberto Méndez');
  await foto(p, '6-docente', tamano);
}

for (const tamano of Object.keys(TAMANOS)) {
  await (version === 'antes' ? antes(tamano) : despues(tamano));
}
await navegador.close();

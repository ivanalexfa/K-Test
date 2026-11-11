// Genera las fotos de la web a partir de los originales.
//   docs/marca/fotos-originales/<nombre>.jpg  →  public/brand/fotos/<nombre>-{800,1600}.webp
// Uso: npm run fotos
// El origen y el uso de cada foto están en docs/marca/fotos-originales/FUENTES.md
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ORIGEN = path.resolve('docs/marca/fotos-originales');
const DESTINO = path.resolve('public/brand/fotos');
const ANCHOS = [800, 1600];

fs.mkdirSync(DESTINO, { recursive: true });

const originales = fs.readdirSync(ORIGEN).filter((f) => /\.(jpe?g|png)$/i.test(f));

for (const archivo of originales) {
  const nombre = path.parse(archivo).name;
  const imagen = sharp(path.join(ORIGEN, archivo));
  const { width = 0, height = 0 } = await imagen.metadata();

  const generados = [];
  for (const ancho of ANCHOS) {
    // Nunca se agranda: el tamaño grande solo existe si el original lo supera.
    if (ancho !== ANCHOS[0] && width <= ANCHOS[0]) continue;
    const salida = path.join(DESTINO, `${nombre}-${ancho}.webp`);
    await sharp(path.join(ORIGEN, archivo))
      .resize({ width: Math.min(ancho, width), withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(salida);
    generados.push(ancho);
  }
  console.log(`✓ ${nombre} (${width}×${height}) → ${generados.join(', ')}`);
}

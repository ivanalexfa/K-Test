import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

// Ensure server/apiPlugin.ts supports __pathname query param from Vercel rewrite
const apiPluginPath = path.resolve(process.cwd(), 'server/apiPlugin.ts');
let content = fs.readFileSync(apiPluginPath, 'utf-8');
if (content.includes("req.headers?.['x-matched-path']")) {
  content = content.replace(
    /const rawPath =[\s\S]*?const method = req\.method \|\| 'GET';/,
    `const urlObj = new URL(req.url || '/', 'http://localhost');
  const queryPathname =
    (typeof req.query?.__pathname === 'string' && req.query.__pathname) ||
    urlObj.searchParams.get('__pathname');

  let pathname =
    queryPathname ||
    (typeof req.headers?.['x-forwarded-uri'] === 'string'
      ? req.headers['x-forwarded-uri'].split('?')[0]
      : '') ||
    urlObj.pathname ||
    '/';

  if (pathname === '/api/index' || pathname === '/api/index.js') {
    pathname = '/api';
  }
  if (!pathname.startsWith('/api')) {
    pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
  }

  const method = req.method || 'GET';`
  );
  fs.writeFileSync(apiPluginPath, content, 'utf-8');
}

// Remove old .ts files in api/ so Vercel only sees the self-contained ESM bundle api/index.js
for (const oldFile of ['api/index.ts', 'api/[...path].ts']) {
  const fullPath = path.resolve(process.cwd(), oldFile);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

await build({
  entryPoints: ['server/vercelHandler.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'api/index.js',
  external: ['node:*'],
  banner: {
    js: '// Auto-generated self-contained Vercel Serverless Function bundle\n',
  },
});

console.log('✓ Built self-contained Vercel Serverless Function -> api/index.js');

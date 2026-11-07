import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

// Ensure api directory exists
const apiDir = path.resolve(process.cwd(), 'api');
if (!fs.existsSync(apiDir)) {
  fs.mkdirSync(apiDir, { recursive: true });
}

// Clean old .ts files in api/ so Vercel only processes the self-contained JS bundles
for (const oldFile of ['api/index.ts', 'api/[...path].ts']) {
  const fullPath = path.resolve(process.cwd(), oldFile);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

// 1. Build self-contained ESM bundle for api/index.js (matched by /api and /api/ rewrites)
await build({
  entryPoints: ['server/vercelHandler.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'api/index.js',
  external: ['node:*'],
  banner: {
    js: `// Auto-generated self-contained Vercel Serverless Function bundle
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.removeAllListeners('warning');
  process.on('warning', (warning) => {
    if (
      warning &&
      warning.name === 'DeprecationWarning' &&
      (warning.code === 'DEP0169' || (warning.message && warning.message.includes('url.parse')))
    ) {
      return;
    }
    console.warn(warning);
  });
}
`,
  },
});
console.log('✓ Built self-contained Vercel Serverless Function -> api/index.js');

// 2. Synchronize catch-all serverless function api/[...path].js for native Vercel catch-all routing
fs.copyFileSync(
  path.resolve(process.cwd(), 'api/index.js'),
  path.resolve(process.cwd(), 'api/[...path].js')
);
console.log('✓ Synchronized catch-all Vercel Serverless Function -> api/[...path].js');

// @ts-nocheck
// Suppress benign DEP0169 warning emitted by runtime wrapper invoking legacy url.parse()
if (typeof process !== 'undefined' && typeof process.on === 'function') {
  process.removeAllListeners('warning');
  process.on('warning', (warning: any) => {
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

import { handleApiRequest } from './apiPlugin';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

export default async function handler(req: any, res: any) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled && !res.writableEnded) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: `Ruta API no encontrada en el servidor (${req.method || 'GET'} ${req.url || '/'})`,
        })
      );
    }
  } catch (err: any) {
    console.error('Unhandled Serverless Error:', err);
    if (!res.writableEnded) {
      res.statusCode = err?.statusCode || 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(
        JSON.stringify({
          error: err?.message || 'Error interno en la función serverless',
          code: err?.code,
        })
      );
    }
  }
}

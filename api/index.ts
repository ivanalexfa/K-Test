import { handleApiRequest } from '../server/apiPlugin';

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

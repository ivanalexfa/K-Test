// @ts-nocheck
import {
  getAllUsers,
  loginUser,
  registerUser,
  getAllStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  getAllTestAttempts,
  createTestAttempt,
} from './database';

function readJsonBody(req: any): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk: any) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: any, statusCode: number, payload: any) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export function paaSqliteApiPlugin() {
  const attachMiddleware = (middlewares: any) => {
    middlewares.use(async (req: any, res: any, next: any) => {
      if (!req.url || !req.url.startsWith('/api/')) {
        return next();
      }

      const urlObj = new URL(req.url, 'http://localhost');
      const pathname = urlObj.pathname;
      const method = req.method || 'GET';

      try {
        // GET /api/bootstrap
        if (method === 'GET' && pathname === '/api/bootstrap') {
          return sendJson(res, 200, {
            users: getAllUsers(),
            materials: getAllStudyMaterials(),
            attempts: getAllTestAttempts(),
          });
        }

        // POST /api/auth/login
        if (method === 'POST' && pathname === '/api/auth/login') {
          const body = await readJsonBody(req);
          const user = loginUser(body.email || '', body.password);
          if (!user) {
            return sendJson(res, 401, {
              error: 'Credenciales inválidas o usuario no encontrado.',
            });
          }
          return sendJson(res, 200, { user });
        }

        // POST /api/auth/register
        if (method === 'POST' && pathname === '/api/auth/register') {
          const body = await readJsonBody(req);
          if (!body.name || !body.email || !body.role) {
            return sendJson(res, 400, {
              error: 'Nombre, correo y clase de usuario son obligatorios.',
            });
          }
          const user = registerUser({
            name: body.name,
            email: body.email,
            password: body.password,
            role: body.role === 'teacher' ? 'teacher' : 'student',
            cohort:
              body.cohort ||
              (body.role === 'teacher'
                ? 'Cátedra Key Institute'
                : 'Cohorte Admisión Ingeniería 2027'),
          });
          return sendJson(res, 201, { user, users: getAllUsers() });
        }

        // GET /api/materials
        if (method === 'GET' && pathname === '/api/materials') {
          return sendJson(res, 200, { materials: getAllStudyMaterials() });
        }

        // POST /api/materials
        if (method === 'POST' && pathname === '/api/materials') {
          const body = await readJsonBody(req);
          const created = createStudyMaterial(body);
          return sendJson(res, 201, {
            material: created,
            materials: getAllStudyMaterials(),
          });
        }

        // PUT /api/materials/:id
        if (method === 'PUT' && pathname.startsWith('/api/materials/')) {
          const id = pathname.replace('/api/materials/', '');
          const body = await readJsonBody(req);
          const updated = updateStudyMaterial(id, body);
          return sendJson(res, 200, {
            material: updated,
            materials: getAllStudyMaterials(),
          });
        }

        // DELETE /api/materials/:id
        if (method === 'DELETE' && pathname.startsWith('/api/materials/')) {
          const id = pathname.replace('/api/materials/', '');
          deleteStudyMaterial(id);
          return sendJson(res, 200, {
            materials: getAllStudyMaterials(),
          });
        }

        // GET /api/attempts
        if (method === 'GET' && pathname === '/api/attempts') {
          const userId = urlObj.searchParams.get('userId') || undefined;
          return sendJson(res, 200, { attempts: getAllTestAttempts(userId) });
        }

        // POST /api/attempts
        if (method === 'POST' && pathname === '/api/attempts') {
          const body = await readJsonBody(req);
          const attempt = createTestAttempt(body);
          return sendJson(res, 201, {
            attempt,
            attempts: getAllTestAttempts(),
          });
        }

        return sendJson(res, 404, { error: 'Ruta API no encontrada' });
      } catch (err: any) {
        return sendJson(res, 500, {
          error: err?.message || 'Error interno en la base de datos SQLite',
        });
      }
    });
  };

  return {
    name: 'paa-sqlite-api-plugin',
    configureServer(server: any) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server: any) {
      attachMiddleware(server.middlewares);
    },
  };
}

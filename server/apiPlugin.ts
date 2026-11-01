// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import {
  UPLOADS_DIR,
  getUploadedFileFromDb,
  getAllUsers,
  updateUserCohort,
  loginUser,
  registerUser,
  authenticateMicrosoftUser,
  authenticateGoogleUser,
  getAllStudyMaterials,
  createStudyMaterial,
  updateStudyMaterial,
  deleteStudyMaterial,
  getAllTestAttempts,
  createTestAttempt,
} from './database';
import { isTursoConfigured } from './dbDriver';

function readJsonBody(req: any): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(req.body.trim() ? JSON.parse(req.body) : {});
      } catch (e: any) {
        const err: any = new Error(
          `Formato JSON inválido en el cuerpo de la petición: ${e.message}`
        );
        err.statusCode = 400;
        err.code = 'INVALID_JSON_BODY';
        return Promise.reject(err);
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return Promise.resolve(JSON.parse(req.body.toString('utf-8')));
      } catch (e: any) {
        const err: any = new Error(
          `Formato JSON inválido en el cuerpo de la petición: ${e.message}`
        );
        err.statusCode = 400;
        err.code = 'INVALID_JSON_BODY';
        return Promise.reject(err);
      }
    }
  }

  if (req.readableEnded) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch (err: any) {
        const parseErr: any = new Error(
          `Formato JSON inválido en el cuerpo de la petición: ${err.message}`
        );
        parseErr.statusCode = 400;
        parseErr.code = 'INVALID_JSON_BODY';
        reject(parseErr);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: any, statusCode: number, payload: any) {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getMimeTypeByExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx':
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx':
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx':
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.csv': 'text/csv; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8',
  };
  return map[ext] || 'application/octet-stream';
}

export async function handleApiRequest(req: any, res: any): Promise<boolean> {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const queryParam = req.query?.__pathname;
  const queryPathname =
    (typeof queryParam === 'string' && queryParam) ||
    (Array.isArray(queryParam) && typeof queryParam[0] === 'string' && queryParam[0]) ||
    urlObj.searchParams.get('__pathname');

  const catchAllParam = req.query?.path;
  const catchAllPath = Array.isArray(catchAllParam)
    ? catchAllParam.join('/')
    : typeof catchAllParam === 'string'
      ? catchAllParam
      : '';
  const catchAllPathname = catchAllPath
    ? (catchAllPath.startsWith('/api')
        ? catchAllPath
        : '/api/' + (catchAllPath.startsWith('/') ? catchAllPath.slice(1) : catchAllPath))
    : '';

  const rawCandidate =
    queryPathname ||
    catchAllPathname ||
    (typeof req.headers?.['x-forwarded-uri'] === 'string'
      ? req.headers['x-forwarded-uri']
      : '') ||
    (typeof req.headers?.['x-matched-path'] === 'string'
      ? req.headers['x-matched-path']
      : '') ||
    (typeof req.originalUrl === 'string' ? req.originalUrl : '') ||
    urlObj.pathname ||
    '/';

  // Strip query parameters and hash fragments to prevent route-matching pollution
  let pathname = rawCandidate.split('?')[0].split('#')[0].trim() || '/';

  // Collapse consecutive slashes into single slashes (e.g. /api//health -> /api/health)
  pathname = pathname.replace(/\/+/g, '/');

  // Ensure path starts with /api
  if (pathname === '/' || pathname === '') {
    pathname = '/api';
  } else if (!pathname.startsWith('/api')) {
    pathname = '/api' + (pathname.startsWith('/') ? pathname : '/' + pathname);
  }

  // Strip trailing slashes on sub-routes (e.g. /api/health/ -> /api/health, /api/ -> /api)
  while (pathname.length > 4 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Canonicalize function-name aliases to /api
  if (
    pathname === '/api/index' ||
    pathname === '/api/index.js' ||
    pathname === '/api/[...path]' ||
    pathname === '/api/[...path].js'
  ) {
    pathname = '/api';
  }

  const method = (req.method || 'GET').toUpperCase();

  // Inject standard CORS headers on all API responses
  if (typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', req.headers?.origin || '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, DELETE, OPTIONS'
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers?.['access-control-request-headers'] ||
        'Content-Type, Authorization, X-Requested-With, Accept'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
  }

  // Handle CORS pre-flight OPTIONS request immediately
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    // GET /api/health or GET /api (Diagnostic endpoint)
        if (method === 'GET' && (pathname === '/api/health' || pathname === '/api')) {
      const urlEnv = (process.env.TURSO_DATABASE_URL || process.env.turso_database_url || '').trim();
      const tokenEnv = (process.env.TURSO_AUTH_TOKEN || process.env.turso_auth_token || '').trim();
      const detectedKeys = Object.keys(process.env).filter((k) =>
        /turso|database|token/i.test(k)
      );
      sendJson(res, 200, {
        status: 'ok',
        tursoConfigured: isTursoConfigured(),
        diagnostics: {
          hasTursoUrl: Boolean(urlEnv),
          urlPrefix: urlEnv ? urlEnv.slice(0, 15) + '...' : null,
          hasTursoToken: Boolean(tokenEnv),
          tokenLength: tokenEnv.length,
          detectedEnvKeys: detectedKeys,
        },
        environment: process.env.NODE_ENV || 'production',
        timestamp: new Date().toISOString(),
      });
      return true;
    }

    // Serve uploaded study material files: GET /api/uploads/:filename
    if (method === 'GET' && pathname.startsWith('/api/uploads/')) {
      const encodedName = pathname.replace('/api/uploads/', '').trim();
      if (!encodedName) {
        sendJson(res, 400, { error: 'Nombre de archivo requerido' });
        return true;
      }
      let decodedName: string;
      try {
        decodedName = decodeURIComponent(encodedName);
      } catch {
        decodedName = encodedName;
      }
      const fileName = path.basename(decodedName).trim();
      if (!fileName || fileName === '.' || fileName === '..') {
        sendJson(res, 400, { error: 'Nombre de archivo inválido' });
        return true;
      }
      const filePath = path.join(UPLOADS_DIR, fileName);

      if (fs.existsSync(filePath)) {
        const mime = getMimeTypeByExtension(fileName);
        const stat = fs.statSync(filePath);
        res.statusCode = 200;
        res.setHeader('Content-Type', mime);
        res.setHeader('Content-Length', stat.size);
        const isInlinePreviewable =
          mime === 'application/pdf' || mime.startsWith('image/');
        res.setHeader(
          'Content-Disposition',
          `${isInlinePreviewable ? 'inline' : 'attachment'}; filename="${encodeURIComponent(
            fileName
          )}"`
        );

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
        return true;
      }

      // Fallback: Read from Turso / SQLite persistent table (essential on Vercel Serverless)
      const dbFile = await getUploadedFileFromDb(fileName);
      if (!dbFile) {
        sendJson(res, 404, { error: 'Archivo adjunto no encontrado' });
        return true;
      }

      const mime = dbFile.mimeType || getMimeTypeByExtension(fileName);
      res.statusCode = 200;
      res.setHeader('Content-Type', mime);
      res.setHeader('Content-Length', dbFile.buffer.length);
      const isInlinePreviewable =
        mime === 'application/pdf' || mime.startsWith('image/');
      res.setHeader(
        'Content-Disposition',
        `${isInlinePreviewable ? 'inline' : 'attachment'}; filename="${encodeURIComponent(
          fileName
        )}"`
      );
      res.end(dbFile.buffer);
      return true;
    }

    // GET /api/bootstrap
    if (method === 'GET' && pathname === '/api/bootstrap') {
      const [users, materials, attempts] = await Promise.all([
        getAllUsers(),
        getAllStudyMaterials(),
        getAllTestAttempts(),
      ]);
      sendJson(res, 200, {
        users,
        materials,
        attempts,
        authConfig: {
          alwaysRequireTeacherPin:
            (process.env.ALWAYS_REQUIRE_TEACHER_PIN || 'false')
              .trim()
              .toLowerCase() === 'true',
          allowedDomains: process.env.ALLOWED_EMAIL_DOMAINS || '*',
        },
      });
      return true;
    }

    // POST /api/auth/microsoft (Microsoft Entra ID / MSAL + Option 1 Teacher PIN)
    if (method === 'POST' && pathname === '/api/auth/microsoft') {
      const body = await readJsonBody(req);
      const user = await authenticateMicrosoftUser({
        name: body.name,
        email: body.email,
        microsoftOid: body.microsoftOid,
        idToken: body.idToken,
        accessToken: body.accessToken,
        requestedRole: body.requestedRole === 'teacher' ? 'teacher' : 'student',
        teacherPin: body.teacherPin,
        cohort: body.cohort,
      });
      const users = await getAllUsers();
      sendJson(res, 200, { user, users });
      return true;
    }

    // POST /api/auth/google (Google Identity Services + Option 1 Teacher PIN)
    if (method === 'POST' && pathname === '/api/auth/google') {
      const body = await readJsonBody(req);
      const user = await authenticateGoogleUser({
        name: body.name,
        email: body.email,
        googleId: body.googleId,
        idToken: body.idToken,
        accessToken: body.accessToken,
        requestedRole: body.requestedRole === 'teacher' ? 'teacher' : 'student',
        teacherPin: body.teacherPin,
        cohort: body.cohort,
      });
      const users = await getAllUsers();
      sendJson(res, 200, { user, users });
      return true;
    }

    // POST /api/auth/login
    if (method === 'POST' && pathname === '/api/auth/login') {
      const body = await readJsonBody(req);
      const user = await loginUser(body.email || '', body.password);
      if (!user) {
        sendJson(res, 401, {
          error: 'Credenciales inválidas o usuario no encontrado.',
        });
        return true;
      }
      sendJson(res, 200, { user });
      return true;
    }

    // POST /api/auth/register
    if (method === 'POST' && pathname === '/api/auth/register') {
      const body = await readJsonBody(req);
      if (!body.name || !body.email || !body.role) {
        sendJson(res, 400, {
          error: 'Nombre, correo y clase de usuario son obligatorios.',
        });
        return true;
      }
      const user = await registerUser({
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
      const users = await getAllUsers();
      sendJson(res, 201, { user, users });
      return true;
    }

    // PUT /api/users/:id/cohort
    if (
      method === 'PUT' &&
      pathname.startsWith('/api/users/') &&
      pathname.endsWith('/cohort')
    ) {
      const match = pathname.match(/^\/api\/users\/(.+)\/cohort$/);
      let userId = '';
      if (match && match[1]) {
        try {
          userId = decodeURIComponent(match[1]).trim();
        } catch {
          userId = match[1].trim();
        }
      }
      if (!userId) {
        sendJson(res, 400, { error: 'Identificador de usuario obligatorio' });
        return true;
      }
      const body = await readJsonBody(req);
      if (!body.cohort) {
        sendJson(res, 400, { error: 'La cohorte es obligatoria' });
        return true;
      }
      const updatedUser = await updateUserCohort(userId, body.cohort);
      const [users, attempts] = await Promise.all([
        getAllUsers(),
        getAllTestAttempts(),
      ]);
      sendJson(res, 200, {
        user: updatedUser,
        users,
        attempts,
      });
      return true;
    }

    // GET /api/materials
    if (method === 'GET' && pathname === '/api/materials') {
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, { materials });
      return true;
    }

    // POST /api/materials
    if (method === 'POST' && pathname === '/api/materials') {
      const body = await readJsonBody(req);
      const created = await createStudyMaterial(body);
      const materials = await getAllStudyMaterials();
      sendJson(res, 201, {
        material: created,
        materials,
      });
      return true;
    }

    // PUT /api/materials/:id
    if (method === 'PUT' && pathname.startsWith('/api/materials/')) {
      let id = '';
      try {
        id = decodeURIComponent(pathname.replace('/api/materials/', '')).trim();
      } catch {
        id = pathname.replace('/api/materials/', '').trim();
      }
      if (!id) {
        sendJson(res, 400, { error: 'Identificador de material obligatorio' });
        return true;
      }
      const body = await readJsonBody(req);
      const updated = await updateStudyMaterial(id, body);
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, {
        material: updated,
        materials,
      });
      return true;
    }

    // DELETE /api/materials/:id
    if (method === 'DELETE' && pathname.startsWith('/api/materials/')) {
      let id = '';
      try {
        id = decodeURIComponent(pathname.replace('/api/materials/', '')).trim();
      } catch {
        id = pathname.replace('/api/materials/', '').trim();
      }
      if (!id) {
        sendJson(res, 400, { error: 'Identificador de material obligatorio' });
        return true;
      }
      await deleteStudyMaterial(id);
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, { materials });
      return true;
    }

    // GET /api/attempts
    if (method === 'GET' && pathname === '/api/attempts') {
      const queryUserId = req.query?.userId;
      const rawUserId =
        (typeof queryUserId === 'string' && queryUserId) ||
        (Array.isArray(queryUserId) && typeof queryUserId[0] === 'string' && queryUserId[0]) ||
        urlObj.searchParams.get('userId') ||
        undefined;
      let userId: string | undefined = undefined;
      if (rawUserId) {
        try {
          userId = decodeURIComponent(rawUserId).trim() || undefined;
        } catch {
          userId = rawUserId.trim() || undefined;
        }
      }
      const attempts = await getAllTestAttempts(userId);
      sendJson(res, 200, { attempts });
      return true;
    }

    // POST /api/attempts
    if (method === 'POST' && pathname === '/api/attempts') {
      const body = await readJsonBody(req);
      const attempt = await createTestAttempt(body);
      const attempts = await getAllTestAttempts();
      sendJson(res, 201, {
        attempt,
        attempts,
      });
      return true;
    }

    sendJson(res, 404, {
      error: `Ruta API no encontrada (${method} ${pathname})`,
    });
    return true;
  } catch (err: any) {
    const status = err?.statusCode || 500;
    sendJson(res, status, {
      error: err?.message || 'Error interno en el servidor de base de datos',
      code: err?.code,
    });
    return true;
  }
}

export function paaSqliteApiPlugin() {
  const attachMiddleware = (middlewares: any) => {
    middlewares.use(async (req: any, res: any, next: any) => {
      const reqUrl = req.url || '';
      if (!reqUrl.startsWith('/api/') && reqUrl !== '/api' && !reqUrl.startsWith('/api?')) {
        return next();
      }
      const handled = await handleApiRequest(req, res);
      if (!handled && !res.writableEnded) {
        return next();
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

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

function readJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === 'string' && req.body.trim().length > 0) {
    try {
      return Promise.resolve(JSON.parse(req.body));
    } catch (e) {
      return Promise.reject(e);
    }
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
        resolve(JSON.parse(raw));
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
  if (!req.url || !req.url.startsWith('/api/')) {
    return false;
  }

  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;
  const method = req.method || 'GET';

  try {
    // Serve uploaded study material files: GET /api/uploads/:filename
    if (method === 'GET' && pathname.startsWith('/api/uploads/')) {
      const encodedName = pathname.replace('/api/uploads/', '');
      const fileName = path.basename(decodeURIComponent(encodedName));
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
      const userId = pathname.replace('/api/users/', '').replace('/cohort', '');
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
      const id = pathname.replace('/api/materials/', '');
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
      const id = pathname.replace('/api/materials/', '');
      await deleteStudyMaterial(id);
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, { materials });
      return true;
    }

    // GET /api/attempts
    if (method === 'GET' && pathname === '/api/attempts') {
      const userId = urlObj.searchParams.get('userId') || undefined;
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

    sendJson(res, 404, { error: 'Ruta API no encontrada' });
    return true;
  } catch (err: any) {
    const status = err?.statusCode || 500;
    sendJson(res, status, {
      error: err?.message || 'Error interno en la base de datos',
      code: err?.code,
    });
    return true;
  }
}

export function paaSqliteApiPlugin() {
  const attachMiddleware = (middlewares: any) => {
    middlewares.use(async (req: any, res: any, next: any) => {
      const handled = await handleApiRequest(req, res);
      if (!handled) {
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

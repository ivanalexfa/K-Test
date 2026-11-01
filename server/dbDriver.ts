// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

// Load .env variables into process.env if present (for local dev)
export function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith('#')) continue;
      const eqIdx = line.indexOf('=');
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {
    // Ignore in serverless environments without .env file
  }
}

loadEnvFile();

/**
 * Returns true when Turso Cloud credentials (TURSO_DATABASE_URL & TURSO_AUTH_TOKEN) are configured.
 */
/**
 * Retrieves and sanitizes Turso credentials from environment variables.
 * Handles uppercase/lowercase variants, accidental quotes, and whitespace.
 */
export function getTursoConfig(): { url: string; token: string } {
  const rawUrl =
    process.env.TURSO_DATABASE_URL ||
    process.env.turso_database_url ||
    process.env.TURSO_URL ||
    '';
  const rawToken =
    process.env.TURSO_AUTH_TOKEN ||
    process.env.turso_auth_token ||
    process.env.TURSO_TOKEN ||
    '';

  const url = rawUrl.replace(/^['"]|['"]$/g, '').trim();
  const token = rawToken.replace(/^['"]|['"]$/g, '').trim();
  return { url, token };
}

/**
 * Returns true when Turso Cloud credentials (TURSO_DATABASE_URL & TURSO_AUTH_TOKEN) are configured.
 */
export function isTursoConfigured(): boolean {
  const { url, token } = getTursoConfig();
  return Boolean(url && token && !url.includes('xxxx'));
}

function getTursoPipelineUrl(): string {
  const { url } = getTursoConfig();
  const httpsUrl = url
    .replace(/^libsql:\/\//i, 'https://')
    .replace(/^wss:\/\//i, 'https://')
    .replace(/\/+$/, '');
  return `${httpsUrl}/v2/pipeline`;
}

function toHranaArg(val: any) {
  if (val === null || val === undefined) {
    return { type: 'null' };
  }
  if (typeof val === 'number') {
    if (Number.isInteger(val)) {
      return { type: 'integer', value: String(val) };
    }
    return { type: 'float', value: val };
  }
  if (typeof val === 'boolean') {
    return { type: 'integer', value: val ? '1' : '0' };
  }
  return { type: 'text', value: String(val) };
}

function parseHranaResult(result: any): Record<string, any>[] {
  if (!result || !Array.isArray(result.cols) || !Array.isArray(result.rows)) {
    return [];
  }
  const colNames = result.cols.map((c: any) => c.name);
  return result.rows.map((row: any[]) => {
    const obj: Record<string, any> = {};
    row.forEach((cell: any, idx: number) => {
      const key = colNames[idx];
      if (!cell || cell.type === 'null') {
        obj[key] = null;
      } else if (cell.type === 'integer') {
        obj[key] = Number(cell.value);
      } else if (cell.type === 'float') {
        obj[key] = Number(cell.value);
      } else {
        obj[key] = cell.value;
      }
    });
    return obj;
  });
}

async function executeTursoPipeline(
  statements: { sql: string; args?: any[] }[]
): Promise<any[]> {
  const pipelineUrl = getTursoPipelineUrl();
  const { token } = getTursoConfig();

  const requests: any[] = statements.map((s) => ({
    type: 'execute',
    stmt: {
      sql: s.sql,
      args: (s.args || []).map(toHranaArg),
    },
  }));
  requests.push({ type: 'close' });

  const response = await fetch(pipelineUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(
      `Turso Cloud DB Error (${response.status}): ${errText || response.statusText}`
    );
  }

  const data: any = await response.json();
  const results = data.results || [];
  const parsedResults: any[] = [];

  for (const res of results) {
    if (res.type === 'error') {
      throw new Error(
        `Turso SQL Error: ${res.error?.message || JSON.stringify(res.error)}`
      );
    }
    if (res.type === 'ok' && res.response?.type === 'execute') {
      parsedResults.push(res.response.result);
    }
  }

  return parsedResults;
}

// ============================================================================
// Local SQLite Fallback (for local development or preview without Turso)
// ============================================================================

let localDbInstance: any = null;
let writableUploadsDir: string | null = null;

export function getUploadsDir(): string {
  if (writableUploadsDir) return writableUploadsDir;

  const isVercel = Boolean(process.env.VERCEL);
  const baseDataDir = isVercel
    ? path.join('/tmp', 'ktest-data')
    : path.resolve(process.cwd(), 'data');

  try {
    const uploads = path.join(baseDataDir, 'uploads');
    if (!fs.existsSync(uploads)) {
      fs.mkdirSync(uploads, { recursive: true });
    }
    writableUploadsDir = uploads;
    return uploads;
  } catch {
    const fallbackUploads = path.join('/tmp', 'ktest-data', 'uploads');
    try {
      if (!fs.existsSync(fallbackUploads)) {
        fs.mkdirSync(fallbackUploads, { recursive: true });
      }
    } catch {}
    writableUploadsDir = fallbackUploads;
    return fallbackUploads;
  }
}

export function resetLocalDbInstance() {
  if (localDbInstance && typeof localDbInstance.close === 'function') {
    try {
      localDbInstance.close();
    } catch {}
  }
  localDbInstance = null;
}

function getLocalSqliteDb(): any {
  if (localDbInstance) return localDbInstance;

  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel && !isTursoConfigured()) {
    const err: any = new Error(
      'Faltan las variables de entorno de Turso (TURSO_DATABASE_URL y TURSO_AUTH_TOKEN) en la configuración de Vercel. Agrégalas en Vercel -> Settings -> Environment Variables.'
    );
    err.statusCode = 500;
    err.code = 'TURSO_CREDENTIALS_MISSING';
    throw err;
  }

  let DatabaseSync: any;
  try {
    const requireFn = createRequire(import.meta.url);
    const sqliteMod = requireFn('node:sqlite');
    DatabaseSync = sqliteMod.DatabaseSync;
  } catch {
    const err: any = new Error(
      'El motor node:sqlite no está disponible en este entorno Node.js. En producción sobre Vercel debes configurar TURSO_DATABASE_URL y TURSO_AUTH_TOKEN.'
    );
    err.statusCode = 500;
    err.code = 'SQLITE_NOT_AVAILABLE';
  }

  const repoDbPath =
    process.env.SQLITE_DB_PATH ||
    path.resolve(process.cwd(), 'data', 'paa_platform.sqlite');

  let activeDbPath = repoDbPath;
  if (isVercel) {
    const tmpDir = path.join('/tmp', 'ktest-data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const tmpDbPath = path.join(tmpDir, 'paa_platform.sqlite');
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(repoDbPath)) {
      try {
        fs.copyFileSync(repoDbPath, tmpDbPath);
      } catch {}
    }
    activeDbPath = tmpDbPath;
  } else {
    const dataDir = path.dirname(repoDbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  localDbInstance = new DatabaseSync(activeDbPath);
  return localDbInstance;
}

// ============================================================================
// Unified Async Database Operations (Turso Cloud OR Local SQLite)
// ============================================================================

export async function dbAll(sql: string, args: any[] = []): Promise<any[]> {
  if (isTursoConfigured()) {
    const [result] = await executeTursoPipeline([{ sql, args }]);
    return parseHranaResult(result);
  }
  const db = getLocalSqliteDb();
  return db.prepare(sql).all(...args);
}

export async function dbGet(
  sql: string,
  args: any[] = []
): Promise<any | undefined> {
  if (isTursoConfigured()) {
    const [result] = await executeTursoPipeline([{ sql, args }]);
    const rows = parseHranaResult(result);
    return rows[0];
  }
  const db = getLocalSqliteDb();
  return db.prepare(sql).get(...args);
}

export async function dbRun(
  sql: string,
  args: any[] = []
): Promise<{ changes: number }> {
  if (isTursoConfigured()) {
    const [result] = await executeTursoPipeline([{ sql, args }]);
    return { changes: Number(result?.affected_row_count ?? 0) };
  }
  const db = getLocalSqliteDb();
  const info = db.prepare(sql).run(...args);
  return { changes: Number(info?.changes ?? 0) };
}

export async function dbBatch(
  statements: { sql: string; args?: any[] }[]
): Promise<void> {
  if (statements.length === 0) return;
  if (isTursoConfigured()) {
    await executeTursoPipeline(statements);
    return;
  }
  const db = getLocalSqliteDb();
  for (const stmt of statements) {
    db.prepare(stmt.sql).run(...(stmt.args || []));
  }
}

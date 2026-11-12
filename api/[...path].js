// Auto-generated self-contained Vercel Serverless Function bundle
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


// server/apiPlugin.ts
import fs3 from "node:fs";
import path3 from "node:path";

// server/database.ts
import fs2 from "node:fs";
import path2 from "node:path";
import crypto from "node:crypto";

// server/dbDriver.ts
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
function loadEnvFile() {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, "utf-8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eqIdx = line.indexOf("=");
      if (eqIdx === -1) continue;
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      if (!(key in process.env)) {
        process.env[key] = val;
      }
    }
  } catch {
  }
}
loadEnvFile();
function getTursoConfig() {
  const rawUrl = process.env.TURSO_DATABASE_URL || process.env.turso_database_url || process.env.TURSO_URL || process.env.turso_url || process.env.URL_TURSO || process.env.url_turso || "";
  const rawToken = process.env.TURSO_AUTH_TOKEN || process.env.turso_auth_token || process.env.TURSO_TOKEN || process.env.turso_token || process.env.TOKEN_TURSO || process.env.token_turso || "";
  const url = rawUrl.replace(/^['"]|['"]$/g, "").trim();
  const token = rawToken.replace(/^['"]|['"]$/g, "").trim();
  return { url, token };
}
function isTursoConfigured() {
  const { url, token } = getTursoConfig();
  return Boolean(url && token && !url.includes("xxxx"));
}
function getTursoPipelineUrl() {
  const { url } = getTursoConfig();
  const httpsUrl = url.replace(/^libsql:\/\//i, "https://").replace(/^wss:\/\//i, "https://").replace(/\/+$/, "");
  return `${httpsUrl}/v2/pipeline`;
}
function toHranaArg(val) {
  if (val === null || val === void 0) {
    return { type: "null" };
  }
  if (typeof val === "number") {
    if (Number.isInteger(val)) {
      return { type: "integer", value: String(val) };
    }
    return { type: "float", value: val };
  }
  if (typeof val === "boolean") {
    return { type: "integer", value: val ? "1" : "0" };
  }
  return { type: "text", value: String(val) };
}
function parseHranaResult(result) {
  if (!result || !Array.isArray(result.cols) || !Array.isArray(result.rows)) {
    return [];
  }
  const colNames = result.cols.map((c) => c.name);
  return result.rows.map((row) => {
    const obj = {};
    row.forEach((cell, idx) => {
      const key = colNames[idx];
      if (!cell || cell.type === "null") {
        obj[key] = null;
      } else if (cell.type === "integer") {
        obj[key] = Number(cell.value);
      } else if (cell.type === "float") {
        obj[key] = Number(cell.value);
      } else {
        obj[key] = cell.value;
      }
    });
    return obj;
  });
}
async function executeTursoPipeline(statements) {
  const pipelineUrl = getTursoPipelineUrl();
  const { token } = getTursoConfig();
  const requests = statements.map((s) => ({
    type: "execute",
    stmt: {
      sql: s.sql,
      args: (s.args || []).map(toHranaArg)
    }
  }));
  requests.push({ type: "close" });
  const response = await fetch(pipelineUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ requests })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(
      `Turso Cloud DB Error (${response.status}): ${errText || response.statusText}`
    );
  }
  const data = await response.json();
  const results = data.results || [];
  const parsedResults = [];
  for (const res of results) {
    if (res.type === "error") {
      throw new Error(
        `Turso SQL Error: ${res.error?.message || JSON.stringify(res.error)}`
      );
    }
    if (res.type === "ok" && res.response?.type === "execute") {
      parsedResults.push(res.response.result);
    }
  }
  return parsedResults;
}
var localDbInstance = null;
var writableUploadsDir = null;
function getUploadsDir() {
  if (writableUploadsDir) return writableUploadsDir;
  const isVercel = Boolean(process.env.VERCEL);
  const baseDataDir = isVercel ? path.join("/tmp", "ktest-data") : path.resolve(process.cwd(), "data");
  try {
    const uploads = path.join(baseDataDir, "uploads");
    if (!fs.existsSync(uploads)) {
      fs.mkdirSync(uploads, { recursive: true });
    }
    writableUploadsDir = uploads;
    return uploads;
  } catch {
    const fallbackUploads = path.join("/tmp", "ktest-data", "uploads");
    try {
      if (!fs.existsSync(fallbackUploads)) {
        fs.mkdirSync(fallbackUploads, { recursive: true });
      }
    } catch {
    }
    writableUploadsDir = fallbackUploads;
    return fallbackUploads;
  }
}
function getLocalSqliteDb() {
  if (localDbInstance) return localDbInstance;
  const isVercel = Boolean(process.env.VERCEL);
  if (isVercel && !isTursoConfigured()) {
    const err = new Error(
      "Faltan las variables de entorno de Turso (TURSO_DATABASE_URL y TURSO_AUTH_TOKEN) en la configuraci\xF3n de Vercel. Agr\xE9galas en Vercel -> Settings -> Environment Variables."
    );
    err.statusCode = 500;
    err.code = "TURSO_CREDENTIALS_MISSING";
    throw err;
  }
  let DatabaseSync;
  try {
    const requireFn = createRequire(import.meta.url);
    const sqliteMod = requireFn("node:sqlite");
    DatabaseSync = sqliteMod.DatabaseSync;
  } catch {
    const err = new Error(
      "El motor node:sqlite no est\xE1 disponible en este entorno Node.js. En producci\xF3n sobre Vercel debes configurar TURSO_DATABASE_URL y TURSO_AUTH_TOKEN."
    );
    err.statusCode = 500;
    err.code = "SQLITE_NOT_AVAILABLE";
  }
  const repoDbPath = process.env.SQLITE_DB_PATH || path.resolve(process.cwd(), "data", "paa_platform.sqlite");
  let activeDbPath = repoDbPath;
  if (isVercel) {
    const tmpDir = path.join("/tmp", "ktest-data");
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    const tmpDbPath = path.join(tmpDir, "paa_platform.sqlite");
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(repoDbPath)) {
      try {
        fs.copyFileSync(repoDbPath, tmpDbPath);
      } catch {
      }
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
async function dbAll(sql, args = []) {
  if (isTursoConfigured()) {
    const [result] = await executeTursoPipeline([{ sql, args }]);
    return parseHranaResult(result);
  }
  const db = getLocalSqliteDb();
  return db.prepare(sql).all(...args);
}
async function dbGet(sql, args = []) {
  if (isTursoConfigured()) {
    const [result] = await executeTursoPipeline([{ sql, args }]);
    const rows = parseHranaResult(result);
    return rows[0];
  }
  const db = getLocalSqliteDb();
  return db.prepare(sql).get(...args);
}
async function dbRun(sql, args = []) {
  if (isTursoConfigured()) {
    const [result] = await executeTursoPipeline([{ sql, args }]);
    return { changes: Number(result?.affected_row_count ?? 0) };
  }
  const db = getLocalSqliteDb();
  const info = db.prepare(sql).run(...args);
  return { changes: Number(info?.changes ?? 0) };
}
async function dbBatch(statements) {
  if (statements.length === 0) return;
  if (isTursoConfigured()) {
    await executeTursoPipeline(statements);
    return;
  }
  const db = getLocalSqliteDb();
  for (const stmt of statements) {
    db.prepare(stmt.sql).run(...stmt.args || []);
  }
}

// server/database.ts
var UPLOADS_DIR = getUploadsDir();
var dbInitPromise = null;
async function ensureDbReady() {
  if (!dbInitPromise) {
    dbInitPromise = initializeSchemaAndSeed().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}
async function initializeSchemaAndSeed() {
  await dbBatch([
    {
      sql: `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
        cohort TEXT NOT NULL,
        microsoft_oid TEXT,
        google_id TEXT,
        auth_provider TEXT DEFAULT 'local',
        created_at TEXT NOT NULL
      )`
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS study_materials (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        section TEXT NOT NULL CHECK(section IN ('reading', 'math')),
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        reading_time_minutes INTEGER NOT NULL,
        author_id TEXT NOT NULL,
        author_name TEXT NOT NULL,
        attachment_name TEXT,
        attachment_mime TEXT,
        attachment_size INTEGER,
        attachment_url TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS test_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        mode TEXT NOT NULL CHECK(mode IN ('simulacro', 'sprint_reading', 'sprint_math')),
        mode_title TEXT NOT NULL,
        reading_correct INTEGER NOT NULL,
        reading_total INTEGER NOT NULL,
        math_correct INTEGER NOT NULL,
        math_total INTEGER NOT NULL,
        total_correct INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        percentage INTEGER NOT NULL,
        scaled_score INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        answers_json TEXT NOT NULL,
        completed_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS uploaded_files (
        filename TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data_base64 TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`
    }
  ]);
  const migrationCols = [
    `ALTER TABLE users ADD COLUMN microsoft_oid TEXT`,
    `ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'`,
    `ALTER TABLE users ADD COLUMN google_id TEXT`,
    `ALTER TABLE study_materials ADD COLUMN attachment_name TEXT`,
    `ALTER TABLE study_materials ADD COLUMN attachment_mime TEXT`,
    `ALTER TABLE study_materials ADD COLUMN attachment_size INTEGER`,
    `ALTER TABLE study_materials ADD COLUMN attachment_url TEXT`
  ];
  for (const sql of migrationCols) {
    try {
      await dbRun(sql);
    } catch {
    }
  }
  await seedDatabaseIfEmpty();
  const isCleanProductionSeed = isTursoConfigured() || (process.env.VITE_ENABLE_DEMO_ACCOUNTS || "true").trim().toLowerCase() === "false";
  if (!isCleanProductionSeed) {
    await ensureScaleSampleData();
  }
}
async function seedDatabaseIfEmpty() {
  const countRow = await dbGet("SELECT COUNT(*) as total FROM users");
  if (countRow && Number(countRow.total) > 0) return;
  const isCleanProductionSeed = isTursoConfigured() || (process.env.VITE_ENABLE_DEMO_ACCOUNTS || "true").trim().toLowerCase() === "false";
  const facultyTeachers = [
    [
      "tch-1",
      "Dr. Roberto M\xE9ndez",
      "roberto.mendez@keyinstitute.edu.sv",
      "docente2026",
      "teacher",
      "Departamento de Matem\xE1ticas y F\xEDsica Aplicada",
      "ms-oid-roberto-101",
      "microsoft",
      "2026-10-01T08:00:00Z"
    ],
    [
      "tch-2",
      "Mtra. Elena Valladares",
      "elena.valladares@keyinstitute.edu.sv",
      "docente2026",
      "teacher",
      "Coordinaci\xF3n de Lectura Cr\xEDtica y Comunicaci\xF3n Cient\xEDfica",
      "ms-oid-elena-102",
      "microsoft",
      "2026-10-01T08:05:00Z"
    ]
  ];
  const demoStudents = isCleanProductionSeed ? [] : [
    [
      "stu-1",
      "Sof\xEDa Mart\xEDnez",
      "sofia.martinez@keyinstitute.edu.sv",
      "key2026",
      "student",
      "Ingenier\xEDa en Ciencias de la Computaci\xF3n \xB7 Admisi\xF3n 2027",
      "ms-oid-sofia-001",
      "microsoft",
      "2026-10-15T08:30:00Z"
    ],
    [
      "stu-2",
      "Diego Alejandro Rivas",
      "diego.rivas@keyinstitute.edu.sv",
      "key2026",
      "student",
      "Ingenier\xEDa Mecatr\xF3nica y Rob\xF3tica \xB7 Admisi\xF3n 2027",
      "ms-oid-diego-002",
      "microsoft",
      "2026-10-16T09:15:00Z"
    ],
    [
      "stu-3",
      "Valeria C\xE1ceres",
      "valeria.caceres@keyinstitute.edu.sv",
      "key2026",
      "student",
      "Ingenier\xEDa Aeroespacial y Ciencias Aplicadas \xB7 Admisi\xF3n 2027",
      "ms-oid-valeria-003",
      "microsoft",
      "2026-10-18T14:00:00Z"
    ]
  ];
  const users = [...demoStudents, ...facultyTeachers];
  const statements = [];
  for (const u of users) {
    statements.push({
      sql: `INSERT OR IGNORE INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: u
    });
  }
  const materials = [
    [
      "mat-1",
      "Gu\xEDa Esencial: Relaciones de Vol\xFAmenes y Tri\xE1ngulos Especiales en la PAA",
      "math",
      "Geometr\xEDa y Trigonometr\xEDa",
      "Domina la comparaci\xF3n r\xE1pida entre cilindros, conos y esferas, as\xED como las razones exactas en tri\xE1ngulos 30\xB0-60\xB0-90\xB0 y 45\xB0-45\xB0-90\xB0.",
      `En la secci\xF3n de Matem\xE1ticas de la PAA, muchos problemas geom\xE9tricos se resuelven sin necesidad de largos c\xE1lculos decimales si identificas las proporciones estructurales entre figuras.

1) Proporci\xF3n Cilindro vs. Cono con igual base y altura:
El volumen de un cilindro circular recto es $V_{\\text{cil}} = \\pi r^2 h$, mientras que el volumen de un cono circular recto es $V_{\\text{cono}} = \\frac{1}{3}\\pi r^2 h$.
$$\\frac{V_{\\text{cilindro}}}{V_{\\text{cono}}} = 3$$
Por lo tanto, si un l\xEDquido llena un cilindro de altura $h = 10\\text{ cm}$ y se traslada a un cono del mismo radio, el cono necesitar\xE1 el triple de altura ($H = 30\\text{ cm}$) para alojar el mismo volumen.

2) Tri\xE1ngulos Rect\xE1ngulos Especiales:
\u2022 Tri\xE1ngulo $30^\\circ\\text{-}60^\\circ\\text{-}90^\\circ$: Si el cateto menor (opuesto a $30^\\circ$) mide $x$, el cateto adyacente (opuesto a $60^\\circ$) mide $x\\sqrt{3}$ y la hipotenusa mide exactamente $2x$.
\u2022 Tri\xE1ngulo $45^\\circ\\text{-}45^\\circ\\text{-}90^\\circ$: Los dos catetos son iguales ($s$) y la diagonal o hipotenusa mide $s\\sqrt{2}$. Si un cuadrado est\xE1 inscrito en un c\xEDrculo de radio $r$, su diagonal es igual al di\xE1metro $d = 2r = s\\sqrt{2}$.`,
      7,
      "tch-1",
      "Dr. Roberto M\xE9ndez",
      "2026-10-20T10:00:00Z"
    ],
    [
      "mat-2",
      "\xC1lgebra Estrat\xE9gica: Diferencia de Cuadrados y Forma Can\xF3nica Cuadr\xE1tica",
      "math",
      "\xC1lgebra y Funciones",
      "Aprende a reconocer atajos algebraicos en sistemas de ecuaciones y a leer el v\xE9rtice m\xE1ximo o m\xEDnimo de una par\xE1bola por inspecci\xF3n.",
      `El tiempo en la PAA es un recurso cr\xEDtico. Antes de despejar variables individuales en un sistema, observa qu\xE9 expresi\xF3n te pide realmente la pregunta.

1) Factorizaci\xF3n por Diferencia de Cuadrados:
Siempre que veas la expresi\xF3n $x^2 - y^2$, escr\xEDbela mentalmente como:
$$x^2 - y^2 = (x + y)(x - y)$$
Si el problema te entrega directamente $x + y = 14$ y $x - y = 6$, no necesitas hallar $x$ ni $y$ por separado: basta multiplicar $(14)(6) = 84$.

2) Forma Can\xF3nica (V\xE9rtice) de una Funci\xF3n Cuadr\xE1tica:
Una par\xE1bola expresada en la forma:
$$f(t) = a(t - h)^2 + k$$
tiene su v\xE9rtice exactamente en el punto $(h, k)$.
\u2022 Si $a < 0$, la par\xE1bola abre hacia abajo y alcanza su valor m\xE1ximo $k$ cuando $t = h$.
\u2022 Por ejemplo, en $h(t) = -5(t - 4)^2 + 120$, la altura m\xE1xima es $120\\text{ m}$ y ocurre en $t = 4\\text{ s}$.`,
      6,
      "tch-1",
      "Dr. Roberto M\xE9ndez",
      "2026-10-22T15:30:00Z"
    ],
    [
      "mat-3",
      "Lectura Cr\xEDtica por L\xEDneas Citadas: Vocabulario en Contexto e Inferencia",
      "reading",
      "Comprensi\xF3n de Lectura",
      "Estrategia de lectura en ventana (\xB13 l\xEDneas alrededor de la cita) para responder preguntas de vocabulario contextual y funci\xF3n estructural.",
      `En la vista dividida de Lectura de la PAA, los pasajes tienen sus l\xEDneas numeradas de 5 en 5 en el margen izquierdo. Aprovecha esta numeraci\xF3n aplicando la t\xE9cnica de ventana contextual:

1) Vocabulario en Contexto:
Cuando una pregunta cita las l\xEDneas 10\u201311 (por ejemplo, \xABfrugalidad creativa\xBB), nunca elijas la definici\xF3n literal de diccionario aislada. Lee desde dos l\xEDneas antes hasta dos l\xEDneas despu\xE9s: si el texto habla de dise\xF1ar sat\xE9lites modulares de $10\\text{ cm}$ y $1\\text{ kg}$ que redujeron costos en un orden de magnitud, \xABfrugalidad creativa\xBB significa maximizar la innovaci\xF3n con recursos f\xEDsicos y financieros m\xEDnimos.

2) Funci\xF3n de un P\xE1rrafo en la Estructura Global:
Observa siempre el conector inicial del p\xE1rrafo citado. Expresiones adversativas como \xABNo obstante,\xBB, \xABSin embargo,\xBB o \xABPor el contrario,\xBB indican un giro argumentativo o la introducci\xF3n de una advertencia/l\xEDmite t\xE9cnico frente a la tesis previa.`,
      5,
      "tch-2",
      "Mtra. Elena Valladares",
      "2026-10-21T11:20:00Z"
    ],
    [
      "mat-4",
      "Redacci\xF3n Indirecta PAA: Econom\xEDa Verbal, Que\xEDsmo y Conectores L\xF3gicos",
      "reading",
      "Redacci\xF3n y Estilo",
      "C\xF3mo identificar redundancias, giros perifr\xE1sticos (\xABDebido a esto, es que...\xBB) y elegir el conector l\xF3gico preciso.",
      `La secci\xF3n de Redacci\xF3n Indirecta de la PAA eval\xFAa tres pilares: concisi\xF3n (econom\xEDa verbal), precisi\xF3n normativa y cohesi\xF3n l\xF3gica entre oraciones.

1) Eliminaci\xF3n de Per\xEDfrasis Redundantes:
En espa\xF1ol acad\xE9mico se deben evitar construcciones pesadas como \xABDebido a esto, es que...\xBB, \xABEs por esta raz\xF3n que...\xBB o \xABA causa de esto es por lo que...\xBB. Sustit\xFAyelas por conectores causales limpios y directos como \xABPor ello,\xBB, \xABPor consiguiente,\xBB o \xABEn consecuencia,\xBB.

2) Uso del Punto y Coma con Conectores Adversativos:
Cuando dos proposiciones independientes contrastan capacidades complementarias \u2014por ejemplo, la velocidad de c\xE1lculo de una computadora frente al juicio \xE9tico humano\u2014, el uso de punto y coma seguido de \xAB; en cambio,\xBB o \xAB; sin embargo,\xBB establece un contraste equilibrado sin romper la unidad tem\xE1tica del p\xE1rrafo.`,
      6,
      "tch-2",
      "Mtra. Elena Valladares",
      "2026-10-23T09:45:00Z"
    ]
  ];
  for (const m of materials) {
    statements.push({
      sql: `INSERT OR IGNORE INTO study_materials (
              id, title, section, category, summary, content,
              reading_time_minutes, author_id, author_name, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: m
    });
  }
  if (!isCleanProductionSeed) {
    const sampleAttempts = [
      [
        "att-1",
        "stu-1",
        "simulacro",
        "Simulacro Oficial PAA (Test Completo)",
        5,
        5,
        4,
        5,
        9,
        10,
        90,
        1480,
        740,
        JSON.stringify({
          "read-1": "B",
          "read-2": "C",
          "read-3": "B",
          "read-4": "A",
          "read-5": "B",
          "math-1": "C",
          "math-2": "A",
          "math-3": "C",
          "math-4": "A",
          "math-5": "A"
        }),
        "2026-10-26T16:20:00Z"
      ],
      [
        "att-2",
        "stu-1",
        "sprint_math",
        "Sprint de Matem\xE1ticas (Test Corto)",
        0,
        0,
        5,
        5,
        5,
        5,
        100,
        800,
        245,
        JSON.stringify({
          "math-1": "C",
          "math-2": "A",
          "math-3": "C",
          "math-4": "A",
          "math-5": "B"
        }),
        "2026-10-27T18:10:00Z"
      ],
      [
        "att-3",
        "stu-2",
        "simulacro",
        "Simulacro Oficial PAA (Test Completo)",
        3,
        5,
        4,
        5,
        7,
        10,
        70,
        1240,
        890,
        JSON.stringify({
          "read-1": "B",
          "read-2": "A",
          "read-3": "B",
          "read-4": "B",
          "read-5": "B",
          "math-1": "C",
          "math-2": "A",
          "math-3": "C",
          "math-4": "B",
          "math-5": "B"
        }),
        "2026-10-27T11:40:00Z"
      ],
      [
        "att-4",
        "stu-2",
        "sprint_reading",
        "Sprint de Lectura y Redacci\xF3n (Test Corto)",
        4,
        5,
        0,
        0,
        4,
        5,
        80,
        680,
        210,
        JSON.stringify({
          "read-1": "B",
          "read-2": "C",
          "read-3": "B",
          "read-4": "A",
          "read-5": "A"
        }),
        "2026-10-28T09:15:00Z"
      ],
      [
        "att-5",
        "stu-3",
        "simulacro",
        "Simulacro Oficial PAA (Test Completo)",
        4,
        5,
        5,
        5,
        9,
        10,
        90,
        1480,
        685,
        JSON.stringify({
          "read-1": "B",
          "read-2": "C",
          "read-3": "A",
          "read-4": "A",
          "read-5": "B",
          "math-1": "C",
          "math-2": "A",
          "math-3": "C",
          "math-4": "A",
          "math-5": "B"
        }),
        "2026-10-28T15:05:00Z"
      ]
    ];
    for (const att of sampleAttempts) {
      statements.push({
        sql: `INSERT OR IGNORE INTO test_attempts (
                id, user_id, mode, mode_title,
                reading_correct, reading_total, math_correct, math_total,
                total_correct, total_questions, percentage, scaled_score,
                duration_seconds, answers_json, completed_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: att
      });
    }
  }
  await dbBatch(statements);
}
async function ensureScaleSampleData() {
  const stuCountRow = await dbGet(
    "SELECT COUNT(*) as total FROM users WHERE role = 'student'"
  );
  if (stuCountRow && Number(stuCountRow.total) >= 10) return;
  const statements = [
    {
      sql: "UPDATE users SET cohort = ? WHERE id = 'stu-1'",
      args: ["Ingenier\xEDa en Ciencias de la Computaci\xF3n \xB7 Admisi\xF3n 2027"]
    },
    {
      sql: "UPDATE users SET cohort = ? WHERE id = 'stu-2'",
      args: ["Ingenier\xEDa Mecatr\xF3nica y Rob\xF3tica \xB7 Admisi\xF3n 2027"]
    },
    {
      sql: "UPDATE users SET cohort = ? WHERE id = 'stu-3'",
      args: ["Ingenier\xEDa Aeroespacial y Ciencias Aplicadas \xB7 Admisi\xF3n 2027"]
    }
  ];
  const extraStudents = [
    [
      "stu-4",
      "Mateo Hern\xE1ndez Lemus",
      "mateo.hernandez@keyinstitute.edu.sv",
      "Ingenier\xEDa en Ciencias de la Computaci\xF3n \xB7 Admisi\xF3n 2027",
      "ms-oid-mateo-004",
      "2026-10-19T10:00:00Z"
    ],
    [
      "stu-5",
      "Camila Beatriz Sol\xEDs",
      "camila.solis@keyinstitute.edu.sv",
      "Ingenier\xEDa Industrial y de Sistemas \xB7 Admisi\xF3n 2027",
      "ms-oid-camila-005",
      "2026-10-19T11:30:00Z"
    ],
    [
      "stu-6",
      "Andr\xE9s Emiliano Pineda",
      "andres.pineda@keyinstitute.edu.sv",
      "Ingenier\xEDa Mecatr\xF3nica y Rob\xF3tica \xB7 Admisi\xF3n 2027",
      "ms-oid-andres-006",
      "2026-10-20T09:00:00Z"
    ],
    [
      "stu-7",
      "Luc\xEDa Fernanda Zelaya",
      "lucia.zelaya@keyinstitute.edu.sv",
      "Ingenier\xEDa en Energ\xEDa y Sostenibilidad \xB7 Admisi\xF3n 2027",
      "ms-oid-lucia-007",
      "2026-10-20T14:20:00Z"
    ],
    [
      "stu-8",
      "Gabriel Ernesto \xC1vila",
      "gabriel.avila@keyinstitute.edu.sv",
      "Ingenier\xEDa Aeroespacial y Ciencias Aplicadas \xB7 Admisi\xF3n 2027",
      "ms-oid-gabriel-008",
      "2026-10-21T08:45:00Z"
    ],
    [
      "stu-9",
      "Mariana Isabel Orellana",
      "mariana.orellana@keyinstitute.edu.sv",
      "Ingenier\xEDa en Ciencias de la Computaci\xF3n \xB7 Admisi\xF3n 2027",
      "ms-oid-mariana-009",
      "2026-10-21T16:10:00Z"
    ],
    [
      "stu-10",
      "Sebasti\xE1n Rodrigo Portillo",
      "sebastian.portillo@keyinstitute.edu.sv",
      "Ingenier\xEDa Industrial y de Sistemas \xB7 Admisi\xF3n 2027",
      "ms-oid-sebastian-010",
      "2026-10-22T10:05:00Z"
    ],
    [
      "stu-11",
      "Daniela Alejandra Mena",
      "daniela.mena@keyinstitute.edu.sv",
      "Ingenier\xEDa en Energ\xEDa y Sostenibilidad \xB7 Admisi\xF3n 2027",
      "ms-oid-daniela-011",
      "2026-10-22T13:40:00Z"
    ],
    [
      "stu-12",
      "Javier Alejandro Mel\xE9ndez",
      "javier.melendez@keyinstitute.edu.sv",
      "Ingenier\xEDa Mecatr\xF3nica y Rob\xF3tica \xB7 Admisi\xF3n 2027",
      "ms-oid-javier-012",
      "2026-10-23T09:15:00Z"
    ]
  ];
  for (const s of extraStudents) {
    statements.push({
      sql: `INSERT OR IGNORE INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
            VALUES (?, ?, ?, 'MICROSOFT_SSO', 'student', ?, ?, 'microsoft', ?)`,
      args: s
    });
  }
  await dbBatch(statements);
}
async function getAllUsers() {
  await ensureDbReady();
  return dbAll(
    `SELECT
       id,
       name,
       email,
       role,
       cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     ORDER BY role ASC, name ASC`
  );
}
async function updateUserCohort(userId, cohort, options) {
  await ensureDbReady();
  const existingUser = await dbGet(
    `SELECT id, role, cohort, name FROM users WHERE id = ?`,
    [userId]
  );
  if (!existingUser) {
    const err = new Error("Usuario no encontrado.");
    err.statusCode = 404;
    throw err;
  }
  const isTeacher = options?.allowOverride || options?.updatedByRole === "teacher";
  if (!isTeacher && existingUser.role === "student" && existingUser.cohort && existingUser.cohort.trim() !== "") {
    const err = new Error(
      "El ciclo de admisi\xF3n ya ha sido definido y no puede ser modificado por el estudiante."
    );
    err.statusCode = 403;
    err.code = "COHORT_ALREADY_SET";
    throw err;
  }
  const newCohort = typeof cohort === "string" ? cohort.trim() : existingUser.cohort;
  const newName = isTeacher && typeof options?.name === "string" && options.name.trim() !== "" ? options.name.trim() : existingUser.name;
  await dbRun(`UPDATE users SET cohort = ?, name = ? WHERE id = ?`, [newCohort, newName, userId]);
  return dbGet(
    `SELECT
       id,
       name,
       email,
       role,
       cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     WHERE id = ?`,
    [userId]
  );
}
function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}
function isEmailDomainAllowed(email) {
  const rawRule = (process.env.ALLOWED_EMAIL_DOMAINS || "*").trim();
  if (!rawRule || rawRule === "*") {
    return { allowed: true, allowedList: ["*"] };
  }
  const allowedList = rawRule.split(",").map((d) => d.trim().toLowerCase().replace(/^@/, "")).filter(Boolean);
  const emailDomain = email.split("@")[1]?.toLowerCase() || "";
  return {
    allowed: allowedList.includes(emailDomain),
    allowedList
  };
}
function isTeacherInstitutionalDomain(email) {
  const rawRule = (process.env.TEACHER_EMAIL_DOMAINS || "keyinstitute.edu.sv").trim();
  const allowedList = rawRule.split(",").map((d) => d.trim().toLowerCase().replace(/^@/, "")).filter(Boolean);
  const emailDomain = email.split("@")[1]?.toLowerCase() || "";
  return {
    allowed: allowedList.includes(emailDomain),
    allowedList
  };
}
async function verifyTokenWithMicrosoftGraph(accessToken) {
  const response = await fetch("https://graph.microsoft.com/v1.0/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    const err = new Error(
      "Microsoft Graph rechaz\xF3 el token de acceso. Autenticaci\xF3n no v\xE1lida."
    );
    err.statusCode = 401;
    throw err;
  }
  const profile = await response.json();
  return {
    microsoftOid: profile.id,
    name: profile.displayName || profile.givenName || "",
    email: (profile.mail || profile.userPrincipalName || "").toLowerCase()
  };
}
async function authenticateMicrosoftUser(payload) {
  await ensureDbReady();
  let verifiedEmail = (payload.email || "").trim().toLowerCase();
  let verifiedName = (payload.name || "").trim();
  let verifiedOid = payload.microsoftOid || "";
  if (payload.accessToken) {
    const graphProfile = await verifyTokenWithMicrosoftGraph(payload.accessToken);
    verifiedEmail = graphProfile.email || verifiedEmail;
    verifiedName = graphProfile.name || verifiedName;
    verifiedOid = graphProfile.microsoftOid || verifiedOid;
  } else if (payload.idToken) {
    const claims = decodeJwtPayload(payload.idToken);
    if (!claims) {
      const err = new Error("El token devuelto por Microsoft Entra ID es inv\xE1lido.");
      err.statusCode = 401;
      throw err;
    }
    if (claims.exp && Date.now() >= claims.exp * 1e3) {
      const err = new Error("La sesi\xF3n de Microsoft ha expirado. Vuelve a intentarlo.");
      err.statusCode = 401;
      throw err;
    }
    verifiedEmail = (claims.preferred_username || claims.email || claims.upn || verifiedEmail).trim().toLowerCase();
    verifiedName = (claims.name || verifiedName).trim();
    verifiedOid = claims.oid || claims.sub || verifiedOid;
  }
  if (!verifiedEmail || !verifiedEmail.includes("@")) {
    const err = new Error("Microsoft no devolvi\xF3 un correo institucional v\xE1lido.");
    err.statusCode = 400;
    throw err;
  }
  if (!verifiedName) {
    verifiedName = verifiedEmail.split("@")[0].replace(/[._]/g, " ");
  }
  const domainCheck = isEmailDomainAllowed(verifiedEmail);
  if (!domainCheck.allowed) {
    const err = new Error(
      `El correo ${verifiedEmail} no pertenece a los dominios institucionales autorizados (${domainCheck.allowedList.map((d) => `@${d}`).join(", ")}).`
    );
    err.statusCode = 403;
    throw err;
  }
  const existingUser = await dbGet(
    `SELECT
       id, name, email, role, cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     WHERE LOWER(email) = ?`,
    [verifiedEmail]
  );
  const teacherDomainCheck = isTeacherInstitutionalDomain(verifiedEmail);
  const isTeacher = teacherDomainCheck.allowed;
  if (isTeacher) {
    if (existingUser) {
      const updatedCohort = existingUser.role === "teacher" ? existingUser.cohort : "C\xE1tedra Key Institute \xB7 Microsoft 365";
      await dbRun(
        `UPDATE users
         SET role = 'teacher',
             name = ?,
             cohort = ?,
             microsoft_oid = COALESCE(NULLIF(?, ''), microsoft_oid),
             auth_provider = CASE WHEN auth_provider = 'google' THEN 'hybrid' ELSE 'microsoft' END
         WHERE id = ?`,
        [verifiedName, updatedCohort, verifiedOid, existingUser.id]
      );
    } else {
      const id = `tch-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = (/* @__PURE__ */ new Date()).toISOString();
      const cohort = "C\xE1tedra Key Institute \xB7 Microsoft 365";
      await dbRun(
        `INSERT INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
         VALUES (?, ?, ?, 'MICROSOFT_SSO', 'teacher', ?, ?, 'microsoft', ?)`,
        [id, verifiedName, verifiedEmail, cohort, verifiedOid || `ms-${id}`, createdAt]
      );
    }
  } else {
    if (existingUser) {
      const updatedCohort = existingUser.cohort || payload.cohort?.trim() || "";
      await dbRun(
        `UPDATE users
         SET role = 'student',
             name = ?,
             cohort = ?,
             microsoft_oid = COALESCE(NULLIF(?, ''), microsoft_oid),
             auth_provider = CASE WHEN auth_provider = 'google' THEN 'hybrid' ELSE 'microsoft' END
         WHERE id = ?`,
        [verifiedName, updatedCohort, verifiedOid, existingUser.id]
      );
    } else {
      const id = `stu-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = (/* @__PURE__ */ new Date()).toISOString();
      const cohort = payload.cohort?.trim() || "";
      await dbRun(
        `INSERT INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
         VALUES (?, ?, ?, 'MICROSOFT_SSO', 'student', ?, ?, 'microsoft', ?)`,
        [id, verifiedName, verifiedEmail, cohort, verifiedOid || `ms-${id}`, createdAt]
      );
    }
  }
  return dbGet(
    `SELECT
       id, name, email, role, cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     WHERE LOWER(email) = ?`,
    [verifiedEmail]
  );
}
async function verifyGoogleAccessToken(accessToken) {
  const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!response.ok) {
    const err = new Error(
      "Google rechaz\xF3 el token de acceso. Autenticaci\xF3n no v\xE1lida."
    );
    err.statusCode = 401;
    throw err;
  }
  const profile = await response.json();
  return {
    googleId: profile.sub,
    name: profile.name || profile.given_name || "",
    email: (profile.email || "").toLowerCase()
  };
}
async function authenticateGoogleUser(payload) {
  await ensureDbReady();
  let verifiedEmail = (payload.email || "").trim().toLowerCase();
  let verifiedName = (payload.name || "").trim();
  let verifiedGoogleId = payload.googleId || "";
  if (payload.accessToken) {
    try {
      const gProfile = await verifyGoogleAccessToken(payload.accessToken);
      verifiedEmail = gProfile.email || verifiedEmail;
      verifiedName = gProfile.name || verifiedName;
      verifiedGoogleId = gProfile.googleId || verifiedGoogleId;
    } catch (e) {
      if (!verifiedEmail) throw e;
    }
  } else if (payload.idToken) {
    const claims = decodeJwtPayload(payload.idToken);
    if (claims) {
      verifiedEmail = (claims.email || verifiedEmail).trim().toLowerCase();
      verifiedName = (claims.name || verifiedName).trim();
      verifiedGoogleId = claims.sub || verifiedGoogleId;
    }
  }
  if (!verifiedEmail || !verifiedEmail.includes("@")) {
    const err = new Error("Google no devolvi\xF3 un correo v\xE1lido.");
    err.statusCode = 400;
    throw err;
  }
  if (!verifiedName) {
    verifiedName = verifiedEmail.split("@")[0].replace(/[._]/g, " ");
  }
  const domainCheck = isEmailDomainAllowed(verifiedEmail);
  if (!domainCheck.allowed) {
    const err = new Error(
      `El correo ${verifiedEmail} no pertenece a los dominios autorizados (${domainCheck.allowedList.map((d) => `@${d}`).join(", ")}).`
    );
    err.statusCode = 403;
    throw err;
  }
  const existingUser = await dbGet(
    `SELECT
       id, name, email, role, cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     WHERE LOWER(email) = ?`,
    [verifiedEmail]
  );
  if (existingUser) {
    const updatedCohort = existingUser.cohort || payload.cohort?.trim() || "";
    await dbRun(
      `UPDATE users
       SET role = 'student',
           name = ?,
           cohort = ?,
           google_id = COALESCE(NULLIF(?, ''), google_id),
           auth_provider = CASE WHEN auth_provider = 'microsoft' THEN 'hybrid' ELSE 'google' END
       WHERE id = ?`,
      [verifiedName, updatedCohort, verifiedGoogleId, existingUser.id]
    );
  } else {
    const id = `stu-${crypto.randomUUID().slice(0, 8)}`;
    const createdAt = (/* @__PURE__ */ new Date()).toISOString();
    const cohort = payload.cohort?.trim() || "";
    await dbRun(
      `INSERT INTO users (id, name, email, password, role, cohort, google_id, auth_provider, created_at)
       VALUES (?, ?, ?, 'GOOGLE_OAUTH', 'student', ?, ?, 'google', ?)`,
      [id, verifiedName, verifiedEmail, cohort, verifiedGoogleId || `goog-${id}`, createdAt]
    );
  }
  return dbGet(
    `SELECT
       id, name, email, role, cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     WHERE LOWER(email) = ?`,
    [verifiedEmail]
  );
}
async function loginUser(email, password) {
  await ensureDbReady();
  const normalized = email.trim().toLowerCase();
  const user = await dbGet(
    `SELECT
       id, name, email, password, role, cohort,
       microsoft_oid as microsoftOid,
       google_id as googleId,
       auth_provider as authProvider,
       created_at as createdAt
     FROM users
     WHERE LOWER(email) = ?`,
    [normalized]
  );
  if (!user) return null;
  if (password !== void 0 && password !== "" && user.password !== password) {
    return null;
  }
  const { password: _pw, ...safeUser } = user;
  return safeUser;
}
async function registerUser(payload) {
  await ensureDbReady();
  const id = `${payload.role === "teacher" ? "tch" : "stu"}-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const email = payload.email.trim().toLowerCase();
  const password = payload.password?.trim() || "key2026";
  await dbRun(
    `INSERT INTO users (id, name, email, password, role, cohort, auth_provider, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'local', ?)`,
    [id, payload.name.trim(), email, password, payload.role, payload.cohort.trim(), createdAt]
  );
  return {
    id,
    name: payload.name.trim(),
    email,
    role: payload.role,
    cohort: payload.cohort.trim(),
    authProvider: "local",
    createdAt
  };
}
async function getAllStudyMaterials() {
  await ensureDbReady();
  return dbAll(
    `SELECT
       id,
       title,
       section,
       category,
       summary,
       content,
       reading_time_minutes as readingTimeMinutes,
       author_id as authorId,
       author_name as authorName,
       attachment_name as attachmentName,
       attachment_mime as attachmentMime,
       attachment_size as attachmentSize,
       attachment_url as attachmentUrl,
       created_at as createdAt
     FROM study_materials
     ORDER BY datetime(created_at) DESC`
  );
}
async function getUploadedFileFromDb(filename) {
  await ensureDbReady();
  const row = await dbGet(
    `SELECT mime_type as mimeType, size, data_base64 as dataBase64
     FROM uploaded_files
     WHERE filename = ?`,
    [filename]
  );
  if (!row || !row.dataBase64) return null;
  const buffer = Buffer.from(row.dataBase64, "base64");
  return {
    mimeType: row.mimeType || "application/octet-stream",
    size: Number(row.size) || buffer.length,
    buffer
  };
}
async function saveBase64AttachmentIfPresent(payload) {
  if (payload.attachmentDataBase64 && payload.attachmentName) {
    const safeName = payload.attachmentName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}-${safeName}`;
    const base64Clean = payload.attachmentDataBase64.includes("base64,") ? payload.attachmentDataBase64.split("base64,")[1] : payload.attachmentDataBase64;
    const buffer = Buffer.from(base64Clean, "base64");
    const mimeType = payload.attachmentMime || "application/octet-stream";
    const byteSize = payload.attachmentSize || buffer.length;
    try {
      const filePath = path2.join(UPLOADS_DIR, uniqueFileName);
      fs2.writeFileSync(filePath, buffer);
    } catch {
    }
    await dbRun(
      `INSERT OR REPLACE INTO uploaded_files (filename, mime_type, size, data_base64, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uniqueFileName, mimeType, byteSize, base64Clean, (/* @__PURE__ */ new Date()).toISOString()]
    );
    return {
      attachmentName: payload.attachmentName,
      attachmentMime: mimeType,
      attachmentSize: byteSize,
      attachmentUrl: `/api/uploads/${encodeURIComponent(uniqueFileName)}`
    };
  }
  return {
    attachmentName: payload.attachmentName ?? null,
    attachmentMime: payload.attachmentMime ?? null,
    attachmentSize: payload.attachmentSize ?? null,
    attachmentUrl: payload.attachmentUrl ?? null
  };
}
async function createStudyMaterial(payload) {
  await ensureDbReady();
  const id = `mat-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = (/* @__PURE__ */ new Date()).toISOString();
  const att = await saveBase64AttachmentIfPresent(payload);
  await dbRun(
    `INSERT INTO study_materials (
       id, title, section, category, summary, content,
       reading_time_minutes, author_id, author_name,
       attachment_name, attachment_mime, attachment_size, attachment_url,
       created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.title.trim(),
      payload.section,
      payload.category.trim(),
      payload.summary.trim(),
      payload.content.trim(),
      Number(payload.readingTimeMinutes) || 5,
      payload.authorId,
      payload.authorName,
      att.attachmentName,
      att.attachmentMime,
      att.attachmentSize,
      att.attachmentUrl,
      createdAt
    ]
  );
  const all = await getAllStudyMaterials();
  return all.find((m) => m.id === id);
}
async function updateStudyMaterial(id, payload) {
  await ensureDbReady();
  const allBefore = await getAllStudyMaterials();
  const existing = allBefore.find((m) => m.id === id);
  let att = {
    attachmentName: existing?.attachmentName ?? null,
    attachmentMime: existing?.attachmentMime ?? null,
    attachmentSize: existing?.attachmentSize ?? null,
    attachmentUrl: existing?.attachmentUrl ?? null
  };
  if (payload.removeAttachment) {
    att = {
      attachmentName: null,
      attachmentMime: null,
      attachmentSize: null,
      attachmentUrl: null
    };
  } else if (payload.attachmentDataBase64 && payload.attachmentName) {
    att = await saveBase64AttachmentIfPresent(payload);
  }
  await dbRun(
    `UPDATE study_materials
     SET title = ?,
         section = ?,
         category = ?,
         summary = ?,
         content = ?,
         reading_time_minutes = ?,
         attachment_name = ?,
         attachment_mime = ?,
         attachment_size = ?,
         attachment_url = ?
     WHERE id = ?`,
    [
      payload.title.trim(),
      payload.section,
      payload.category.trim(),
      payload.summary.trim(),
      payload.content.trim(),
      Number(payload.readingTimeMinutes) || 5,
      att.attachmentName,
      att.attachmentMime,
      att.attachmentSize,
      att.attachmentUrl,
      id
    ]
  );
  const allAfter = await getAllStudyMaterials();
  return allAfter.find((m) => m.id === id);
}
async function deleteStudyMaterial(id) {
  await ensureDbReady();
  await dbRun("DELETE FROM study_materials WHERE id = ?", [id]);
  return { deletedId: id };
}
async function getAllTestAttempts(userId) {
  await ensureDbReady();
  const baseQuery = `
    SELECT
      t.id,
      t.user_id as userId,
      u.name as userName,
      u.email as userEmail,
      u.cohort as userCohort,
      t.mode,
      t.mode_title as modeTitle,
      t.reading_correct as readingCorrect,
      t.reading_total as readingTotal,
      t.math_correct as mathCorrect,
      t.math_total as mathTotal,
      t.total_correct as totalCorrect,
      t.total_questions as totalQuestions,
      t.percentage,
      t.scaled_score as scaledScore,
      t.duration_seconds as durationSeconds,
      t.answers_json as answersJson,
      t.completed_at as completedAt
    FROM test_attempts t
    JOIN users u ON u.id = t.user_id
  `;
  const rows = userId ? await dbAll(`${baseQuery} WHERE t.user_id = ? ORDER BY datetime(t.completed_at) DESC`, [
    userId
  ]) : await dbAll(`${baseQuery} ORDER BY datetime(t.completed_at) DESC`);
  return rows.map((row) => {
    const { answersJson, ...rest } = row;
    let answers = {};
    try {
      answers = JSON.parse(answersJson || "{}");
    } catch {
      answers = {};
    }
    return {
      ...rest,
      answers
    };
  });
}
async function createTestAttempt(payload) {
  await ensureDbReady();
  const id = `att-${crypto.randomUUID().slice(0, 8)}`;
  const completedAt = (/* @__PURE__ */ new Date()).toISOString();
  await dbRun(
    `INSERT INTO test_attempts (
       id, user_id, mode, mode_title,
       reading_correct, reading_total, math_correct, math_total,
       total_correct, total_questions, percentage, scaled_score,
       duration_seconds, answers_json, completed_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      payload.userId,
      payload.mode,
      payload.modeTitle,
      payload.readingCorrect,
      payload.readingTotal,
      payload.mathCorrect,
      payload.mathTotal,
      payload.totalCorrect,
      payload.totalQuestions,
      payload.percentage,
      payload.scaledScore,
      payload.durationSeconds,
      JSON.stringify(payload.answers ?? {}),
      completedAt
    ]
  );
  const all = await getAllTestAttempts();
  return all.find((item) => item.id === id);
}

// server/apiPlugin.ts
function readJsonBody(req) {
  if (req.body !== void 0 && req.body !== null) {
    if (typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      return Promise.resolve(req.body);
    }
    if (typeof req.body === "string") {
      try {
        return Promise.resolve(req.body.trim() ? JSON.parse(req.body) : {});
      } catch (e) {
        const err = new Error(
          `Formato JSON inv\xE1lido en el cuerpo de la petici\xF3n: ${e.message}`
        );
        err.statusCode = 400;
        err.code = "INVALID_JSON_BODY";
        return Promise.reject(err);
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return Promise.resolve(JSON.parse(req.body.toString("utf-8")));
      } catch (e) {
        const err = new Error(
          `Formato JSON inv\xE1lido en el cuerpo de la petici\xF3n: ${e.message}`
        );
        err.statusCode = 400;
        err.code = "INVALID_JSON_BODY";
        return Promise.reject(err);
      }
    }
  }
  if (req.readableEnded) {
    return Promise.resolve({});
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => {
      if (chunks.length === 0) return resolve({});
      try {
        const raw = Buffer.concat(chunks).toString("utf-8");
        resolve(raw.trim() ? JSON.parse(raw) : {});
      } catch (err) {
        const parseErr = new Error(
          `Formato JSON inv\xE1lido en el cuerpo de la petici\xF3n: ${err.message}`
        );
        parseErr.statusCode = 400;
        parseErr.code = "INVALID_JSON_BODY";
        reject(parseErr);
      }
    });
    req.on("error", reject);
  });
}
function sendJson(res, statusCode, payload) {
  if (res.writableEnded) return;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}
function getMimeTypeByExtension(filename) {
  const ext = path3.extname(filename).toLowerCase();
  const map = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".csv": "text/csv; charset=utf-8",
    ".txt": "text/plain; charset=utf-8"
  };
  return map[ext] || "application/octet-stream";
}
async function handleApiRequest(req, res) {
  const urlObj = new URL(req.url || "/", "http://localhost");
  const queryParam = req.query?.__pathname;
  const queryPathname = typeof queryParam === "string" && queryParam || Array.isArray(queryParam) && typeof queryParam[0] === "string" && queryParam[0] || urlObj.searchParams.get("__pathname");
  const catchAllParam = req.query?.path;
  const catchAllPath = Array.isArray(catchAllParam) ? catchAllParam.join("/") : typeof catchAllParam === "string" ? catchAllParam : "";
  const catchAllPathname = catchAllPath ? catchAllPath.startsWith("/api") ? catchAllPath : "/api/" + (catchAllPath.startsWith("/") ? catchAllPath.slice(1) : catchAllPath) : "";
  const rawCandidate = queryPathname || catchAllPathname || (typeof req.headers?.["x-forwarded-uri"] === "string" ? req.headers["x-forwarded-uri"] : "") || (typeof req.headers?.["x-matched-path"] === "string" ? req.headers["x-matched-path"] : "") || (typeof req.originalUrl === "string" ? req.originalUrl : "") || urlObj.pathname || "/";
  let pathname = rawCandidate.split("?")[0].split("#")[0].trim() || "/";
  pathname = pathname.replace(/\/+/g, "/");
  if (pathname === "/" || pathname === "") {
    pathname = "/api";
  } else if (!pathname.startsWith("/api")) {
    pathname = "/api" + (pathname.startsWith("/") ? pathname : "/" + pathname);
  }
  while (pathname.length > 4 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1);
  }
  if (pathname === "/api/index" || pathname === "/api/index.js" || pathname === "/api/[...path]" || pathname === "/api/[...path].js") {
    pathname = "/api";
  }
  const method = (req.method || "GET").toUpperCase();
  if (typeof res.setHeader === "function") {
    res.setHeader("Access-Control-Allow-Origin", req.headers?.origin || "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      req.headers?.["access-control-request-headers"] || "Content-Type, Authorization, X-Requested-With, Accept"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  if (method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return true;
  }
  try {
    if (method === "GET" && (pathname === "/api/health" || pathname === "/api")) {
      const { url: urlEnv, token: tokenEnv } = getTursoConfig();
      const detectedKeys = Object.keys(process.env).filter(
        (k) => /turso|database|token/i.test(k)
      );
      sendJson(res, 200, {
        status: "ok",
        tursoConfigured: isTursoConfigured(),
        diagnostics: {
          hasTursoUrl: Boolean(urlEnv),
          urlPrefix: urlEnv ? urlEnv.slice(0, 15) + "..." : null,
          hasTursoToken: Boolean(tokenEnv),
          tokenLength: tokenEnv.length,
          detectedEnvKeys: detectedKeys
        },
        environment: process.env.NODE_ENV || "production",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      return true;
    }
    if (method === "GET" && pathname.startsWith("/api/uploads/")) {
      const encodedName = pathname.replace("/api/uploads/", "").trim();
      if (!encodedName) {
        sendJson(res, 400, { error: "Nombre de archivo requerido" });
        return true;
      }
      let decodedName;
      try {
        decodedName = decodeURIComponent(encodedName);
      } catch {
        decodedName = encodedName;
      }
      const fileName = path3.basename(decodedName).trim();
      if (!fileName || fileName === "." || fileName === "..") {
        sendJson(res, 400, { error: "Nombre de archivo inv\xE1lido" });
        return true;
      }
      const filePath = path3.join(UPLOADS_DIR, fileName);
      if (fs3.existsSync(filePath)) {
        const mime2 = getMimeTypeByExtension(fileName);
        const stat = fs3.statSync(filePath);
        res.statusCode = 200;
        res.setHeader("Content-Type", mime2);
        res.setHeader("Content-Length", stat.size);
        const isInlinePreviewable2 = mime2 === "application/pdf" || mime2.startsWith("image/");
        res.setHeader(
          "Content-Disposition",
          `${isInlinePreviewable2 ? "inline" : "attachment"}; filename="${encodeURIComponent(
            fileName
          )}"`
        );
        const stream = fs3.createReadStream(filePath);
        stream.pipe(res);
        return true;
      }
      const dbFile = await getUploadedFileFromDb(fileName);
      if (!dbFile) {
        sendJson(res, 404, { error: "Archivo adjunto no encontrado" });
        return true;
      }
      const mime = dbFile.mimeType || getMimeTypeByExtension(fileName);
      res.statusCode = 200;
      res.setHeader("Content-Type", mime);
      res.setHeader("Content-Length", dbFile.buffer.length);
      const isInlinePreviewable = mime === "application/pdf" || mime.startsWith("image/");
      res.setHeader(
        "Content-Disposition",
        `${isInlinePreviewable ? "inline" : "attachment"}; filename="${encodeURIComponent(
          fileName
        )}"`
      );
      res.end(dbFile.buffer);
      return true;
    }
    if (method === "GET" && pathname === "/api/bootstrap") {
      const [users, materials, attempts] = await Promise.all([
        getAllUsers(),
        getAllStudyMaterials(),
        getAllTestAttempts()
      ]);
      sendJson(res, 200, {
        users,
        materials,
        attempts,
        authConfig: {
          alwaysRequireTeacherPin: (process.env.ALWAYS_REQUIRE_TEACHER_PIN || "false").trim().toLowerCase() === "true",
          allowedDomains: process.env.ALLOWED_EMAIL_DOMAINS || "*"
        }
      });
      return true;
    }
    if (method === "POST" && pathname === "/api/auth/microsoft") {
      const body = await readJsonBody(req);
      const user = await authenticateMicrosoftUser({
        name: body.name,
        email: body.email,
        microsoftOid: body.microsoftOid,
        idToken: body.idToken,
        accessToken: body.accessToken,
        requestedRole: body.requestedRole === "teacher" ? "teacher" : "student",
        teacherPin: body.teacherPin,
        cohort: body.cohort
      });
      const users = await getAllUsers();
      sendJson(res, 200, { user, users });
      return true;
    }
    if (method === "POST" && pathname === "/api/auth/google") {
      const body = await readJsonBody(req);
      const user = await authenticateGoogleUser({
        name: body.name,
        email: body.email,
        googleId: body.googleId,
        idToken: body.idToken,
        accessToken: body.accessToken,
        requestedRole: body.requestedRole === "teacher" ? "teacher" : "student",
        teacherPin: body.teacherPin,
        cohort: body.cohort
      });
      const users = await getAllUsers();
      sendJson(res, 200, { user, users });
      return true;
    }
    if (method === "POST" && pathname === "/api/auth/login") {
      const body = await readJsonBody(req);
      const user = await loginUser(body.email || "", body.password);
      if (!user) {
        sendJson(res, 401, {
          error: "Credenciales inv\xE1lidas o usuario no encontrado."
        });
        return true;
      }
      sendJson(res, 200, { user });
      return true;
    }
    if (method === "POST" && pathname === "/api/auth/register") {
      const body = await readJsonBody(req);
      if (!body.name || !body.email || !body.role) {
        sendJson(res, 400, {
          error: "Nombre, correo y clase de usuario son obligatorios."
        });
        return true;
      }
      const user = await registerUser({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role === "teacher" ? "teacher" : "student",
        cohort: body.cohort || (body.role === "teacher" ? "C\xE1tedra Key Institute" : "Cohorte Admisi\xF3n Ingenier\xEDa 2027")
      });
      const users = await getAllUsers();
      sendJson(res, 201, { user, users });
      return true;
    }
    if (method === "PUT" && pathname.startsWith("/api/users/") && pathname.endsWith("/cohort")) {
      const match = pathname.match(/^\/api\/users\/(.+)\/cohort$/);
      let userId = "";
      if (match && match[1]) {
        try {
          userId = decodeURIComponent(match[1]).trim();
        } catch {
          userId = match[1].trim();
        }
      }
      if (!userId) {
        sendJson(res, 400, { error: "Identificador de usuario obligatorio" });
        return true;
      }
      const body = await readJsonBody(req);
      if (body.cohort === void 0 || body.cohort === null) {
        sendJson(res, 400, { error: "La cohorte es obligatoria" });
        return true;
      }
      const updatedUser = await updateUserCohort(userId, body.cohort, {
        allowOverride: body.allowOverride === true,
        updatedByRole: body.updatedByRole,
        name: body.name
      });
      const [users, attempts] = await Promise.all([
        getAllUsers(),
        getAllTestAttempts()
      ]);
      sendJson(res, 200, {
        user: updatedUser,
        users,
        attempts
      });
      return true;
    }
    if (method === "GET" && pathname === "/api/materials") {
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, { materials });
      return true;
    }
    if (method === "POST" && pathname === "/api/materials") {
      const body = await readJsonBody(req);
      const created = await createStudyMaterial(body);
      const materials = await getAllStudyMaterials();
      sendJson(res, 201, {
        material: created,
        materials
      });
      return true;
    }
    if (method === "PUT" && pathname.startsWith("/api/materials/")) {
      let id = "";
      try {
        id = decodeURIComponent(pathname.replace("/api/materials/", "")).trim();
      } catch {
        id = pathname.replace("/api/materials/", "").trim();
      }
      if (!id) {
        sendJson(res, 400, { error: "Identificador de material obligatorio" });
        return true;
      }
      const body = await readJsonBody(req);
      const updated = await updateStudyMaterial(id, body);
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, {
        material: updated,
        materials
      });
      return true;
    }
    if (method === "DELETE" && pathname.startsWith("/api/materials/")) {
      let id = "";
      try {
        id = decodeURIComponent(pathname.replace("/api/materials/", "")).trim();
      } catch {
        id = pathname.replace("/api/materials/", "").trim();
      }
      if (!id) {
        sendJson(res, 400, { error: "Identificador de material obligatorio" });
        return true;
      }
      await deleteStudyMaterial(id);
      const materials = await getAllStudyMaterials();
      sendJson(res, 200, { materials });
      return true;
    }
    if (method === "GET" && pathname === "/api/attempts") {
      const queryUserId = req.query?.userId;
      const rawUserId = typeof queryUserId === "string" && queryUserId || Array.isArray(queryUserId) && typeof queryUserId[0] === "string" && queryUserId[0] || urlObj.searchParams.get("userId") || void 0;
      let userId = void 0;
      if (rawUserId) {
        try {
          userId = decodeURIComponent(rawUserId).trim() || void 0;
        } catch {
          userId = rawUserId.trim() || void 0;
        }
      }
      const attempts = await getAllTestAttempts(userId);
      sendJson(res, 200, { attempts });
      return true;
    }
    if (method === "POST" && pathname === "/api/attempts") {
      const body = await readJsonBody(req);
      const attempt = await createTestAttempt(body);
      const attempts = await getAllTestAttempts();
      sendJson(res, 201, {
        attempt,
        attempts
      });
      return true;
    }
    sendJson(res, 404, {
      error: `Ruta API no encontrada (${method} ${pathname})`
    });
    return true;
  } catch (err) {
    const status = err?.statusCode || 500;
    sendJson(res, status, {
      error: err?.message || "Error interno en el servidor de base de datos",
      code: err?.code
    });
    return true;
  }
}

// server/vercelHandler.ts
if (typeof process !== "undefined" && typeof process.on === "function") {
  process.removeAllListeners("warning");
  process.on("warning", (warning) => {
    if (warning && warning.name === "DeprecationWarning" && (warning.code === "DEP0169" || warning.message && warning.message.includes("url.parse"))) {
      return;
    }
    console.warn(warning);
  });
}
var config = {
  api: {
    bodyParser: {
      sizeLimit: "15mb"
    }
  }
};
async function handler(req, res) {
  try {
    const handled = await handleApiRequest(req, res);
    if (!handled && !res.writableEnded) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          error: `Ruta API no encontrada en el servidor (${req.method || "GET"} ${req.url || "/"})`
        })
      );
    }
  } catch (err) {
    console.error("Unhandled Serverless Error:", err);
    if (!res.writableEnded) {
      res.statusCode = err?.statusCode || 500;
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.end(
        JSON.stringify({
          error: err?.message || "Error interno en la funci\xF3n serverless",
          code: err?.code
        })
      );
    }
  }
}
export {
  config,
  handler as default
};

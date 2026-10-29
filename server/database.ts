// @ts-nocheck
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

// Load .env variables into process.env if present
function loadEnvFile() {
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
}

loadEnvFile();

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'paa_platform.sqlite');
const db = new DatabaseSync(DB_PATH);

// Initialize relational tables
db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'teacher')),
    cohort TEXT NOT NULL,
    microsoft_oid TEXT,
    auth_provider TEXT DEFAULT 'local',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    section TEXT NOT NULL CHECK(section IN ('reading', 'math')),
    category TEXT NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    reading_time_minutes INTEGER NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS test_attempts (
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
  );
`);

// Safe migration for existing databases created before Microsoft SSO columns
try {
  db.exec(`ALTER TABLE users ADD COLUMN microsoft_oid TEXT;`);
} catch {
  // Column already exists
}
try {
  db.exec(`ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local';`);
} catch {
  // Column already exists
}

// Safe migration for file attachments in study_materials (pdf, docx, pptx, xlsx, png, jpg, etc.)
try {
  db.exec(`ALTER TABLE study_materials ADD COLUMN attachment_name TEXT;`);
} catch {}
try {
  db.exec(`ALTER TABLE study_materials ADD COLUMN attachment_mime TEXT;`);
} catch {}
try {
  db.exec(`ALTER TABLE study_materials ADD COLUMN attachment_size INTEGER;`);
} catch {}
try {
  db.exec(`ALTER TABLE study_materials ADD COLUMN attachment_url TEXT;`);
} catch {}

function seedDatabaseIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as total FROM users').get();
  if (countRow && countRow.total > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    [
      'stu-1',
      'Sofía Martínez',
      'sofia.martinez@keyinstitute.edu.sv',
      'key2026',
      'student',
      'Cohorte Admisión Ingeniería 2027 · Grupo A',
      'ms-oid-sofia-001',
      'microsoft',
      '2026-10-15T08:30:00Z',
    ],
    [
      'stu-2',
      'Diego Alejandro Rivas',
      'diego.rivas@keyinstitute.edu.sv',
      'key2026',
      'student',
      'Cohorte Admisión Ingeniería 2027 · Grupo A',
      'ms-oid-diego-002',
      'microsoft',
      '2026-10-16T09:15:00Z',
    ],
    [
      'stu-3',
      'Valeria Cáceres',
      'valeria.caceres@keyinstitute.edu.sv',
      'key2026',
      'student',
      'Cohorte Admisión Ciencias Computacionales · Grupo B',
      'ms-oid-valeria-003',
      'microsoft',
      '2026-10-18T14:00:00Z',
    ],
    [
      'tch-1',
      'Dr. Roberto Méndez',
      'roberto.mendez@keyinstitute.com',
      'docente2026',
      'teacher',
      'Departamento de Matemáticas y Física Aplicada',
      'ms-oid-roberto-101',
      'microsoft',
      '2026-10-01T08:00:00Z',
    ],
    [
      'tch-2',
      'Mtra. Elena Valladares',
      'elena.valladares@keyinstitute.com',
      'docente2026',
      'teacher',
      'Coordinación de Lectura Crítica y Comunicación Científica',
      'ms-oid-elena-102',
      'microsoft',
      '2026-10-01T08:05:00Z',
    ],
  ];

  for (const u of users) {
    insertUser.run(...u);
  }

  const insertMaterial = db.prepare(`
    INSERT INTO study_materials (
      id, title, section, category, summary, content,
      reading_time_minutes, author_id, author_name, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const materials = [
    [
      'mat-1',
      'Guía Esencial: Relaciones de Volúmenes y Triángulos Especiales en la PAA',
      'math',
      'Geometría y Trigonometría',
      'Domina la comparación rápida entre cilindros, conos y esferas, así como las razones exactas en triángulos 30°-60°-90° y 45°-45°-90°.',
      `En la sección de Matemáticas de la PAA, muchos problemas geométricos se resuelven sin necesidad de largos cálculos decimales si identificas las proporciones estructurales entre figuras.

1) Proporción Cilindro vs. Cono con igual base y altura:
El volumen de un cilindro circular recto es $V_{\\text{cil}} = \\pi r^2 h$, mientras que el volumen de un cono circular recto es $V_{\\text{cono}} = \\frac{1}{3}\\pi r^2 h$.
$$\\frac{V_{\\text{cilindro}}}{V_{\\text{cono}}} = 3$$
Por lo tanto, si un líquido llena un cilindro de altura $h = 10\\text{ cm}$ y se traslada a un cono del mismo radio, el cono necesitará el triple de altura ($H = 30\\text{ cm}$) para alojar el mismo volumen.

2) Triángulos Rectángulos Especiales:
• Triángulo $30^\\circ\\text{-}60^\\circ\\text{-}90^\\circ$: Si el cateto menor (opuesto a $30^\\circ$) mide $x$, el cateto adyacente (opuesto a $60^\\circ$) mide $x\\sqrt{3}$ y la hipotenusa mide exactamente $2x$.
• Triángulo $45^\\circ\\text{-}45^\\circ\\text{-}90^\\circ$: Los dos catetos son iguales ($s$) y la diagonal o hipotenusa mide $s\\sqrt{2}$. Si un cuadrado está inscrito en un círculo de radio $r$, su diagonal es igual al diámetro $d = 2r = s\\sqrt{2}$.`,
      7,
      'tch-1',
      'Dr. Roberto Méndez',
      '2026-10-20T10:00:00Z',
    ],
    [
      'mat-2',
      'Álgebra Estratégica: Diferencia de Cuadrados y Forma Canónica Cuadrática',
      'math',
      'Álgebra y Funciones',
      'Aprende a reconocer atajos algebraicos en sistemas de ecuaciones y a leer el vértice máximo o mínimo de una parábola por inspección.',
      `El tiempo en la PAA es un recurso crítico. Antes de despejar variables individuales en un sistema, observa qué expresión te pide realmente la pregunta.

1) Factorización por Diferencia de Cuadrados:
Siempre que veas la expresión $x^2 - y^2$, escríbela mentalmente como:
$$x^2 - y^2 = (x + y)(x - y)$$
Si el problema te entrega directamente $x + y = 14$ y $x - y = 6$, no necesitas hallar $x$ ni $y$ por separado: basta multiplicar $(14)(6) = 84$.

2) Forma Canónica (Vértice) de una Función Cuadrática:
Una parábola expresada en la forma:
$$f(t) = a(t - h)^2 + k$$
tiene su vértice exactamente en el punto $(h, k)$.
• Si $a < 0$, la parábola abre hacia abajo y alcanza su valor máximo $k$ cuando $t = h$.
• Por ejemplo, en $h(t) = -5(t - 4)^2 + 120$, la altura máxima es $120\\text{ m}$ y ocurre en $t = 4\\text{ s}$.`,
      6,
      'tch-1',
      'Dr. Roberto Méndez',
      '2026-10-22T15:30:00Z',
    ],
    [
      'mat-3',
      'Lectura Crítica por Líneas Citadas: Vocabulario en Contexto e Inferencia',
      'reading',
      'Comprensión de Lectura',
      'Estrategia de lectura en ventana (±3 líneas alrededor de la cita) para responder preguntas de vocabulario contextual y función estructural.',
      `En la vista dividida de Lectura de la PAA, los pasajes tienen sus líneas numeradas de 5 en 5 en el margen izquierdo. Aprovecha esta numeración aplicando la técnica de ventana contextual:

1) Vocabulario en Contexto:
Cuando una pregunta cita las líneas 10–11 (por ejemplo, «frugalidad creativa»), nunca elijas la definición literal de diccionario aislada. Lee desde dos líneas antes hasta dos líneas después: si el texto habla de diseñar satélites modulares de $10\\text{ cm}$ y $1\\text{ kg}$ que redujeron costos en un orden de magnitud, «frugalidad creativa» significa maximizar la innovación con recursos físicos y financieros mínimos.

2) Función de un Párrafo en la Estructura Global:
Observa siempre el conector inicial del párrafo citado. Expresiones adversativas como «No obstante,», «Sin embargo,» o «Por el contrario,» indican un giro argumentativo o la introducción de una advertencia/límite técnico frente a la tesis previa.`,
      5,
      'tch-2',
      'Mtra. Elena Valladares',
      '2026-10-21T11:20:00Z',
    ],
    [
      'mat-4',
      'Redacción Indirecta PAA: Economía Verbal, Queísmo y Conectores Lógicos',
      'reading',
      'Redacción y Estilo',
      'Cómo identificar redundancias, giros perifrásticos («Debido a esto, es que...») y elegir el conector lógico preciso.',
      `La sección de Redacción Indirecta de la PAA evalúa tres pilares: concisión (economía verbal), precisión normativa y cohesión lógica entre oraciones.

1) Eliminación de Perífrasis Redundantes:
En español académico se deben evitar construcciones pesadas como «Debido a esto, es que...», «Es por esta razón que...» o «A causa de esto es por lo que...». Sustitúyelas por conectores causales limpios y directos como «Por ello,», «Por consiguiente,» o «En consecuencia,».

2) Uso del Punto y Coma con Conectores Adversativos:
Cuando dos proposiciones independientes contrastan capacidades complementarias —por ejemplo, la velocidad de cálculo de una computadora frente al juicio ético humano—, el uso de punto y coma seguido de «; en cambio,» o «; sin embargo,» establece un contraste equilibrado sin romper la unidad temática del párrafo.`,
      6,
      'tch-2',
      'Mtra. Elena Valladares',
      '2026-10-23T09:45:00Z',
    ],
  ];

  for (const m of materials) {
    insertMaterial.run(...m);
  }

  const insertAttempt = db.prepare(`
    INSERT INTO test_attempts (
      id, user_id, mode, mode_title,
      reading_correct, reading_total, math_correct, math_total,
      total_correct, total_questions, percentage, scaled_score,
      duration_seconds, answers_json, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleAttempts = [
    [
      'att-1',
      'stu-1',
      'simulacro',
      'Simulacro Oficial PAA (Test Completo)',
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
        'read-1': 'B',
        'read-2': 'C',
        'read-3': 'B',
        'read-4': 'A',
        'read-5': 'B',
        'math-1': 'C',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'A',
        'math-5': 'A',
      }),
      '2026-10-26T16:20:00Z',
    ],
    [
      'att-2',
      'stu-1',
      'sprint_math',
      'Sprint de Matemáticas (Test Corto)',
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
        'math-1': 'C',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'A',
        'math-5': 'B',
      }),
      '2026-10-27T18:10:00Z',
    ],
    [
      'att-3',
      'stu-2',
      'simulacro',
      'Simulacro Oficial PAA (Test Completo)',
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
        'read-1': 'B',
        'read-2': 'A',
        'read-3': 'B',
        'read-4': 'B',
        'read-5': 'B',
        'math-1': 'C',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'B',
        'math-5': 'B',
      }),
      '2026-10-27T11:40:00Z',
    ],
    [
      'att-4',
      'stu-2',
      'sprint_reading',
      'Sprint de Lectura y Redacción (Test Corto)',
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
        'read-1': 'B',
        'read-2': 'C',
        'read-3': 'B',
        'read-4': 'A',
        'read-5': 'A',
      }),
      '2026-10-28T09:15:00Z',
    ],
    [
      'att-5',
      'stu-3',
      'simulacro',
      'Simulacro Oficial PAA (Test Completo)',
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
        'read-1': 'B',
        'read-2': 'C',
        'read-3': 'A',
        'read-4': 'A',
        'read-5': 'B',
        'math-1': 'C',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'A',
        'math-5': 'B',
      }),
      '2026-10-28T15:05:00Z',
    ],
  ];

  for (const att of sampleAttempts) {
    insertAttempt.run(...att);
  }
}

seedDatabaseIfEmpty();

function ensureScaleSampleData() {
  const stuCountRow: any = db
    .prepare("SELECT COUNT(*) as total FROM users WHERE role = 'student'")
    .get();
  if (stuCountRow && stuCountRow.total >= 10) return;

  // Normalize first 3 students to official Key Institute admission cohorts
  db.prepare("UPDATE users SET cohort = ? WHERE id = 'stu-1'").run(
    'Ingeniería en Ciencias de la Computación · Admisión 2027'
  );
  db.prepare("UPDATE users SET cohort = ? WHERE id = 'stu-2'").run(
    'Ingeniería Mecatrónica y Robótica · Admisión 2027'
  );
  db.prepare("UPDATE users SET cohort = ? WHERE id = 'stu-3'").run(
    'Ingeniería Aeroespacial y Ciencias Aplicadas · Admisión 2027'
  );

  const insertUserIgnore = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
    VALUES (?, ?, ?, 'MICROSOFT_SSO', 'student', ?, ?, 'microsoft', ?)
  `);

  const extraStudents = [
    [
      'stu-4',
      'Mateo Hernández Lemus',
      'mateo.hernandez@keyinstitute.edu.sv',
      'Ingeniería en Ciencias de la Computación · Admisión 2027',
      'ms-oid-mateo-004',
      '2026-10-19T10:00:00Z',
    ],
    [
      'stu-5',
      'Camila Beatriz Solís',
      'camila.solis@keyinstitute.edu.sv',
      'Ingeniería Industrial y de Sistemas · Admisión 2027',
      'ms-oid-camila-005',
      '2026-10-19T11:30:00Z',
    ],
    [
      'stu-6',
      'Andrés Emiliano Pineda',
      'andres.pineda@keyinstitute.edu.sv',
      'Ingeniería Mecatrónica y Robótica · Admisión 2027',
      'ms-oid-andres-006',
      '2026-10-20T09:00:00Z',
    ],
    [
      'stu-7',
      'Lucía Fernanda Zelaya',
      'lucia.zelaya@keyinstitute.edu.sv',
      'Ingeniería en Energía y Sostenibilidad · Admisión 2027',
      'ms-oid-lucia-007',
      '2026-10-20T14:20:00Z',
    ],
    [
      'stu-8',
      'Gabriel Ernesto Ávila',
      'gabriel.avila@keyinstitute.edu.sv',
      'Ingeniería Aeroespacial y Ciencias Aplicadas · Admisión 2027',
      'ms-oid-gabriel-008',
      '2026-10-21T08:45:00Z',
    ],
    [
      'stu-9',
      'Mariana Isabel Orellana',
      'mariana.orellana@keyinstitute.edu.sv',
      'Ingeniería en Ciencias de la Computación · Admisión 2027',
      'ms-oid-mariana-009',
      '2026-10-21T16:10:00Z',
    ],
    [
      'stu-10',
      'Sebastián Rodrigo Portillo',
      'sebastian.portillo@keyinstitute.edu.sv',
      'Ingeniería Industrial y de Sistemas · Admisión 2027',
      'ms-oid-sebastian-010',
      '2026-10-22T10:05:00Z',
    ],
    [
      'stu-11',
      'Daniela Alejandra Mena',
      'daniela.mena@keyinstitute.edu.sv',
      'Ingeniería en Energía y Sostenibilidad · Admisión 2027',
      'ms-oid-daniela-011',
      '2026-10-22T13:40:00Z',
    ],
    [
      'stu-12',
      'Javier Alejandro Meléndez',
      'javier.melendez@keyinstitute.edu.sv',
      'Ingeniería Mecatrónica y Robótica · Admisión 2027',
      'ms-oid-javier-012',
      '2026-10-23T09:15:00Z',
    ],
  ];

  for (const s of extraStudents) {
    insertUserIgnore.run(...s);
  }

  const insertAttemptIgnore = db.prepare(`
    INSERT OR IGNORE INTO test_attempts (
      id, user_id, mode, mode_title,
      reading_correct, reading_total, math_correct, math_total,
      total_correct, total_questions, percentage, scaled_score,
      duration_seconds, answers_json, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const extraAttempts = [
    [
      'att-6',
      'stu-4',
      'simulacro',
      'Simulacro Oficial PAA (Test Completo)',
      4,
      5,
      4,
      5,
      8,
      10,
      80,
      1360,
      780,
      JSON.stringify({
        'read-1': 'B',
        'read-2': 'C',
        'read-3': 'B',
        'read-4': 'A',
        'read-5': 'A',
        'math-1': 'C',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'A',
        'math-5': 'A',
      }),
      '2026-10-28T10:15:00Z',
    ],
    [
      'att-7',
      'stu-5',
      'sprint_math',
      'SPRINT M-01: Geometría Espacial, Volúmenes y Triángulos Especiales',
      0,
      0,
      3,
      3,
      3,
      3,
      100,
      800,
      195,
      JSON.stringify({ 'math-1': 'C', 'math-2': 'A', 'math-5': 'B' }),
      '2026-10-28T11:30:00Z',
    ],
    [
      'att-8',
      'stu-6',
      'sprint_reading',
      'SPRINT L-01: Comprensión Científica: Vocabulario en Contexto e Inferencia',
      2,
      3,
      0,
      0,
      2,
      3,
      67,
      600,
      210,
      JSON.stringify({ 'read-1': 'B', 'read-2': 'C', 'read-3': 'A' }),
      '2026-10-28T14:20:00Z',
    ],
    [
      'att-9',
      'stu-7',
      'simulacro',
      'Simulacro Oficial PAA (Test Completo)',
      5,
      5,
      5,
      5,
      10,
      10,
      100,
      1600,
      710,
      JSON.stringify({
        'read-1': 'B',
        'read-2': 'C',
        'read-3': 'B',
        'read-4': 'A',
        'read-5': 'B',
        'math-1': 'C',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'A',
        'math-5': 'B',
      }),
      '2026-10-28T16:45:00Z',
    ],
    [
      'att-10',
      'stu-8',
      'sprint_math',
      'SPRINT M-02: Álgebra Estratégica: Sistemas y Modelos Cuadráticos',
      0,
      0,
      2,
      2,
      2,
      2,
      100,
      800,
      140,
      JSON.stringify({ 'math-3': 'C', 'math-4': 'A' }),
      '2026-10-28T17:30:00Z',
    ],
    [
      'att-11',
      'stu-9',
      'simulacro',
      'Simulacro Oficial PAA (Test Completo)',
      3,
      5,
      2,
      5,
      5,
      10,
      50,
      1000,
      920,
      JSON.stringify({
        'read-1': 'B',
        'read-2': 'C',
        'read-3': 'D',
        'read-4': 'A',
        'read-5': 'C',
        'math-1': 'A',
        'math-2': 'A',
        'math-3': 'C',
        'math-4': 'B',
        'math-5': 'D',
      }),
      '2026-10-29T08:05:00Z',
    ],
    [
      'att-12',
      'stu-10',
      'sprint_reading',
      'SPRINT L-02: Redacción Indirecta: Concisión, Normativa y Conectores',
      2,
      2,
      0,
      0,
      2,
      2,
      100,
      800,
      125,
      JSON.stringify({ 'read-4': 'A', 'read-5': 'B' }),
      '2026-10-29T08:40:00Z',
    ],
  ];

  for (const a of extraAttempts) {
    insertAttemptIgnore.run(...a);
  }
}

ensureScaleSampleData();

export function getAllUsers() {
  const rows = db
    .prepare(
      `SELECT
         id,
         name,
         email,
         role,
         cohort,
         microsoft_oid as microsoftOid,
         auth_provider as authProvider,
         created_at as createdAt
       FROM users
       ORDER BY role ASC, name ASC`
    )
    .all();
  return rows;
}

export function updateUserCohort(userId: string, cohort: string) {
  db.prepare(`UPDATE users SET cohort = ? WHERE id = ?`).run(cohort.trim(), userId);
  db.prepare(`UPDATE test_attempts SET user_id = user_id WHERE user_id = ?`).run(userId);
  return db
    .prepare(
      `SELECT
         id,
         name,
         email,
         role,
         cohort,
         microsoft_oid as microsoftOid,
         auth_provider as authProvider,
         created_at as createdAt
       FROM users
       WHERE id = ?`
    )
    .get(userId);
}

/**
 * Decodes JWT payload (for Microsoft Entra ID idToken verification)
 */
function decodeJwtPayload(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Checks whether an email belongs to the allowed institutional domains
 */
function isEmailDomainAllowed(email: string): { allowed: boolean; allowedList: string[] } {
  const rawRule = (process.env.ALLOWED_EMAIL_DOMAINS || '*').trim();
  if (!rawRule || rawRule === '*') {
    return { allowed: true, allowedList: ['*'] };
  }
  const allowedList = rawRule
    .split(',')
    .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
    .filter(Boolean);

  const emailDomain = email.split('@')[1]?.toLowerCase() || '';
  return {
    allowed: allowedList.includes(emailDomain),
    allowedList,
  };
}

/**
 * Verifies a real Microsoft OAuth2 accessToken directly against Microsoft Graph API
 * (https://graph.microsoft.com/v1.0/me) to guarantee cryptographic authenticity.
 */
async function verifyTokenWithMicrosoftGraph(accessToken: string) {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err: any = new Error(
      'Microsoft Graph rechazó el token de acceso. Autenticación no válida.'
    );
    err.statusCode = 401;
    throw err;
  }

  const profile: any = await response.json();
  return {
    microsoftOid: profile.id,
    name: profile.displayName || profile.givenName || '',
    email: (profile.mail || profile.userPrincipalName || '').toLowerCase(),
  };
}

/**
 * Authenticates or auto-provisions a Microsoft Entra ID (Office 365) user
 * implementing Option 1: Direct Student access + Teacher Role with Access PIN.
 */
export async function authenticateMicrosoftUser(payload: {
  name: string;
  email: string;
  microsoftOid?: string;
  idToken?: string;
  accessToken?: string;
  requestedRole: 'student' | 'teacher';
  teacherPin?: string;
  cohort?: string;
}) {
  let verifiedEmail = (payload.email || '').trim().toLowerCase();
  let verifiedName = (payload.name || '').trim();
  let verifiedOid = payload.microsoftOid || '';

  // 1. If a real Microsoft accessToken is present, verify it live against Microsoft Graph API
  if (payload.accessToken) {
    const graphProfile = await verifyTokenWithMicrosoftGraph(payload.accessToken);
    verifiedEmail = graphProfile.email || verifiedEmail;
    verifiedName = graphProfile.name || verifiedName;
    verifiedOid = graphProfile.microsoftOid || verifiedOid;
  } else if (payload.idToken) {
    // Fallback JWT claim check if only idToken was provided
    const claims = decodeJwtPayload(payload.idToken);
    if (!claims) {
      const err: any = new Error('El token devuelto por Microsoft Entra ID es inválido.');
      err.statusCode = 401;
      throw err;
    }
    if (claims.exp && Date.now() >= claims.exp * 1000) {
      const err: any = new Error('La sesión de Microsoft ha expirado. Vuelve a intentarlo.');
      err.statusCode = 401;
      throw err;
    }
    verifiedEmail = (
      claims.preferred_username ||
      claims.email ||
      claims.upn ||
      verifiedEmail
    )
      .trim()
      .toLowerCase();
    verifiedName = (claims.name || verifiedName).trim();
    verifiedOid = claims.oid || claims.sub || verifiedOid;
  }

  if (!verifiedEmail || !verifiedEmail.includes('@')) {
    const err: any = new Error('Microsoft no devolvió un correo institucional válido.');
    err.statusCode = 400;
    throw err;
  }

  if (!verifiedName) {
    verifiedName = verifiedEmail.split('@')[0].replace(/[._]/g, ' ');
  }

  // 1. Validate institutional email domain if restricted in .env
  const domainCheck = isEmailDomainAllowed(verifiedEmail);
  if (!domainCheck.allowed) {
    const err: any = new Error(
      `El correo ${verifiedEmail} no pertenece a los dominios institucionales autorizados (${domainCheck.allowedList
        .map((d) => `@${d}`)
        .join(', ')}).`
    );
    err.statusCode = 403;
    throw err;
  }

  // 2. Lookup existing user in SQLite by email
  const existingUser: any = db
    .prepare(
      `SELECT
         id, name, email, role, cohort,
         microsoft_oid as microsoftOid,
         auth_provider as authProvider,
         created_at as createdAt
       FROM users
       WHERE LOWER(email) = ?`
    )
    .get(verifiedEmail);

  const expectedTeacherPin = (
    process.env.TEACHER_ACCESS_PIN || 'DOCENTE-PAA-2026'
  ).trim();
  const alwaysRequirePin =
    (process.env.ALWAYS_REQUIRE_TEACHER_PIN || 'false').trim().toLowerCase() ===
    'true';

  // 3. Handle Option 1 Role Resolution (Student vs Teacher + PIN)
  if (payload.requestedRole === 'teacher') {
    const isAlreadyRegisteredTeacher = existingUser?.role === 'teacher';
    const needsPinValidation = !isAlreadyRegisteredTeacher || alwaysRequirePin;

    if (needsPinValidation) {
      const providedPin = (payload.teacherPin || '').trim();
      if (!providedPin) {
        const err: any = new Error(
          'Esta cuenta aún no está registrada como Docente. Ingresa el Código/PIN de Cátedra Docente para autorizar el acceso.'
        );
        err.statusCode = 403;
        err.code = 'PIN_REQUIRED';
        throw err;
      }

      if (providedPin !== expectedTeacherPin) {
        const err: any = new Error(
          'Código/PIN de Cátedra Docente incorrecto. Verifica la clave institucional e inténtalo de nuevo.'
        );
        err.statusCode = 403;
        err.code = 'INVALID_PIN';
        throw err;
      }
    }

    // Validated Teacher: either update existing user to teacher or create new teacher
    if (existingUser) {
      const updatedCohort =
        existingUser.role === 'teacher'
          ? existingUser.cohort
          : payload.cohort || 'Cátedra Key Institute · Microsoft 365';

      db.prepare(
        `UPDATE users
         SET role = 'teacher',
             name = ?,
             cohort = ?,
             microsoft_oid = COALESCE(NULLIF(?, ''), microsoft_oid),
             auth_provider = 'microsoft'
         WHERE id = ?`
      ).run(verifiedName, updatedCohort, verifiedOid, existingUser.id);
    } else {
      const id = `tch-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = new Date().toISOString();
      const cohort =
        payload.cohort?.trim() || 'Cátedra Key Institute · Microsoft 365';

      db.prepare(
        `INSERT INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
         VALUES (?, ?, ?, 'MICROSOFT_SSO', 'teacher', ?, ?, 'microsoft', ?)`
      ).run(
        id,
        verifiedName,
        verifiedEmail,
        cohort,
        verifiedOid || `ms-${id}`,
        createdAt
      );
    }
  } else {
    // requestedRole === 'student'
    if (existingUser) {
      db.prepare(
        `UPDATE users
         SET name = ?,
             microsoft_oid = COALESCE(NULLIF(?, ''), microsoft_oid),
             auth_provider = 'microsoft'
         WHERE id = ?`
      ).run(verifiedName, verifiedOid, existingUser.id);
    } else {
      // Auto-provision new student directly into SQLite
      const id = `stu-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = new Date().toISOString();
      const cohort =
        payload.cohort?.trim() ||
        'Cohorte Estudiantil Key Institute · Microsoft 365';

      db.prepare(
        `INSERT INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
         VALUES (?, ?, ?, 'MICROSOFT_SSO', 'student', ?, ?, 'microsoft', ?)`
      ).run(
        id,
        verifiedName,
        verifiedEmail,
        cohort,
        verifiedOid || `ms-${id}`,
        createdAt
      );
    }
  }

  const finalUser = db
    .prepare(
      `SELECT
         id, name, email, role, cohort,
         microsoft_oid as microsoftOid,
         auth_provider as authProvider,
         created_at as createdAt
       FROM users
       WHERE LOWER(email) = ?`
    )
    .get(verifiedEmail);

  return finalUser;
}

export function loginUser(email: string, password?: string) {
  const normalized = email.trim().toLowerCase();
  const user = db
    .prepare(
      `SELECT
         id, name, email, password, role, cohort,
         microsoft_oid as microsoftOid,
         auth_provider as authProvider,
         created_at as createdAt
       FROM users
       WHERE LOWER(email) = ?`
    )
    .get(normalized);

  if (!user) return null;
  if (password !== undefined && password !== '' && user.password !== password) {
    return null;
  }

  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export function registerUser(payload: {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher';
  cohort: string;
}) {
  const id = `${payload.role === 'teacher' ? 'tch' : 'stu'}-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const email = payload.email.trim().toLowerCase();
  const password = payload.password?.trim() || 'key2026';

  db.prepare(
    `INSERT INTO users (id, name, email, password, role, cohort, auth_provider, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'local', ?)`
  ).run(
    id,
    payload.name.trim(),
    email,
    password,
    payload.role,
    payload.cohort.trim(),
    createdAt
  );

  return {
    id,
    name: payload.name.trim(),
    email,
    role: payload.role,
    cohort: payload.cohort.trim(),
    authProvider: 'local',
    createdAt,
  };
}

export function getAllStudyMaterials() {
  return db
    .prepare(
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
    )
    .all();
}

function saveBase64AttachmentIfPresent(payload: {
  attachmentName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
  attachmentDataBase64?: string | null;
  attachmentUrl?: string | null;
}) {
  if (payload.attachmentDataBase64 && payload.attachmentName) {
    const safeName = payload.attachmentName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}-${safeName}`;
    const filePath = path.join(UPLOADS_DIR, uniqueFileName);

    // Strip optional data:*/*;base64, prefix
    const base64Clean = payload.attachmentDataBase64.includes('base64,')
      ? payload.attachmentDataBase64.split('base64,')[1]
      : payload.attachmentDataBase64;

    const buffer = Buffer.from(base64Clean, 'base64');
    fs.writeFileSync(filePath, buffer);

    return {
      attachmentName: payload.attachmentName,
      attachmentMime: payload.attachmentMime || 'application/octet-stream',
      attachmentSize: payload.attachmentSize || buffer.length,
      attachmentUrl: `/api/uploads/${encodeURIComponent(uniqueFileName)}`,
    };
  }

  return {
    attachmentName: payload.attachmentName ?? null,
    attachmentMime: payload.attachmentMime ?? null,
    attachmentSize: payload.attachmentSize ?? null,
    attachmentUrl: payload.attachmentUrl ?? null,
  };
}

export function createStudyMaterial(payload: {
  title: string;
  section: 'reading' | 'math';
  category: string;
  summary: string;
  content: string;
  readingTimeMinutes: number;
  authorId: string;
  authorName: string;
  attachmentName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
  attachmentDataBase64?: string | null;
}) {
  const id = `mat-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const att = saveBase64AttachmentIfPresent(payload);

  db.prepare(
    `INSERT INTO study_materials (
       id, title, section, category, summary, content,
       reading_time_minutes, author_id, author_name,
       attachment_name, attachment_mime, attachment_size, attachment_url,
       created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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
  );

  return getAllStudyMaterials().find((m: any) => m.id === id);
}

export function updateStudyMaterial(
  id: string,
  payload: {
    title: string;
    section: 'reading' | 'math';
    category: string;
    summary: string;
    content: string;
    readingTimeMinutes: number;
    attachmentName?: string | null;
    attachmentMime?: string | null;
    attachmentSize?: number | null;
    attachmentDataBase64?: string | null;
    attachmentUrl?: string | null;
    removeAttachment?: boolean;
  }
) {
  const existing: any = getAllStudyMaterials().find((m: any) => m.id === id);

  let att = {
    attachmentName: existing?.attachmentName ?? null,
    attachmentMime: existing?.attachmentMime ?? null,
    attachmentSize: existing?.attachmentSize ?? null,
    attachmentUrl: existing?.attachmentUrl ?? null,
  };

  if (payload.removeAttachment) {
    att = {
      attachmentName: null,
      attachmentMime: null,
      attachmentSize: null,
      attachmentUrl: null,
    };
  } else if (payload.attachmentDataBase64 && payload.attachmentName) {
    att = saveBase64AttachmentIfPresent(payload);
  }

  db.prepare(
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
     WHERE id = ?`
  ).run(
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
  );
  return getAllStudyMaterials().find((m: any) => m.id === id);
}

export function deleteStudyMaterial(id: string) {
  db.prepare('DELETE FROM study_materials WHERE id = ?').run(id);
  return { deletedId: id };
}

export function getAllTestAttempts(userId?: string) {
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

  const rows = userId
    ? db
        .prepare(`${baseQuery} WHERE t.user_id = ? ORDER BY datetime(t.completed_at) DESC`)
        .all(userId)
    : db.prepare(`${baseQuery} ORDER BY datetime(t.completed_at) DESC`).all();

  return rows.map((row: any) => {
    const { answersJson, ...rest } = row;
    let answers = {};
    try {
      answers = JSON.parse(answersJson || '{}');
    } catch {
      answers = {};
    }
    return {
      ...rest,
      answers,
    };
  });
}

export function createTestAttempt(payload: {
  userId: string;
  mode: 'simulacro' | 'sprint_reading' | 'sprint_math';
  modeTitle: string;
  readingCorrect: number;
  readingTotal: number;
  mathCorrect: number;
  mathTotal: number;
  totalCorrect: number;
  totalQuestions: number;
  percentage: number;
  scaledScore: number;
  durationSeconds: number;
  answers: Record<string, string>;
}) {
  const id = `att-${crypto.randomUUID().slice(0, 8)}`;
  const completedAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO test_attempts (
       id, user_id, mode, mode_title,
       reading_correct, reading_total, math_correct, math_total,
       total_correct, total_questions, percentage, scaled_score,
       duration_seconds, answers_json, completed_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
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
  );

  const all = getAllTestAttempts();
  return all.find((item: any) => item.id === id);
}

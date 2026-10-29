// @ts-nocheck
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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

function seedDatabaseIfEmpty() {
  const countRow = db.prepare('SELECT COUNT(*) as total FROM users').get();
  if (countRow && countRow.total > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password, role, cohort, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    [
      'stu-1',
      'Sofía Martínez',
      'sofia.martinez@keyinstitute.edu.sv',
      'key2026',
      'student',
      'Cohorte Admisión Ingeniería 2027 · Grupo A',
      '2026-10-15T08:30:00Z',
    ],
    [
      'stu-2',
      'Diego Alejandro Rivas',
      'diego.rivas@keyinstitute.edu.sv',
      'key2026',
      'student',
      'Cohorte Admisión Ingeniería 2027 · Grupo A',
      '2026-10-16T09:15:00Z',
    ],
    [
      'stu-3',
      'Valeria Cáceres',
      'valeria.caceres@keyinstitute.edu.sv',
      'key2026',
      'student',
      'Cohorte Admisión Ciencias Computacionales · Grupo B',
      '2026-10-18T14:00:00Z',
    ],
    [
      'tch-1',
      'Dr. Roberto Méndez',
      'roberto.mendez@keyinstitute.com',
      'docente2026',
      'teacher',
      'Departamento de Matemáticas y Física Aplicada',
      '2026-10-01T08:00:00Z',
    ],
    [
      'tch-2',
      'Mtra. Elena Valladares',
      'elena.valladares@keyinstitute.com',
      'docente2026',
      'teacher',
      'Coordinación de Lectura Crítica y Comunicación Científica',
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

export function getAllUsers() {
  const rows = db
    .prepare(
      `SELECT id, name, email, role, cohort, created_at as createdAt
       FROM users
       ORDER BY role ASC, name ASC`
    )
    .all();
  return rows;
}

export function loginUser(email: string, password?: string) {
  const normalized = email.trim().toLowerCase();
  const user = db
    .prepare(
      `SELECT id, name, email, password, role, cohort, created_at as createdAt
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
    `INSERT INTO users (id, name, email, password, role, cohort, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(id, payload.name.trim(), email, password, payload.role, payload.cohort.trim(), createdAt);

  return {
    id,
    name: payload.name.trim(),
    email,
    role: payload.role,
    cohort: payload.cohort.trim(),
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
         created_at as createdAt
       FROM study_materials
       ORDER BY datetime(created_at) DESC`
    )
    .all();
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
}) {
  const id = `mat-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();

  db.prepare(
    `INSERT INTO study_materials (
       id, title, section, category, summary, content,
       reading_time_minutes, author_id, author_name, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
    createdAt
  );

  return {
    id,
    ...payload,
    createdAt,
  };
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
  }
) {
  db.prepare(
    `UPDATE study_materials
     SET title = ?, section = ?, category = ?, summary = ?, content = ?, reading_time_minutes = ?
     WHERE id = ?`
  ).run(
    payload.title.trim(),
    payload.section,
    payload.category.trim(),
    payload.summary.trim(),
    payload.content.trim(),
    Number(payload.readingTimeMinutes) || 5,
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

// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  dbAll,
  dbGet,
  dbRun,
  dbBatch,
  getUploadsDir,
  isTursoConfigured,
} from './dbDriver';

export const UPLOADS_DIR = getUploadsDir();

let dbInitPromise: Promise<void> | null = null;

export async function ensureDbReady(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = initializeSchemaAndSeed().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

async function initializeSchemaAndSeed(): Promise<void> {
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
      )`,
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
      )`,
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
      )`,
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS uploaded_files (
        filename TEXT PRIMARY KEY,
        mime_type TEXT NOT NULL,
        size INTEGER NOT NULL,
        data_base64 TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`,
    },
  ]);

  // Safe column migrations for pre-existing local SQLite databases
  const migrationCols = [
    `ALTER TABLE users ADD COLUMN microsoft_oid TEXT`,
    `ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT 'local'`,
    `ALTER TABLE users ADD COLUMN google_id TEXT`,
    `ALTER TABLE study_materials ADD COLUMN attachment_name TEXT`,
    `ALTER TABLE study_materials ADD COLUMN attachment_mime TEXT`,
    `ALTER TABLE study_materials ADD COLUMN attachment_size INTEGER`,
    `ALTER TABLE study_materials ADD COLUMN attachment_url TEXT`,
  ];

  for (const sql of migrationCols) {
    try {
      await dbRun(sql);
    } catch {
      // Column already exists
    }
  }

  await seedDatabaseIfEmpty();

  const isCleanProductionSeed =
    isTursoConfigured() ||
    (process.env.VITE_ENABLE_DEMO_ACCOUNTS || 'true').trim().toLowerCase() === 'false';

  if (!isCleanProductionSeed) {
    await ensureScaleSampleData();
  }
}

async function seedDatabaseIfEmpty() {
  const countRow: any = await dbGet('SELECT COUNT(*) as total FROM users');
  if (countRow && Number(countRow.total) > 0) return;

  const isCleanProductionSeed =
    isTursoConfigured() ||
    (process.env.VITE_ENABLE_DEMO_ACCOUNTS || 'true').trim().toLowerCase() === 'false';

  const facultyTeachers = [
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

  const demoStudents = isCleanProductionSeed
    ? []
    : [
        [
          'stu-1',
          'Sofía Martínez',
          'sofia.martinez@keyinstitute.edu.sv',
          'key2026',
          'student',
          'Ingeniería en Ciencias de la Computación · Admisión 2027',
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
          'Ingeniería Mecatrónica y Robótica · Admisión 2027',
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
          'Ingeniería Aeroespacial y Ciencias Aplicadas · Admisión 2027',
          'ms-oid-valeria-003',
          'microsoft',
          '2026-10-18T14:00:00Z',
        ],
      ];

  const users = [...demoStudents, ...facultyTeachers];
  const statements: { sql: string; args?: any[] }[] = [];

  for (const u of users) {
    statements.push({
      sql: `INSERT OR IGNORE INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: u,
    });
  }

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
    statements.push({
      sql: `INSERT OR IGNORE INTO study_materials (
              id, title, section, category, summary, content,
              reading_time_minutes, author_id, author_name, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: m,
    });
  }

  if (!isCleanProductionSeed) {
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
      statements.push({
        sql: `INSERT OR IGNORE INTO test_attempts (
                id, user_id, mode, mode_title,
                reading_correct, reading_total, math_correct, math_total,
                total_correct, total_questions, percentage, scaled_score,
                duration_seconds, answers_json, completed_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: att,
      });
    }
  }

  await dbBatch(statements);
}

async function ensureScaleSampleData() {
  const stuCountRow: any = await dbGet(
    "SELECT COUNT(*) as total FROM users WHERE role = 'student'"
  );
  if (stuCountRow && Number(stuCountRow.total) >= 10) return;

  const statements: { sql: string; args?: any[] }[] = [
    {
      sql: "UPDATE users SET cohort = ? WHERE id = 'stu-1'",
      args: ['Ingeniería en Ciencias de la Computación · Admisión 2027'],
    },
    {
      sql: "UPDATE users SET cohort = ? WHERE id = 'stu-2'",
      args: ['Ingeniería Mecatrónica y Robótica · Admisión 2027'],
    },
    {
      sql: "UPDATE users SET cohort = ? WHERE id = 'stu-3'",
      args: ['Ingeniería Aeroespacial y Ciencias Aplicadas · Admisión 2027'],
    },
  ];

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
    statements.push({
      sql: `INSERT OR IGNORE INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
            VALUES (?, ?, ?, 'MICROSOFT_SSO', 'student', ?, ?, 'microsoft', ?)`,
      args: s,
    });
  }

  await dbBatch(statements);
}

export async function getAllUsers() {
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

export async function updateUserCohort(userId: string, cohort: string) {
  await ensureDbReady();
  await dbRun(`UPDATE users SET cohort = ? WHERE id = ?`, [cohort.trim(), userId]);
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

/**
 * Decodes JWT payload (for Microsoft Entra ID / Google idToken verification)
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
 * Checks whether a Teacher email belongs exclusively to Key Institute's institutional domains
 */
function isTeacherInstitutionalDomain(email: string): {
  allowed: boolean;
  allowedList: string[];
} {
  const rawRule = (
    process.env.TEACHER_EMAIL_DOMAINS || 'keyinstitute.com,keyinstitute.edu.sv'
  ).trim();
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
  await ensureDbReady();
  let verifiedEmail = (payload.email || '').trim().toLowerCase();
  let verifiedName = (payload.name || '').trim();
  let verifiedOid = payload.microsoftOid || '';

  if (payload.accessToken) {
    const graphProfile = await verifyTokenWithMicrosoftGraph(payload.accessToken);
    verifiedEmail = graphProfile.email || verifiedEmail;
    verifiedName = graphProfile.name || verifiedName;
    verifiedOid = graphProfile.microsoftOid || verifiedOid;
  } else if (payload.idToken) {
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

  const existingUser: any = await dbGet(
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

  const expectedTeacherPin = (
    process.env.TEACHER_ACCESS_PIN || 'DOCENTE-PAA-2026'
  ).trim();
  const alwaysRequirePin =
    (process.env.ALWAYS_REQUIRE_TEACHER_PIN || 'false').trim().toLowerCase() ===
    'true';

  if (payload.requestedRole === 'teacher') {
    const teacherDomainCheck = isTeacherInstitutionalDomain(verifiedEmail);
    if (!teacherDomainCheck.allowed) {
      const err: any = new Error(
        `Acceso restringido: Los docentes solo pueden ingresar con su correo institucional (${teacherDomainCheck.allowedList
          .map((d) => `@${d}`)
          .join(' o ')}).`
      );
      err.statusCode = 403;
      err.code = 'INSTITUTIONAL_EMAIL_REQUIRED';
      throw err;
    }

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

    if (existingUser) {
      const updatedCohort =
        existingUser.role === 'teacher'
          ? existingUser.cohort
          : payload.cohort || 'Cátedra Key Institute · Microsoft 365';

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
      const createdAt = new Date().toISOString();
      const cohort =
        payload.cohort?.trim() || 'Cátedra Key Institute · Microsoft 365';

      await dbRun(
        `INSERT INTO users (id, name, email, password, role, cohort, microsoft_oid, auth_provider, created_at)
         VALUES (?, ?, ?, 'MICROSOFT_SSO', 'teacher', ?, ?, 'microsoft', ?)`,
        [id, verifiedName, verifiedEmail, cohort, verifiedOid || `ms-${id}`, createdAt]
      );
    }
  } else {
    if (existingUser) {
      await dbRun(
        `UPDATE users
         SET name = ?,
             microsoft_oid = COALESCE(NULLIF(?, ''), microsoft_oid),
             auth_provider = CASE WHEN auth_provider = 'google' THEN 'hybrid' ELSE 'microsoft' END
         WHERE id = ?`,
        [verifiedName, verifiedOid, existingUser.id]
      );
    } else {
      const id = `stu-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = new Date().toISOString();
      const cohort =
        payload.cohort?.trim() ||
        'Cohorte Estudiantil Key Institute · Microsoft 365';

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

/**
 * Verifies a Google access_token against Google's OAuth2 v3 userinfo endpoint
 */
async function verifyGoogleAccessToken(accessToken: string) {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err: any = new Error(
      'Google rechazó el token de acceso. Autenticación no válida.'
    );
    err.statusCode = 401;
    throw err;
  }

  const profile: any = await response.json();
  return {
    googleId: profile.sub,
    name: profile.name || profile.given_name || '',
    email: (profile.email || '').toLowerCase(),
  };
}

/**
 * Authenticates or auto-provisions a Google Identity user
 */
export async function authenticateGoogleUser(payload: {
  name: string;
  email: string;
  googleId?: string;
  idToken?: string;
  accessToken?: string;
  requestedRole: 'student' | 'teacher';
  teacherPin?: string;
  cohort?: string;
}) {
  await ensureDbReady();
  let verifiedEmail = (payload.email || '').trim().toLowerCase();
  let verifiedName = (payload.name || '').trim();
  let verifiedGoogleId = payload.googleId || '';

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

  if (!verifiedEmail || !verifiedEmail.includes('@')) {
    const err: any = new Error('Google no devolvió un correo válido.');
    err.statusCode = 400;
    throw err;
  }

  if (!verifiedName) {
    verifiedName = verifiedEmail.split('@')[0].replace(/[._]/g, ' ');
  }

  const domainCheck = isEmailDomainAllowed(verifiedEmail);
  if (!domainCheck.allowed) {
    const err: any = new Error(
      `El correo ${verifiedEmail} no pertenece a los dominios autorizados (${domainCheck.allowedList
        .map((d) => `@${d}`)
        .join(', ')}).`
    );
    err.statusCode = 403;
    throw err;
  }

  const existingUser: any = await dbGet(
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

  const expectedTeacherPin = (
    process.env.TEACHER_ACCESS_PIN || 'DOCENTE-PAA-2026'
  ).trim();
  const alwaysRequirePin =
    (process.env.ALWAYS_REQUIRE_TEACHER_PIN || 'false').trim().toLowerCase() ===
    'true';

  if (payload.requestedRole === 'teacher') {
    const teacherDomainCheck = isTeacherInstitutionalDomain(verifiedEmail);
    if (!teacherDomainCheck.allowed) {
      const err: any = new Error(
        `Acceso restringido: Los docentes solo pueden ingresar con su correo institucional (${teacherDomainCheck.allowedList
          .map((d) => `@${d}`)
          .join(' o ')}).`
      );
      err.statusCode = 403;
      err.code = 'INSTITUTIONAL_EMAIL_REQUIRED';
      throw err;
    }

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

    if (existingUser) {
      const updatedCohort =
        existingUser.role === 'teacher'
          ? existingUser.cohort
          : payload.cohort || 'Cátedra Key Institute · Google';

      await dbRun(
        `UPDATE users
         SET role = 'teacher',
             name = ?,
             cohort = ?,
             google_id = COALESCE(NULLIF(?, ''), google_id),
             auth_provider = CASE WHEN auth_provider = 'microsoft' THEN 'hybrid' ELSE 'google' END
         WHERE id = ?`,
        [verifiedName, updatedCohort, verifiedGoogleId, existingUser.id]
      );
    } else {
      const id = `tch-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = new Date().toISOString();
      const cohort =
        payload.cohort?.trim() || 'Cátedra Key Institute · Google';

      await dbRun(
        `INSERT INTO users (id, name, email, password, role, cohort, google_id, auth_provider, created_at)
         VALUES (?, ?, ?, 'GOOGLE_OAUTH', 'teacher', ?, ?, 'google', ?)`,
        [id, verifiedName, verifiedEmail, cohort, verifiedGoogleId || `goog-${id}`, createdAt]
      );
    }
  } else {
    if (existingUser) {
      await dbRun(
        `UPDATE users
         SET name = ?,
             google_id = COALESCE(NULLIF(?, ''), google_id),
             auth_provider = CASE WHEN auth_provider = 'microsoft' THEN 'hybrid' ELSE 'google' END
         WHERE id = ?`,
        [verifiedName, verifiedGoogleId, existingUser.id]
      );
    } else {
      const id = `stu-${crypto.randomUUID().slice(0, 8)}`;
      const createdAt = new Date().toISOString();
      const cohort =
        payload.cohort?.trim() ||
        'Cohorte Estudiantil Key Institute · Google';

      await dbRun(
        `INSERT INTO users (id, name, email, password, role, cohort, google_id, auth_provider, created_at)
         VALUES (?, ?, ?, 'GOOGLE_OAUTH', 'student', ?, ?, 'google', ?)`,
        [id, verifiedName, verifiedEmail, cohort, verifiedGoogleId || `goog-${id}`, createdAt]
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

export async function loginUser(email: string, password?: string) {
  await ensureDbReady();
  const normalized = email.trim().toLowerCase();
  const user: any = await dbGet(
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
  if (password !== undefined && password !== '' && user.password !== password) {
    return null;
  }

  const { password: _pw, ...safeUser } = user;
  return safeUser;
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password?: string;
  role: 'student' | 'teacher';
  cohort: string;
}) {
  await ensureDbReady();
  const id = `${payload.role === 'teacher' ? 'tch' : 'stu'}-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
  const email = payload.email.trim().toLowerCase();
  const password = payload.password?.trim() || 'key2026';

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
    authProvider: 'local',
    createdAt,
  };
}

export async function getAllStudyMaterials() {
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

export async function getUploadedFileFromDb(filename: string): Promise<{
  mimeType: string;
  size: number;
  buffer: Buffer;
} | null> {
  await ensureDbReady();
  const row: any = await dbGet(
    `SELECT mime_type as mimeType, size, data_base64 as dataBase64
     FROM uploaded_files
     WHERE filename = ?`,
    [filename]
  );
  if (!row || !row.dataBase64) return null;
  const buffer = Buffer.from(row.dataBase64, 'base64');
  return {
    mimeType: row.mimeType || 'application/octet-stream',
    size: Number(row.size) || buffer.length,
    buffer,
  };
}

async function saveBase64AttachmentIfPresent(payload: {
  attachmentName?: string | null;
  attachmentMime?: string | null;
  attachmentSize?: number | null;
  attachmentDataBase64?: string | null;
  attachmentUrl?: string | null;
}) {
  if (payload.attachmentDataBase64 && payload.attachmentName) {
    const safeName = payload.attachmentName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 6)}-${safeName}`;

    const base64Clean = payload.attachmentDataBase64.includes('base64,')
      ? payload.attachmentDataBase64.split('base64,')[1]
      : payload.attachmentDataBase64;

    const buffer = Buffer.from(base64Clean, 'base64');
    const mimeType = payload.attachmentMime || 'application/octet-stream';
    const byteSize = payload.attachmentSize || buffer.length;

    // 1. Save to local disk cache if writable
    try {
      const filePath = path.join(UPLOADS_DIR, uniqueFileName);
      fs.writeFileSync(filePath, buffer);
    } catch {
      // Ignore on read-only serverless disk
    }

    // 2. Persist in SQLite / Turso Cloud table so Vercel Serverless serves it 24/7
    await dbRun(
      `INSERT OR REPLACE INTO uploaded_files (filename, mime_type, size, data_base64, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [uniqueFileName, mimeType, byteSize, base64Clean, new Date().toISOString()]
    );

    return {
      attachmentName: payload.attachmentName,
      attachmentMime: mimeType,
      attachmentSize: byteSize,
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

export async function createStudyMaterial(payload: {
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
  await ensureDbReady();
  const id = `mat-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = new Date().toISOString();
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
      createdAt,
    ]
  );

  const all = await getAllStudyMaterials();
  return all.find((m: any) => m.id === id);
}

export async function updateStudyMaterial(
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
  await ensureDbReady();
  const allBefore = await getAllStudyMaterials();
  const existing: any = allBefore.find((m: any) => m.id === id);

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
      id,
    ]
  );

  const allAfter = await getAllStudyMaterials();
  return allAfter.find((m: any) => m.id === id);
}

export async function deleteStudyMaterial(id: string) {
  await ensureDbReady();
  await dbRun('DELETE FROM study_materials WHERE id = ?', [id]);
  return { deletedId: id };
}

export async function getAllTestAttempts(userId?: string) {
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

  const rows = userId
    ? await dbAll(`${baseQuery} WHERE t.user_id = ? ORDER BY datetime(t.completed_at) DESC`, [
        userId,
      ])
    : await dbAll(`${baseQuery} ORDER BY datetime(t.completed_at) DESC`);

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

export async function createTestAttempt(payload: {
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
  await ensureDbReady();
  const id = `att-${crypto.randomUUID().slice(0, 8)}`;
  const completedAt = new Date().toISOString();

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
      completedAt,
    ]
  );

  const all = await getAllTestAttempts();
  return all.find((item: any) => item.id === id);
}

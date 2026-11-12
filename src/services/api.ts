import {
  OptionId,
  SectionType,
  StudyMaterial,
  TestAttemptRecord,
  TestMode,
  UserRecord,
  UserRole,
} from '../types/exam';

export interface BootstrapResponse {
  users: UserRecord[];
  materials: StudyMaterial[];
  attempts: TestAttemptRecord[];
  authConfig?: {
    alwaysRequireTeacherPin: boolean;
    allowedDomains: string;
  };
}

async function safeFetchJson<T = any>(
  input: RequestInfo | URL,
  init?: RequestInit,
  fallbackError = 'Error de comunicación con el servidor'
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch (networkErr: any) {
    throw new Error(
      `No se pudo conectar con el servidor: ${networkErr?.message || 'Error de red'}`
    );
  }

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    const cleanPreview = text
      ? text
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 200)
          .trim()
      : '';
    const err: any = new Error(cleanPreview || fallbackError);
    err.statusCode = res.status;
    throw err;
  }

  if (!res.ok) {
    const err: any = new Error(data?.error || fallbackError);
    if (data?.code) err.code = data.code;
    err.statusCode = res.status;
    throw err;
  }

  return data as T;
}

export async function fetchBootstrapData(): Promise<BootstrapResponse> {
  return safeFetchJson<BootstrapResponse>(
    '/api/bootstrap',
    undefined,
    'No se pudo conectar con la base de datos (/api/bootstrap)'
  );
}

export async function apiAuthenticateWithMicrosoft(payload: {
  name: string;
  email: string;
  microsoftOid?: string;
  idToken?: string;
  accessToken?: string;
  requestedRole: UserRole;
  teacherPin?: string;
  cohort?: string;
}): Promise<{ user: UserRecord; users: UserRecord[] }> {
  return safeFetchJson(
    '/api/auth/microsoft',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'Error al autenticar con Microsoft'
  );
}

export async function apiAuthenticateWithGoogle(payload: {
  name: string;
  email: string;
  googleId?: string;
  idToken?: string;
  accessToken?: string;
  requestedRole: UserRole;
  teacherPin?: string;
  cohort?: string;
}): Promise<{ user: UserRecord; users: UserRecord[] }> {
  return safeFetchJson(
    '/api/auth/google',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'Error al autenticar con Google'
  );
}

export async function apiUpdateUserCohort(
  userId: string,
  cohort: string,
  options?: {
    allowOverride?: boolean;
    updatedByRole?: string;
    name?: string;
  }
): Promise<{
  user: UserRecord;
  users: UserRecord[];
  attempts: TestAttemptRecord[];
}> {
  return safeFetchJson(
    `/api/users/${userId}/cohort`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cohort,
        allowOverride: options?.allowOverride,
        updatedByRole: options?.updatedByRole,
        name: options?.name,
      }),
    },
    'Error al actualizar la información del estudiante'
  );
}

export async function apiLoginUser(
  email: string,
  password?: string
): Promise<UserRecord> {
  const data = await safeFetchJson<{ user: UserRecord }>(
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    'Error al iniciar sesión'
  );
  return data.user;
}

export async function apiRegisterUser(payload: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  cohort: string;
}): Promise<{ user: UserRecord; users: UserRecord[] }> {
  return safeFetchJson(
    '/api/auth/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'Error al registrar usuario'
  );
}

export async function apiCreateStudyMaterial(payload: {
  title: string;
  section: SectionType;
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
}): Promise<{ material: StudyMaterial; materials: StudyMaterial[] }> {
  return safeFetchJson(
    '/api/materials',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'Error al guardar material de estudio'
  );
}

export async function apiUpdateStudyMaterial(
  id: string,
  payload: {
    title: string;
    section: SectionType;
    category: string;
    summary: string;
    content: string;
    readingTimeMinutes: number;
    attachmentName?: string | null;
    attachmentMime?: string | null;
    attachmentSize?: number | null;
    attachmentDataBase64?: string | null;
    removeAttachment?: boolean;
  }
): Promise<{ material: StudyMaterial; materials: StudyMaterial[] }> {
  return safeFetchJson(
    `/api/materials/${id}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'Error al actualizar material de estudio'
  );
}

export async function apiDeleteStudyMaterial(
  id: string
): Promise<{ materials: StudyMaterial[] }> {
  return safeFetchJson(
    `/api/materials/${id}`,
    {
      method: 'DELETE',
    },
    'Error al eliminar material'
  );
}

export async function apiSaveTestAttempt(payload: {
  userId: string;
  mode: TestMode;
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
  answers: Record<string, OptionId>;
}): Promise<{ attempt: TestAttemptRecord; attempts: TestAttemptRecord[] }> {
  return safeFetchJson(
    '/api/attempts',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    'Error al guardar resultado en la base de datos'
  );
}

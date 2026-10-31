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

export async function fetchBootstrapData(): Promise<BootstrapResponse> {
  const res = await fetch('/api/bootstrap');
  if (!res.ok) {
    throw new Error('No se pudo conectar con la base de datos SQLite (/api/bootstrap)');
  }
  return res.json();
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
  const res = await fetch('/api/auth/microsoft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.error || 'Error al autenticar con Microsoft');
    err.code = data.code;
    throw err;
  }
  return data;
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
  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    const err: any = new Error(data.error || 'Error al autenticar con Google');
    err.code = data.code;
    throw err;
  }
  return data;
}

export async function apiUpdateUserCohort(
  userId: string,
  cohort: string
): Promise<{
  user: UserRecord;
  users: UserRecord[];
  attempts: TestAttemptRecord[];
}> {
  const res = await fetch(`/api/users/${userId}/cohort`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cohort }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar la cohorte del estudiante');
  }
  return data;
}

export async function apiLoginUser(
  email: string,
  password?: string
): Promise<UserRecord> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }
  return data.user;
}

export async function apiRegisterUser(payload: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  cohort: string;
}): Promise<{ user: UserRecord; users: UserRecord[] }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al registrar usuario');
  }
  return data;
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
  const res = await fetch('/api/materials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al guardar material de estudio');
  }
  return data;
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
  const res = await fetch(`/api/materials/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al actualizar material de estudio');
  }
  return data;
}

export async function apiDeleteStudyMaterial(
  id: string
): Promise<{ materials: StudyMaterial[] }> {
  const res = await fetch(`/api/materials/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al eliminar material');
  }
  return data;
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
  const res = await fetch('/api/attempts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Error al guardar resultado en la base de datos');
  }
  return data;
}

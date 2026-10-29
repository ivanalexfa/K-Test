import { TestAttemptRecord, UserRecord, UserRole } from '../types/exam';

/**
 * Clase base abstracta de Usuario para la plataforma PAA de Key Institute.
 */
export abstract class PlatformUser {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: UserRole;
  readonly cohort: string;
  readonly createdAt: string;

  constructor(record: UserRecord) {
    this.id = record.id;
    this.name = record.name;
    this.email = record.email;
    this.role = record.role;
    this.cohort = record.cohort;
    this.createdAt = record.createdAt;
  }

  abstract getRoleBadgeLabel(): string;
  abstract canManageMaterials(): boolean;
  abstract canViewGlobalAnalytics(): boolean;

  getInitials(): string {
    return this.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('');
  }
}

/**
 * Clase Estudiante: Tiene acceso a Materiales de Estudio, Pruebas de Simulacro
 * (Test Completo), Sprints (Test Corto) y su historial de resultados.
 */
export class StudentUser extends PlatformUser {
  constructor(record: UserRecord) {
    super({ ...record, role: 'student' });
  }

  override getRoleBadgeLabel(): string {
    return 'Estudiante · Aspirante PAA';
  }

  override canManageMaterials(): boolean {
    return false;
  }

  override canViewGlobalAnalytics(): boolean {
    return false;
  }

  getMyAttempts(allAttempts: TestAttemptRecord[]): TestAttemptRecord[] {
    return allAttempts.filter((a) => a.userId === this.id);
  }

  getAverageAccuracy(allAttempts: TestAttemptRecord[]): number {
    const mine = this.getMyAttempts(allAttempts);
    if (mine.length === 0) return 0;
    const sum = mine.reduce((acc, item) => acc + item.percentage, 0);
    return Math.round(sum / mine.length);
  }

  getBestSimulacroScore(allAttempts: TestAttemptRecord[]): number | null {
    const simulacros = this.getMyAttempts(allAttempts).filter(
      (a) => a.mode === 'simulacro'
    );
    if (simulacros.length === 0) return null;
    return Math.max(...simulacros.map((s) => s.scaledScore));
  }
}

/**
 * Clase Docente: Administra Materiales de Estudio en la base de datos y
 * consulta la matriz cruzada de Estudiantes × Resultados (Simulacros y Sprints).
 */
export class TeacherUser extends PlatformUser {
  constructor(record: UserRecord) {
    super({ ...record, role: 'teacher' });
  }

  override getRoleBadgeLabel(): string {
    return 'Docente · Cátedra Key Institute';
  }

  override canManageMaterials(): boolean {
    return true;
  }

  override canViewGlobalAnalytics(): boolean {
    return true;
  }
}

/**
 * Factory que instancia la clase correspondiente (StudentUser o TeacherUser)
 * a partir de un registro proveniente de la base de datos SQLite.
 */
export function instantiateUserClass(record: UserRecord): StudentUser | TeacherUser {
  if (record.role === 'teacher') {
    return new TeacherUser(record);
  }
  return new StudentUser(record);
}

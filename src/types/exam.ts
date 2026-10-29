export type OptionId = 'A' | 'B' | 'C' | 'D';

export type UserRole = 'student' | 'teacher';

export type TestMode = 'simulacro' | 'sprint_reading' | 'sprint_math';

export interface QuestionOption {
  id: OptionId;
  text: string;
}

export interface PassageLine {
  lineNumber: number;
  text: string;
  isParagraphStart?: boolean;
}

export interface ReadingPassage {
  id: string;
  title: string;
  authorOrSource: string;
  preamble: string;
  tag: string;
  lines: PassageLine[];
}

export type SectionType = 'reading' | 'math';

export interface ExamQuestion {
  id: string;
  numberInSection: number;
  section: SectionType;
  category: string;
  passageId?: string;
  referencedLines?: number[];
  referencedLinesLabel?: string;
  prompt: string;
  mathEquationBlock?: string;
  options: QuestionOption[];
  correctOption: OptionId;
  explanation: string;
}

export interface ExamSectionConfig {
  id: SectionType;
  title: string;
  subtitle: string;
  durationMinutes: number;
  description: string;
  questions: ExamQuestion[];
}

export interface MockPaaExamData {
  examTitle: string;
  institution: string;
  tagline: string;
  passages: Record<string, ReadingPassage>;
  sections: {
    reading: ExamSectionConfig;
    math: ExamSectionConfig;
  };
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cohort: string;
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  title: string;
  section: SectionType;
  category: string;
  summary: string;
  content: string;
  readingTimeMinutes: number;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface TestAttemptRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCohort: string;
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
  completedAt: string;
}

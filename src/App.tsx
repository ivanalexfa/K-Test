import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, CheckCircle2 } from 'lucide-react';
import rawExamData from './data/mockPaaExam.json';
import {
  ExamQuestion,
  MockPaaExamData,
  OptionId,
  SectionType,
  SprintConfig,
  StudyMaterial,
  TestAttemptRecord,
  TestMode,
  UserRecord,
  UserRole,
} from './types/exam';
import {
  instantiateUserClass,
  StudentUser,
  TeacherUser,
} from './models/UserClasses';
import {
  fetchBootstrapData,
  apiAuthenticateWithMicrosoft,
  apiAuthenticateWithGoogle,
  apiUpdateUserCohort,
  apiCreateStudyMaterial,
  apiUpdateStudyMaterial,
  apiDeleteStudyMaterial,
  apiSaveTestAttempt,
} from './services/api';
import { Header } from './components/Header';
import { KTestLogo } from './components/brand/KTestLogo';
import { AuthView } from './components/AuthView';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentOnboardingModal } from './components/StudentOnboardingModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ReadingQuestionView } from './components/ReadingQuestionView';
import { MathQuestionView } from './components/MathQuestionView';
import { FormulaModal } from './components/FormulaModal';
import { QuestionNavigatorModal } from './components/QuestionNavigatorModal';
import { SectionTransitionModal } from './components/SectionTransitionModal';
import { ResultsView } from './components/ResultsView';

const examData = rawExamData as unknown as MockPaaExamData;

type AppScreen = 'auth' | 'portal' | 'exam' | 'results';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('auth');
  const [loadingDb, setLoadingDb] = useState<boolean>(true);

  // Database state loaded from SQLite (/api/bootstrap)
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [attempts, setAttempts] = useState<TestAttemptRecord[]>([]);
  const [currentUserRecord, setCurrentUserRecord] = useState<UserRecord | null>(
    null
  );

  // Active exam state (Simulacro or Sprint)
  const [testMode, setTestMode] = useState<TestMode>('simulacro');
  const [activeSprintConfig, setActiveSprintConfig] =
    useState<SprintConfig | null>(null);
  const [currentSection, setCurrentSection] = useState<SectionType>('reading');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, OptionId>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>(
    {}
  );
  const [inspectedAttempt, setInspectedAttempt] =
    useState<TestAttemptRecord | null>(null);

  // Section Timer state
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600);
  const [timerVisible, setTimerVisible] = useState<boolean>(true);
  const examStartTimestampRef = useRef<number>(Date.now());

  // Modals state
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState<boolean>(false);
  const [isNavigatorModalOpen, setIsNavigatorModalOpen] = useState<boolean>(false);
  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState<boolean>(false);

  // Initial load from SQLite backend
  useEffect(() => {
    fetchBootstrapData()
      .then((data) => {
        setUsers(data.users);
        setMaterials(data.materials);
        setAttempts(data.attempts);
      })
      .catch((err) => {
        console.error('Error cargando base de datos:', err);
      })
      .finally(() => {
        setLoadingDb(false);
      });
  }, []);

  const activeUserInstance = currentUserRecord
    ? instantiateUserClass(currentUserRecord)
    : null;

  const activeSectionConfig = examData.sections[currentSection];

  // Filter questions when a specific SprintConfig is active
  const questions: ExamQuestion[] = useMemo(() => {
    const baseQuestions = activeSectionConfig.questions;
    if (!activeSprintConfig) return baseQuestions;

    const idSet = new Set(activeSprintConfig.questionIds);
    const filtered = baseQuestions.filter((q) => idSet.has(q.id));
    if (filtered.length === 0) return baseQuestions;

    return filtered.map((q, idx) => ({
      ...q,
      numberInSection: idx + 1,
    }));
  }, [activeSectionConfig.questions, activeSprintConfig]);

  const activeQuestion = questions[currentQuestionIndex] || questions[0];

  // Finalize test & persist to SQLite
  const finalizeAndSaveAttempt = useCallback(
    async (
      finalAnswers: Record<string, OptionId>,
      activeMode: TestMode,
      sprintCfg: SprintConfig | null
    ) => {
      if (!currentUserRecord) return;

      const allReading = examData.sections.reading.questions;
      const allMath = examData.sections.math.questions;

      const readingQs = sprintCfg
        ? sprintCfg.section === 'reading'
          ? allReading.filter((q) => sprintCfg.questionIds.includes(q.id))
          : []
        : activeMode === 'sprint_math'
        ? []
        : allReading;

      const mathQs = sprintCfg
        ? sprintCfg.section === 'math'
          ? allMath.filter((q) => sprintCfg.questionIds.includes(q.id))
          : []
        : activeMode === 'sprint_reading'
        ? []
        : allMath;

      const readingCorrect = readingQs.filter(
        (q) => finalAnswers[q.id] === q.correctOption
      ).length;
      const mathCorrect = mathQs.filter(
        (q) => finalAnswers[q.id] === q.correctOption
      ).length;

      const totalCorrect = readingCorrect + mathCorrect;
      const totalQuestions = readingQs.length + mathQs.length;
      const percentage =
        totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      const readingScaled =
        readingQs.length > 0
          ? Math.round(200 + (readingCorrect / readingQs.length) * 600)
          : 0;
      const mathScaled =
        mathQs.length > 0
          ? Math.round(200 + (mathCorrect / mathQs.length) * 600)
          : 0;

      const scaledScore =
        activeMode === 'simulacro'
          ? readingScaled + mathScaled
          : activeMode === 'sprint_reading'
          ? readingScaled
          : mathScaled;

      const modeTitle = sprintCfg
        ? `${sprintCfg.code}: ${sprintCfg.title}`
        : activeMode === 'simulacro'
        ? 'Simulacro Oficial PAA (Test Completo)'
        : activeMode === 'sprint_reading'
        ? 'Sprint de Lectura y Redacción (Test Corto)'
        : 'Sprint de Matemáticas (Test Corto)';

      const durationSeconds = Math.max(
        10,
        Math.round((Date.now() - examStartTimestampRef.current) / 1000)
      );

      try {
        const saved = await apiSaveTestAttempt({
          userId: currentUserRecord.id,
          mode: activeMode,
          modeTitle,
          readingCorrect,
          readingTotal: readingQs.length,
          mathCorrect,
          mathTotal: mathQs.length,
          totalCorrect,
          totalQuestions,
          percentage,
          scaledScore,
          durationSeconds,
          answers: finalAnswers,
        });
        setAttempts(saved.attempts);
        setInspectedAttempt(saved.attempt);
      } catch (err) {
        console.error('Error guardando intento en SQLite:', err);
      }
    },
    [currentUserRecord]
  );

  // Advance to next section (for full Simulacro) or finish and save
  const handleConfirmAdvanceSection = useCallback(async () => {
    setIsTransitionModalOpen(false);
    if (testMode === 'simulacro' && currentSection === 'reading') {
      setCurrentSection('math');
      setCurrentQuestionIndex(0);
      setSecondsRemaining(examData.sections.math.durationMinutes * 60);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await finalizeAndSaveAttempt(answers, testMode, activeSprintConfig);
      setScreen('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [
    testMode,
    currentSection,
    answers,
    activeSprintConfig,
    finalizeAndSaveAttempt,
  ]);

  // Countdown timer effect when in 'exam' screen
  useEffect(() => {
    if (screen !== 'exam') return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleConfirmAdvanceSection();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, currentSection, handleConfirmAdvanceSection]);

  const handleSelectUser = (user: UserRecord) => {
    setCurrentUserRecord(user);
    setScreen('portal');
  };

  const handleMicrosoftLogin = async (payload: {
    name: string;
    email: string;
    microsoftOid?: string;
    idToken?: string;
    accessToken?: string;
    requestedRole: UserRole;
    teacherPin?: string;
    cohort?: string;
  }) => {
    const res = await apiAuthenticateWithMicrosoft(payload);
    setUsers(res.users);
    setCurrentUserRecord(res.user);
    setScreen('portal');
  };

  const handleGoogleLogin = async (payload: {
    name: string;
    email: string;
    googleId?: string;
    idToken?: string;
    accessToken?: string;
    requestedRole: UserRole;
    teacherPin?: string;
    cohort?: string;
  }) => {
    const res = await apiAuthenticateWithGoogle(payload);
    setUsers(res.users);
    setCurrentUserRecord(res.user);
    setScreen('portal');
  };

  const handleStartTest = (mode: TestMode, sprintCfg?: SprintConfig) => {
    setTestMode(mode);
    setActiveSprintConfig(sprintCfg ?? null);
    setAnswers({});
    setFlaggedQuestions({});
    setInspectedAttempt(null);
    examStartTimestampRef.current = Date.now();

    if (sprintCfg) {
      setCurrentSection(sprintCfg.section);
      setCurrentQuestionIndex(0);
      setSecondsRemaining(sprintCfg.durationMinutes * 60);
    } else if (mode === 'simulacro') {
      setCurrentSection('reading');
      setCurrentQuestionIndex(0);
      setSecondsRemaining(examData.sections.reading.durationMinutes * 60);
    } else if (mode === 'sprint_reading') {
      setCurrentSection('reading');
      setCurrentQuestionIndex(0);
      setSecondsRemaining(5 * 60);
    } else {
      setCurrentSection('math');
      setCurrentQuestionIndex(0);
      setSecondsRemaining(6 * 60);
    }

    setScreen('exam');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectAttempt = (attempt: TestAttemptRecord) => {
    setInspectedAttempt(attempt);
    setTestMode(attempt.mode);
    setActiveSprintConfig(null);
    setAnswers(attempt.answers || {});
    setScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectOption = (optionId: OptionId) => {
    if (!activeQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [activeQuestion.id]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    if (!activeQuestion) return;
    setFlaggedQuestions((prev) => ({
      ...prev,
      [activeQuestion.id]: !prev[activeQuestion.id],
    }));
  };

  if (loadingDb) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#0A1128] text-white">
        <div className="text-center space-y-3">
          <div className="flex justify-center animate-pulse">
            <KTestLogo theme="dark" variant="full" />
          </div>
          <p className="text-xs font-mono-num text-[#00D2FF]">
            Inicializando entorno K-test...
          </p>
        </div>
      </div>
    );
  }

  // 1. Auth / User Class Selection View
  if (screen === 'auth' || !activeUserInstance) {
    return (
      <AuthView
        users={users}
        onSelectUser={handleSelectUser}
        onMicrosoftLogin={handleMicrosoftLogin}
        onGoogleLogin={handleGoogleLogin}
      />
    );
  }

  // 2. Results / Solucionario View (for both Student and Teacher inspection)
  if (screen === 'results') {
    const customQuestionsForResults = activeSprintConfig
      ? questions
      : inspectedAttempt && inspectedAttempt.mode !== 'simulacro'
      ? [...examData.sections.reading.questions, ...examData.sections.math.questions].filter(
          (q) =>
            q.id in (inspectedAttempt.answers || {}) ||
            (inspectedAttempt.mode === 'sprint_reading' && q.section === 'reading') ||
            (inspectedAttempt.mode === 'sprint_math' && q.section === 'math')
        )
      : null;

    return (
      <ResultsView
        examData={examData}
        testMode={testMode}
        customQuestions={customQuestionsForResults}
        answers={answers}
        attemptRecord={inspectedAttempt}
        onBackToPortal={() => setScreen('portal')}
      />
    );
  }

  // 3. Portal View (Distinction between StudentUser and TeacherUser classes)
  if (screen === 'portal') {
    if (activeUserInstance instanceof TeacherUser) {
      return (
        <TeacherDashboard
          teacher={activeUserInstance}
          users={users}
          materials={materials}
          attempts={attempts}
          onCreateMaterial={async (payload) => {
            const res = await apiCreateStudyMaterial(payload);
            setMaterials(res.materials);
          }}
          onUpdateMaterial={async (id, payload) => {
            const res = await apiUpdateStudyMaterial(id, payload);
            setMaterials(res.materials);
          }}
          onDeleteMaterial={async (id) => {
            const res = await apiDeleteStudyMaterial(id);
            setMaterials(res.materials);
          }}
          onInspectAttempt={handleInspectAttempt}
          onLogout={() => {
            setCurrentUserRecord(null);
            setScreen('auth');
          }}
        />
      );
    }

    if (activeUserInstance instanceof StudentUser) {
      const needsCohortOnboarding =
        !activeUserInstance.cohort || activeUserInstance.cohort.trim() === '';

      return (
        <>
          {needsCohortOnboarding && (
            <StudentOnboardingModal
              studentName={activeUserInstance.name}
              onConfirmCohort={async (chosenCohort: string) => {
                const res = await apiUpdateUserCohort(activeUserInstance.id, chosenCohort);
                setCurrentUserRecord(res.user);
                setUsers(res.users);
                setAttempts(res.attempts);
              }}
            />
          )}
          <StudentDashboard
            student={activeUserInstance}
            examData={examData}
            materials={materials}
            allAttempts={attempts}
            onStartTest={handleStartTest}
            onInspectAttempt={handleInspectAttempt}
            onUpdateCohort={async (newCohort: string) => {
              const res = await apiUpdateUserCohort(activeUserInstance.id, newCohort);
              setCurrentUserRecord(res.user);
              setUsers(res.users);
              setAttempts(res.attempts);
            }}
            onLogout={() => {
              setCurrentUserRecord(null);
              setScreen('auth');
            }}
          />
        </>
      );
    }
  }

  // 4. Active Exam Simulator View (Simulacro Completo or Sprint Corto)
  const answeredInSectionCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const flaggedInSectionCount = questions.filter((q) =>
    Boolean(flaggedQuestions[q.id])
  ).length;
  const isLastQuestionInSection = currentQuestionIndex === questions.length - 1;
  const activePassage = activeQuestion.passageId
    ? examData.passages[activeQuestion.passageId]
    : undefined;

  const headerBadgeTitle = activeSprintConfig
    ? `${activeSprintConfig.code} · ${activeSprintConfig.title}`
    : testMode === 'simulacro'
    ? activeSectionConfig.title
    : testMode === 'sprint_reading'
    ? 'Sprint Corto · Lectura y Redacción'
    : 'Sprint Corto · Matemáticas';

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0A1128]">
      {/* Top Sticky Simulator Header */}
      <Header
        currentSection={currentSection}
        sectionTitle={headerBadgeTitle}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        secondsRemaining={secondsRemaining}
        timerVisible={timerVisible}
        onToggleTimer={() => setTimerVisible((v) => !v)}
        onOpenFormulaModal={() => setIsFormulaModalOpen(true)}
        onOpenNavigatorModal={() => setIsNavigatorModalOpen(true)}
        answeredCount={answeredInSectionCount}
        flaggedCount={flaggedInSectionCount}
      />

      {/* Main Question Area: Reading Split View OR Math View */}
      <main className="flex-1 flex flex-col">
        {currentSection === 'reading' && activePassage ? (
          <ReadingQuestionView
            question={activeQuestion}
            passage={activePassage}
            selectedOption={answers[activeQuestion.id]}
            isFlagged={Boolean(flaggedQuestions[activeQuestion.id])}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
            totalQuestionsInSection={questions.length}
          />
        ) : (
          <MathQuestionView
            question={activeQuestion}
            selectedOption={answers[activeQuestion.id]}
            isFlagged={Boolean(flaggedQuestions[activeQuestion.id])}
            onSelectOption={handleSelectOption}
            onToggleFlag={handleToggleFlag}
            onOpenFormulaModal={() => setIsFormulaModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Sticky Exam Control Footer */}
      <footer className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-xs border-t border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none text-xs sm:text-sm font-semibold text-[#0A1128] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          {/* Center Question Palette Trigger */}
          <button
            type="button"
            onClick={() => setIsNavigatorModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-xs sm:text-sm font-semibold text-[#0A1128] transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-[#0052FF]" />
            <span>
              Pregunta <strong className="font-mono-num">{currentQuestionIndex + 1}</strong> de{' '}
              <strong className="font-mono-num">{questions.length}</strong>
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-mono-num">
              ({answeredInSectionCount}/{questions.length} respondidas)
            </span>
          </button>

          {/* Next OR Finish Section Button */}
          {!isLastQuestionInSection ? (
            <button
              type="button"
              onClick={() =>
                setCurrentQuestionIndex((i) => Math.min(questions.length - 1, i + 1))
              }
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-4 h-4 text-[#00D2FF]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsTransitionModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" />
              <span>
                {testMode === 'simulacro' && currentSection === 'reading'
                  ? 'Finalizar Sección 1'
                  : 'Entregar y Guardar'}
              </span>
            </button>
          )}
        </div>
      </footer>

      {/* Modals */}
      <FormulaModal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
      />

      <QuestionNavigatorModal
        isOpen={isNavigatorModalOpen}
        onClose={() => setIsNavigatorModalOpen(false)}
        sectionTitle={headerBadgeTitle}
        questions={questions}
        currentQuestionIndex={currentQuestionIndex}
        answers={answers}
        flaggedQuestions={flaggedQuestions}
        onSelectQuestionIndex={(idx) => setCurrentQuestionIndex(idx)}
        onRequestFinishSection={() => setIsTransitionModalOpen(true)}
      />

      <SectionTransitionModal
        isOpen={isTransitionModalOpen}
        onClose={() => setIsTransitionModalOpen(false)}
        testMode={testMode}
        currentSection={currentSection}
        sectionTitle={headerBadgeTitle}
        totalQuestions={questions.length}
        answeredCount={answeredInSectionCount}
        flaggedCount={flaggedInSectionCount}
        onConfirmAdvance={handleConfirmAdvanceSection}
      />
    </div>
  );
};

export default App;

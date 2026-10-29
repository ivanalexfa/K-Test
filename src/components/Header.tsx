import React from 'react';
import {
  Clock,
  Eye,
  EyeOff,
  Sigma,
  LayoutGrid,
  Sparkles,
  BookOpen,
  Calculator,
} from 'lucide-react';
import { SectionType } from '../types/exam';

interface HeaderProps {
  currentSection: SectionType;
  sectionTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  secondsRemaining: number;
  timerVisible: boolean;
  onToggleTimer: () => void;
  onOpenFormulaModal: () => void;
  onOpenNavigatorModal: () => void;
  answeredCount: number;
  flaggedCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentSection,
  sectionTitle,
  currentQuestionIndex,
  totalQuestions,
  secondsRemaining,
  timerVisible,
  onToggleTimer,
  onOpenFormulaModal,
  onOpenNavigatorModal,
  answeredCount,
  flaggedCount,
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLowTime = secondsRemaining <= 120;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <header className="sticky top-0 z-30 bg-[#0A1128] text-white shadow-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand + Active Section */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[#0052FF] flex items-center justify-center font-display font-extrabold text-sm tracking-tighter shadow-inner shadow-[#00D2FF]/40">
              K
            </div>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="font-display font-bold text-xs tracking-widest text-white">
                KEY INSTITUTE
              </span>
              <span className="text-[10px] text-[#00D2FF] font-medium tracking-wider uppercase mt-0.5">
                PAA Simulator
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-white/15 hidden sm:block" />

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/8 border border-white/10 truncate">
            {currentSection === 'reading' ? (
              <BookOpen className="w-3.5 h-3.5 text-[#00D2FF] shrink-0" />
            ) : (
              <Calculator className="w-3.5 h-3.5 text-[#00D2FF] shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium text-slate-100 truncate">
              {sectionTitle}
            </span>
          </div>
        </div>

        {/* Center: Timer with Privacy Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-white/6 border border-white/12 rounded-lg px-2.5 py-1.5">
          <Clock
            className={`w-4 h-4 shrink-0 ${
              isLowTime ? 'text-amber-400 animate-pulse' : 'text-[#00D2FF]'
            }`}
          />
          {timerVisible ? (
            <span
              className={`font-mono-num text-xs sm:text-sm font-semibold tracking-wider ${
                isLowTime ? 'text-amber-300' : 'text-white'
              }`}
            >
              {formattedTime}
            </span>
          ) : (
            <span className="text-xs text-slate-400 font-medium px-1">
              Tiempo oculto
            </span>
          )}
          <button
            type="button"
            onClick={onToggleTimer}
            title={timerVisible ? 'Ocultar reloj' : 'Mostrar reloj'}
            aria-label={timerVisible ? 'Ocultar reloj' : 'Mostrar reloj'}
            className="ml-1 p-1 rounded hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            {timerVisible ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Right: Math Formula Button & Question Navigator */}
        <div className="flex items-center gap-2">
          {currentSection === 'math' && (
            <button
              type="button"
              onClick={onOpenFormulaModal}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg bg-[#0052FF] hover:bg-[#0045D8] text-white font-medium text-xs sm:text-sm shadow-sm shadow-[#0052FF]/40 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Sigma className="w-4 h-4 text-[#00D2FF]" />
              <span className="hidden md:inline">Fórmulas PAA</span>
              <span className="md:hidden">Fórmulas</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNavigatorModal}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs sm:text-sm font-medium text-white transition-colors cursor-pointer"
            title="Abrir mapa de preguntas"
          >
            <LayoutGrid className="w-4 h-4 text-[#00D2FF]" />
            <span className="font-mono-num">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            {flaggedCount > 0 && (
              <span className="hidden sm:inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold bg-amber-400 text-[#0A1128] rounded-full">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Continuous Progress Bar */}
      <div className="w-full h-1 bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#0052FF] to-[#00D2FF] transition-all duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentQuestionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
        />
      </div>
    </header>
  );
};

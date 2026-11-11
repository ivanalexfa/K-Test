import React from 'react';
import {
  Clock,
  Eye,
  EyeOff,
  Sigma,
  LayoutGrid,
} from 'lucide-react';
import { SectionType } from '../types/exam';
import { LogoKey } from './brand/LogoKey';
import { MathPAAIcon, VerbalPAAIcon } from './brand/KTestIcons';

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
  answeredCount: _answeredCount,
  flaggedCount,
}) => {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLowTime = secondsRemaining <= 120;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <header className="sticky top-0 z-30 bg-key-blanco text-key-tinta border-b-[0.8px] border-key-negro">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo y sección activa */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="shrink-0">
            <div className="hidden lg:block">
              <LogoKey theme="light" variant="full" />
            </div>
            <div className="lg:hidden [&_img]:h-7">
              <LogoKey theme="light" variant="mark-only" conProducto={false} />
            </div>
          </div>

          <div className="max-sm:hidden flex items-center gap-2 min-w-0 pl-4 border-l-[0.8px] border-key-negro">
            {currentSection === 'reading' ? (
              <VerbalPAAIcon size={18} className="shrink-0" />
            ) : (
              <MathPAAIcon size={18} className="shrink-0" />
            )}
            <span className="text-sm font-semibold text-key-tinta truncate">{sectionTitle}</span>
          </div>
        </div>

        {/* Reloj: celda con línea fina; en los últimos 2 minutos, en color de alerta */}
        <div
          className={`flex items-center gap-1.5 h-10 px-2 sm:px-3 border-[0.8px] shrink-0 ${
            isLowTime ? 'border-estado-alerta bg-estado-alerta-fondo text-estado-alerta' : 'border-key-negro'
          }`}
        >
          <Clock aria-hidden="true" className={`w-4 h-4 shrink-0 max-[379px]:hidden ${isLowTime ? 'motion-safe:animate-pulse' : 'text-key-azul'}`} />
          {timerVisible ? (
            <span className="font-mono-num text-sm font-semibold">{formattedTime}</span>
          ) : (
            <span className="text-xs text-key-texto-suave font-medium px-0.5">Oculto</span>
          )}
          <button
            type="button"
            onClick={onToggleTimer}
            title={timerVisible ? 'Ocultar reloj' : 'Mostrar reloj'}
            aria-label={timerVisible ? 'Ocultar reloj' : 'Mostrar reloj'}
            className="p-1 rounded-full hover:bg-key-gris-claro text-key-texto-suave hover:text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-key-azul"
          >
            {timerVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Fórmulas y mapa de preguntas */}
        <div className="flex items-center gap-2 shrink-0">
          {currentSection === 'math' && (
            <button
              type="button"
              onClick={onOpenFormulaModal}
              aria-label="Fórmulas"
              className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            >
              <Sigma aria-hidden="true" className="w-4 h-4 text-key-azul" />
              <span className="hidden md:inline">Fórmulas</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenNavigatorModal}
            className="inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            title="Abrir mapa de preguntas"
            aria-label={`Mapa de preguntas, ${currentQuestionIndex + 1}/${totalQuestions}`}
          >
            <LayoutGrid aria-hidden="true" className="w-4 h-4 text-key-azul max-[379px]:hidden" />
            <span className="font-mono-num">
              {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            {flaggedCount > 0 && (
              <span className="hidden sm:inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-estado-alerta text-key-blanco rounded-full">
                {flaggedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Avance continuo */}
      <div className="w-full h-1 bg-key-gris overflow-hidden">
        <div
          className="h-full bg-key-azul transition-[width] duration-300 ease-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-label="Avance de la sección"
          aria-valuenow={currentQuestionIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
        />
      </div>
    </header>
  );
};

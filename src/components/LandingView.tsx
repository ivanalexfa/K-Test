import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Sparkles,
  Layers,
  Sigma,
} from 'lucide-react';
import { MockPaaExamData } from '../types/exam';

interface LandingViewProps {
  examData: MockPaaExamData;
  onStartExam: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  examData,
  onStartExam,
}) => {
  const { reading, math } = examData.sections;

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0A1128]">
      {/* Top Institutional Bar */}
      <div className="bg-[#0A1128] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center font-display font-extrabold text-base text-white shadow-md shadow-[#0052FF]/30">
              K
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-wider uppercase">
                KEY INSTITUTE
              </div>
              <div className="text-[11px] text-[#00D2FF] tracking-wide">
                Instituto Kriete de Ingeniería y Ciencias
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
            Estándar College Board PAA
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#0A1128] text-white p-6 sm:p-10 shadow-xl border border-slate-800 mb-8">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#0052FF]/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-[#00D2FF]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0052FF]/25 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-semibold uppercase tracking-wider mb-4">
              Admisión Académica · Powering Engineers for Life
            </div>
            <h1 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-3">
              {examData.examTitle}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Evalúa tus competencias en comprensión lectora, redacción académica y
              razonamiento matemático bajo un entorno digital fiel a la prueba PAA del
              College Board.
            </p>
          </div>
        </div>

        {/* Sequential Sections Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-base sm:text-lg font-bold text-[#0A1128] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#0052FF]" />
              Estructura Secuencial del Simulacro
            </h2>
            <span className="text-xs font-medium text-slate-500">
              2 módulos obligatorios en orden estricto
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Module 1: Reading & Writing */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0052FF]" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0052FF]/10 text-[#0052FF] text-xs font-bold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5" />
                    Módulo 01
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono-num font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {reading.durationMinutes} min · {reading.questions.length} preguntas
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-[#0A1128] mb-1.5">
                  {reading.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {reading.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium">
                  Vista dividida pasaje / pregunta
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium">
                  Líneas numeradas (5, 10, 15...)
                </span>
              </div>
            </div>

            {/* Module 2: Mathematics */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00D2FF]" />
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A1128] text-[#00D2FF] text-xs font-bold uppercase tracking-wider">
                    <Calculator className="w-3.5 h-3.5" />
                    Módulo 02
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-mono-num font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {math.durationMinutes} min · {math.questions.length} preguntas
                  </span>
                </div>

                <h3 className="font-display text-lg font-bold text-[#0A1128] mb-1.5">
                  {math.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {math.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium">
                  <Sigma className="w-3.5 h-3.5 text-[#0052FF]" />
                  Renderizado LaTeX (KaTeX)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200/80 font-medium">
                  Modal de Fórmulas Geométricas PAA
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Exam Guidelines & CTA */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-[#0A1128]">
              <ShieldCheck className="w-4 h-4 text-[#0052FF] shrink-0" />
              Instrucciones del Flujo Secuencial
            </div>
            <ul className="space-y-1 text-slate-600 pl-6 list-disc">
              <li>
                Comenzarás con <strong>Lectura y Redacción</strong>. Al concluir y confirmar tu entrega, avanzarás a <strong>Matemáticas</strong> sin regresar al módulo anterior.
              </li>
              <li>
                Puedes marcar preguntas para revisión dentro de la sección activa y ocultar el cronómetro si deseas concentrarte sin presión.
              </li>
              <li>
                Al finalizar ambas secciones obtendrás tu puntaje desglosado y la explicación paso a paso de cada reactivo.
              </li>
            </ul>
          </div>

          <button
            type="button"
            onClick={onStartExam}
            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-display font-bold text-sm sm:text-base shadow-lg shadow-[#0052FF]/25 transition-all cursor-pointer active:scale-[0.99]"
          >
            <span>Iniciar Simulacro PAA</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </main>
    </div>
  );
};

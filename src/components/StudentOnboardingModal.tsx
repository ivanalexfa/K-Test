import React, { useState } from 'react';
import { GraduationCap, Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { KEY_ADMISSION_COHORTS } from '../data/cohortsCatalog';
import { KTestLogo } from './brand/KTestLogo';

interface StudentOnboardingModalProps {
  studentName: string;
  onConfirmCohort: (cohort: string) => Promise<void>;
}

export const StudentOnboardingModal: React.FC<StudentOnboardingModalProps> = ({
  studentName,
  onConfirmCohort,
}) => {
  const [selectedCohort, setSelectedCohort] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCohort) {
      setError('Por favor selecciona un ciclo de admisión para continuar.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onConfirmCohort(selectedCohort);
    } catch (err: any) {
      setError(err?.message || 'No se pudo guardar tu ciclo de admisión. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const firstName = studentName.trim().split(' ')[0] || 'Estudiante';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1128]/85 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-lg bg-[#0A1128] border border-white/20 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white">
        {/* Glow ambient background effects */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#0052FF]/30 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#00D2FF]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <KTestLogo theme="dark" variant="full" />
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0052FF]/30 text-[#00D2FF] border border-[#00D2FF]/30 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
              Paso Único
            </span>
          </div>

          {/* Welcome Message */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00D2FF]">
              <GraduationCap className="w-4 h-4 text-[#00D2FF]" />
              Expediente de Admisión
            </div>
            <h2
              id="onboarding-modal-title"
              className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight"
            >
              ¡Bienvenido, {firstName}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Para inicializar tu registro académico en Key Institute, selecciona el ciclo al que aspiras ingresar.
            </p>
          </div>

          {/* Immutability Notice Box */}
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/15 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#00D2FF] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white font-semibold">Selección Definitiva:</strong> Una vez confirmado, tu ciclo quedará registrado permanentemente en tu expediente y no podrá ser modificado. Tampoco se te volverá a solicitar en futuros inicios de sesión.
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="cohort-select"
                className="block text-xs font-bold text-slate-200 mb-1.5"
              >
                Ciclo de Admisión Oficial <span className="text-[#00D2FF]">*</span>
              </label>
              <select
                id="cohort-select"
                value={selectedCohort}
                onChange={(e) => {
                  setSelectedCohort(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-white/20 bg-[#080E24] text-white font-semibold text-sm focus:outline-none focus:border-[#00D2FF] transition-colors cursor-pointer"
              >
                <option value="" disabled className="text-slate-400">
                  Selecciona tu ciclo de admisión...
                </option>
                {KEY_ADMISSION_COHORTS.map((cohortName) => (
                  <option key={cohortName} value={cohortName} className="text-white bg-[#0A1128]">
                    {cohortName}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !selectedCohort}
              className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#0052FF] to-[#00D2FF] hover:brightness-110 active:scale-[0.99] text-white font-display font-bold text-sm sm:text-base shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
            >
              <span>{loading ? 'Guardando expediente...' : 'Confirmar Ciclo y Comenzar'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

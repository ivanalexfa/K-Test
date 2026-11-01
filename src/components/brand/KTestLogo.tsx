import React from 'react';

interface KTestLogoProps {
  variant?: 'full' | 'mark-only';
  theme?: 'dark' | 'light';
  className?: string;
}

export const KTestLogo: React.FC<KTestLogoProps> = ({
  variant = 'full',
  theme = 'light',
  className = '',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 shadow-sm rounded-xl"
      >
        <rect width="40" height="40" rx="10" fill="#0A1128" />
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="9"
          stroke="#00D2FF"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />
        <circle cx="28" cy="12" r="10" fill="#00D2FF" fillOpacity="0.12" />
        <path
          d="M13 11V29"
          stroke="#0052FF"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M27 11L17.5 20L27 29"
          stroke="#00D2FF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="13" cy="20" r="2.5" fill="#00D2FF" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-display text-xl font-extrabold tracking-tight ${
                isDark ? 'text-white' : 'text-[#0A1128]'
              }`}
            >
              K<span className="text-[#0052FF]">-</span>test
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#00D2FF]/15 text-[#0052FF] border border-[#00D2FF]/30">
              PAA
            </span>
          </div>
          <span
            className={`font-sans text-[10px] font-semibold tracking-widest uppercase mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            by Key Institute
          </span>
        </div>
      )}
    </div>
  );
};

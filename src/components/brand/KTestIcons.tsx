import React from 'react';

export interface CustomIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  primaryColor?: string;
  accentColor?: string;
}

export const SimulacroEngineIcon: React.FC<CustomIconProps> = ({
  size = 24,
  primaryColor = '#006DFF',
  accentColor = '#111111',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="13" r="8" fill={accentColor} fillOpacity="0.14" />
    <path d="M10 2h4" stroke={primaryColor} />
    <path d="M12 2v3" stroke={primaryColor} />
    <path d="M19 6l-1.5 1.5" stroke={accentColor} />
    <circle cx="12" cy="13" r="8" stroke={primaryColor} />
    <path d="M12.5 9.5L10.5 13h3l-1 3.5" stroke={accentColor} strokeWidth="2" />
  </svg>
);

export const AsyncTrainerIcon: React.FC<CustomIconProps> = ({
  size = 24,
  primaryColor = '#006DFF',
  accentColor = '#0B7A43',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" fill={primaryColor} fillOpacity="0.08" />
    <path d="M7 16l4-4 3 3 4-5" stroke={primaryColor} />
    <circle cx="7" cy="16" r="2" fill="#FFFFFF" stroke={primaryColor} />
    <circle cx="11" cy="12" r="2" fill="#FFFFFF" stroke={primaryColor} />
    <circle cx="14" cy="15" r="2" fill="#FFFFFF" stroke={primaryColor} />
    <circle cx="18" cy="9" r="2.5" fill={accentColor} stroke={accentColor} />
  </svg>
);

export const TeacherDiagnosticIcon: React.FC<CustomIconProps> = ({
  size = 24,
  primaryColor = '#111111',
  accentColor = '#006DFF',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 3 20 8.5 17 18.5 7 18.5 4 8.5" fill={accentColor} fillOpacity="0.15" stroke={primaryColor} />
    <path d="M12 3v9m0 0l8-3.5M12 12l-5 6.5M12 12l5 6.5M12 12L4 8.5" stroke={accentColor} strokeOpacity="0.5" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="2" fill="#111111" stroke={primaryColor} strokeWidth="1.5" />
  </svg>
);

export const MathPAAIcon: React.FC<CustomIconProps> = ({
  size = 24,
  primaryColor = '#006DFF',
  accentColor = '#111111',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="4 19 19 19 19 5" fill={accentColor} fillOpacity="0.15" />
    <path d="M4 19h15V5L4 19z" stroke={primaryColor} />
    <path d="M15 19v-4h4" stroke={accentColor} />
    <path d="M8 5c-1.5 0-2 1-2 2.5v3.5" stroke={primaryColor} />
    <path d="M4.5 8h3.5" stroke={primaryColor} />
  </svg>
);

export const VerbalPAAIcon: React.FC<CustomIconProps> = ({
  size = 24,
  primaryColor = '#006DFF',
  accentColor = '#111111',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="4" y="3" width="16" height="18" rx="2.5" fill={accentColor} fillOpacity="0.1" stroke={primaryColor} />
    <circle cx="8" cy="8" r="1" fill={accentColor} />
    <circle cx="8" cy="12" r="1" fill={accentColor} />
    <circle cx="8" cy="16" r="1" fill={accentColor} />
    <path d="M11 8h5" stroke={primaryColor} />
    <path d="M11 12h6" stroke={primaryColor} />
    <path d="M11 16h3.5" stroke={accentColor} strokeWidth="2.2" />
  </svg>
);

export const StrikeOptionIcon: React.FC<CustomIconProps> = ({
  size = 20,
  primaryColor = '#5C6670',
  accentColor = '#C2261E',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="9" stroke={primaryColor} strokeDasharray="3 3" />
    <path d="M9.5 15L12 9l2.5 6" stroke={primaryColor} />
    <path d="M10.2 13.5h3.6" stroke={primaryColor} />
    <path d="M5 19L19 5" stroke={accentColor} strokeWidth="2.2" />
  </svg>
);

export const KeyHintIcon: React.FC<CustomIconProps> = ({
  size = 24,
  primaryColor = '#7A5A00',
  accentColor = '#111111',
  ...props
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="8.5" cy="14.5" r="4.5" fill={primaryColor} fillOpacity="0.18" stroke={primaryColor} />
    <path d="M11.8 11.2L19 4m0 0l2 2m-2-2l-2.5 2.5L18 8" stroke={primaryColor} />
    <path d="M6 4v3M4.5 5.5h3" stroke={accentColor} strokeWidth="2" />
  </svg>
);

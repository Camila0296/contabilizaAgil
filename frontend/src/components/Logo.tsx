import React from 'react';

interface LogoProps {
  size?: number;
  withText?: boolean;
  textMode?: 'dark' | 'light';
}

export default function Logo({ size = 40, withText = false, textMode = 'dark' }: LogoProps) {
  const id = `lg-${size}`;
  const isDark = textMode === 'dark';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: withText ? 12 : 0 }}>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none"
        xmlns="http://www.w3.org/2000/svg" aria-label="Contabiliza Ágil" role="img"
        style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id={`${id}-g1`} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#7c3aed" />
            <stop offset="55%"  stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
          <filter id={`${id}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#7c3aed" floodOpacity="0.45" />
          </filter>
          <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="white" stopOpacity="0.25" />
            <stop offset="60%"  stopColor="white" stopOpacity="0.05" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Badge con gradiente y sombra de color */}
        <rect width="48" height="48" rx="13" fill={`url(#${id}-g1)`} filter={`url(#${id}-shadow)`} />

        {/* Brillo superior (glass effect) */}
        <rect x="3" y="3" width="42" height="22" rx="10" fill={`url(#${id}-shine)`} />

        {/* Barras de gráfico ascendentes */}
        <rect x="28" y="28" width="3.5" height="9"  rx="1.5" fill="white" fillOpacity="0.38" />
        <rect x="33" y="23" width="3.5" height="14" rx="1.5" fill="white" fillOpacity="0.38" />
        <rect x="38" y="18" width="3.5" height="19" rx="1.5" fill="white" fillOpacity="0.38" />

        {/* Monograma CA */}
        <text x="5" y="32" fontFamily="'Plus Jakarta Sans', Inter, system-ui, sans-serif"
          fontWeight="800" fontSize="18" fill="white" letterSpacing="-0.5">CA</text>

        {/* Flecha trending up */}
        <polyline points="28,14 32,10 36,14"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeOpacity="0.9" />
        <line x1="32" y1="10" x2="32" y2="18"
          stroke="white" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.9" />
      </svg>

      {withText && (
        <div style={{ lineHeight: 1.1 }}>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '1rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: isDark ? '#0f0f23' : '#ffffff',
          }}>
            Contabiliza
          </div>
          <div style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'linear-gradient(90deg, #7c3aed, #0ea5e9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: isDark ? 'transparent' : undefined,
            color: isDark ? 'transparent' : 'rgba(255,255,255,0.70)',
          }}>
            Ágil
          </div>
        </div>
      )}
    </div>
  );
}

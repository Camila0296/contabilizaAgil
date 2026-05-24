/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
          400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
          800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
        },
        accent: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63',
        },
        indigo: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
        },
        success: {
          50: '#f0fdf4', 100: '#dcfce7', 400: '#4ade80',
          500: '#22c55e', 600: '#16a34a', 700: '#15803d',
        },
        warning: {
          50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24',
          500: '#f59e0b', 600: '#d97706', 700: '#b45309',
        },
        danger: {
          50: '#fef2f2', 100: '#fee2e2', 400: '#f87171',
          500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
        },
        secondary: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a', 950: '#020617',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'gradient-sidebar': 'linear-gradient(170deg, #1e1035 0%, #12103a 40%, #0d1b3e 70%, #0a1628 100%)',
        'gradient-brand':   'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
        'gradient-warm':    'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
        'gradient-success': 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
        'gradient-card1':   'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        'gradient-card2':   'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
        'gradient-card3':   'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-card4':   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        'gradient-auth':    'linear-gradient(135deg, #4c1d95 0%, #312e81 30%, #1e3a8a 60%, #164e63 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'soft':       '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'medium':     '0 4px 25px -5px rgba(0,0,0,0.10)',
        'strong':     '0 10px 40px -10px rgba(0,0,0,0.20)',
        'glow-brand': '0 8px 32px -4px rgba(124,58,237,0.45)',
        'glow-cyan':  '0 8px 32px -4px rgba(6,182,212,0.40)',
        'glow-green': '0 8px 32px -4px rgba(16,185,129,0.40)',
        'glow-amber': '0 8px 32px -4px rgba(245,158,11,0.40)',
        'glow-sm':    '0 4px 16px -2px rgba(124,58,237,0.30)',
        'card-hover': '0 16px 48px -8px rgba(0,0,0,0.16)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.1)',
      },
      borderRadius: {
        '2xl': '1rem', '3xl': '1.5rem', '4xl': '2rem',
      },
      animation: {
        'fade-up':     'fadeUp 0.5s ease-out both',
        'fade-in':     'fadeIn 0.4s ease-out both',
        'slide-in':    'slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
        'float':       'float 6s ease-in-out infinite',
        'shimmer':     'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        glowPulse: {
          '0%,100%': { boxShadow: '0 0 20px rgba(124,58,237,0.2)' },
          '50%':     { boxShadow: '0 0 40px rgba(124,58,237,0.5)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}

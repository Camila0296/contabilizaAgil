import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import Logo from './Logo';

interface AuthPageProps {
  onLogin: (userRole: string) => void;
}

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    title: 'Facturación automática',
    desc: 'IVA, ReteFuente e ICA calculados al instante',
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Reportes en PDF y Excel',
    desc: 'Exporta tus reportes con un solo clic',
    color: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: 'Asistente contable con IA',
    desc: 'Asesoría sobre IVA, PUC y normativa colombiana',
    color: 'bg-sky-100 text-sky-600',
  },
];

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: 'linear-gradient(135deg, #eef2ff 0%, #f0f9ff 50%, #ecfdf5 100%)' }}>
      <div className="max-w-4xl w-full">

        {/* Logo + título */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="relative">
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-40"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #0ea5e9)', transform: 'scale(1.4)' }} />
              <Logo size={64} textMode="dark" />
            </div>
          </div>
          <h2 className="text-3xl font-bold font-display mb-2" style={{ color: '#0f0f23', letterSpacing: '-0.03em' }}>
            Contabiliza Ágil
          </h2>
          <p className="text-gray-400 text-sm">Sistema de Gestión Contable para empresas colombianas</p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-strong overflow-hidden border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">

            {/* Formulario */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {showLogin ? (
                <Login onLogin={onLogin} />
              ) : (
                <Register onRegisterSuccess={() => setShowLogin(true)} />
              )}

              <div className="text-center mt-8">
                {showLogin ? (
                  <p className="text-gray-600 text-sm">
                    ¿No tienes cuenta?{' '}
                    <button
                      className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200 focus:outline-none underline underline-offset-2"
                      onClick={() => setShowLogin(false)}
                    >
                      Regístrate aquí
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm">
                    ¿Ya tienes cuenta?{' '}
                    <button
                      className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200 focus:outline-none underline underline-offset-2"
                      onClick={() => setShowLogin(true)}
                    >
                      Inicia sesión
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Panel derecho — gradiente oscuro premium */}
            <div className="hidden lg:flex flex-col justify-center p-10 relative overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #1e1035 0%, #2d1b69 30%, #1e3a8a 65%, #0c4a6e 100%)' }}>

              {/* Círculos decorativos de fondo */}
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
              <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-15"
                style={{ background: 'radial-gradient(circle, #0ea5e9 0%, transparent 70%)' }} />

              <div className="relative z-10 w-full max-w-xs mx-auto">

                {/* Logo + headline */}
                <div className="mb-8">
                  <div className="inline-flex items-center px-3 py-1 rounded-full mb-5 text-xs font-semibold"
                    style={{ background: 'rgba(124,58,237,0.3)', color: '#c4b5fd', border: '1px solid rgba(167,139,250,0.3)' }}>
                    ✦ Plataforma certificada para PYMES
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3 leading-tight font-display">
                    Todo lo que necesitas para crecer
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Gestiona tu contabilidad de forma inteligente y cumple con la normativa colombiana sin esfuerzo.
                  </p>
                </div>

                {/* Feature cards con glassmorphism */}
                <div className="space-y-3">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-4 p-4 rounded-2xl"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.10)',
                      }}
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-white"
                        style={{ background: 'rgba(255,255,255,0.15)' }}>
                        {f.icon}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{f.title}</p>
                        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Badge de confianza */}
                <div className="mt-8 flex items-center space-x-2">
                  <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>Datos seguros y respaldados · Normativa colombiana</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-400">
            © 2024 Contabiliza Ágil. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;

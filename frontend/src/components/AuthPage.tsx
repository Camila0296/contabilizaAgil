import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-strong mb-6">
            <span className="text-white font-bold text-3xl">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ContaPro</h2>
          <p className="text-gray-600">Sistema de Gestión Contable Profesional</p>
        </div>

        {/* Card principal */}
        <div className="bg-white rounded-2xl shadow-strong overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
            {/* Formulario */}
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              {showLogin ? (
                <Login onLogin={onLogin} />
              ) : (
                <Register onRegisterSuccess={() => setShowLogin(true)} />
              )}
              
              <div className="text-center mt-8">
                {showLogin ? (
                  <p className="text-gray-600">
                    ¿No tienes cuenta?{' '}
                    <button 
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                      onClick={() => setShowLogin(false)}
                    >
                      Regístrate aquí
                    </button>
                  </p>
                ) : (
                  <p className="text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <button 
                      className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
                      onClick={() => setShowLogin(true)}
                    >
                      Inicia sesión
                    </button>
                  </p>
                )}
              </div>
            </div>

            {/* Imagen */}
            <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 p-8">
              <div className="text-center">
                <div className="w-64 h-64 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-2xl flex items-center justify-center mb-6 shadow-soft">
                  <svg className="w-32 h-32 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Gestión Contable Inteligente</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Administra tus facturas, reportes y procesos contables de manera eficiente y profesional
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2024 ContaPro. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
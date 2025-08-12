import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Home from './components/Home';
import Facturas from './components/Facturas';
import Usuarios from './components/Usuarios';
import Aprobaciones from './components/Aprobaciones';
import Perfil from './components/Perfil';
import Reportes from './components/Reportes';

type Section = 'panel' | 'facturacion' | 'reportes' | 'usuarios' | 'aprobaciones' | 'perfil';

const Sidebar: React.FC<{ 
  role: string | null; 
  onLogout: () => void; 
  onSection: (s: Section) => void; 
  section: Section 
}> = ({ role, onLogout, onSection, section }) => {
  return (
    <aside className="sidebar">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">Contabiliza Agil</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {role !== 'user' && (
            <button
              className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                section === 'panel' 
                  ? 'bg-primary-100 text-primary-700 shadow-sm' 
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              onClick={() => onSection('panel')}
            >
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span>Panel</span>
              </div>
            </button>
          )}
          
          <button
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              section === 'facturacion' 
                ? 'bg-primary-100 text-primary-700 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={() => onSection('facturacion')}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Facturación</span>
            </div>
          </button>
          
          <button
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              section === 'reportes' 
                ? 'bg-primary-100 text-primary-700 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            onClick={() => onSection('reportes')}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Reportes</span>
            </div>
          </button>
          
          <button 
            className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
              section === 'perfil' 
                ? 'bg-primary-100 text-primary-700 shadow-sm' 
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`} 
            onClick={() => onSection('perfil')}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Perfil</span>
            </div>
          </button>
          
          {role !== 'user' && (
            <>
              <button 
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  section === 'usuarios' 
                    ? 'bg-primary-100 text-primary-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`} 
                onClick={() => onSection('usuarios')}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span>Usuarios</span>
                </div>
              </button>
              
              <button 
                className={`w-full text-left px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  section === 'aprobaciones' 
                    ? 'bg-primary-100 text-primary-700 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`} 
                onClick={() => onSection('aprobaciones')}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Aprobaciones</span>
                </div>
              </button>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button 
            className="w-full btn btn-outline" 
            onClick={onLogout}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          Cerrar sesión
        </button>
        </div>
      </div>
    </aside>
  );
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [section, setSection] = useState<Section>('panel');
  const [isLoading, setIsLoading] = useState(true);

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    const validateToken = async () => {
      // Si no hay token o rol, marcar como no autenticado
      if (!token || !userRole) {
        setIsLoggedIn(false);
        setRole(null);
        setIsLoading(false);
        return;
      }

      // Primero establecer el estado como autenticado para mostrar la interfaz
      setIsLoggedIn(true);
      setRole(userRole);
      
      // Validar el token en segundo plano
      try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Token inválido');
        }
      } catch (error) {
        console.error('Error al validar el token:', error);
        // Solo limpiar si hay un error de autenticación específico
        if (error instanceof Error && error.message === 'Token inválido') {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userId');
          setIsLoggedIn(false);
          setRole(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  // Si el rol es usuario y la sección actual no está permitida, redirigir
  useEffect(() => {
    if (role === 'user' && section === 'panel') {
      setSection('facturacion');
    }
  }, [role, section]);

  // Mostrar un loader mientras se verifica la autenticación inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Solo mostrar si está logueado */}
      {isLoggedIn && (
        <header className="bg-white shadow-soft border-b border-gray-200 transition-all duration-300 ml-64">
          <div className="flex items-center justify-center h-16 px-6">
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Gestión Contable</h1>
          </div>
        </header>
      )}

      {isLoggedIn ? (
        <div className="app-layout">
          <Sidebar 
            role={role} 
            onLogout={() => {
              // Limpiar localStorage al cerrar sesión
              localStorage.removeItem('token');
              localStorage.removeItem('userId');
              localStorage.removeItem('role');
              // Resetear estado
              setIsLoggedIn(false);
              setRole(null);
              setSection('panel');
              // Redirigir a la página de login
              window.location.href = '/';
            }} 
            onSection={setSection} 
            section={section} 
          />
          <main className="main-content">
            {section === 'panel' && role !== 'user' && <Home onSectionChange={setSection} />}
            {section === 'facturacion' && <Facturas userId={localStorage.getItem('userId')} />}
            {section === 'reportes' && <Reportes />}
            {section === 'usuarios' && role !== 'user' && <Usuarios />}
            {section === 'aprobaciones' && role !== 'user' && <Aprobaciones />}
            {section === 'perfil' && <Perfil />}
          </main>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <AuthPage onLogin={(userRole) => { 
            setIsLoggedIn(true); 
            setRole(userRole);
            // Redirigir según el rol
            if (userRole === 'user') {
              setSection('facturacion');
            } else {
              setSection('panel');
            }
          }} />
        </div>
      )}
    </div>
  );
}

export default App;
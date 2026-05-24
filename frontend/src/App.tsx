import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Home from './components/Home';
import Facturas from './components/Facturas';
import Usuarios from './components/Usuarios';
import Aprobaciones from './components/Aprobaciones';
import Perfil from './components/Perfil';
import Reportes from './components/Reportes';
import ChatBot from './components/ChatBot';
import Logo from './components/Logo';

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
        <div className="flex items-center h-20 px-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Logo size={40} withText textMode="light" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {role !== 'user' && (
            <button
              className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                section === 'panel'
                  ? 'text-white font-semibold'
                  : 'text-white/60 hover:text-white'
              }`}
              style={section === 'panel' ? { background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #a78bfa' } : {}}
              onClick={() => onSection('panel')}
            >
              <div className="flex items-center space-x-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{ background: section === 'panel' ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)', boxShadow: section === 'panel' ? '0 0 14px rgba(167,139,250,0.45)' : 'none' }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                  </svg>
                </span>
                <span>Panel de Control</span>
              </div>
            </button>
          )}

          <button
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              section === 'facturacion'
                ? 'text-white font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
            style={section === 'facturacion' ? { background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #a78bfa' } : {}}
            onClick={() => onSection('facturacion')}
          >
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: section === 'facturacion' ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)', boxShadow: section === 'facturacion' ? '0 0 14px rgba(167,139,250,0.45)' : 'none' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <span>Facturación</span>
            </div>
          </button>

          <button
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              section === 'reportes'
                ? 'text-white font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
            style={section === 'reportes' ? { background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #a78bfa' } : {}}
            onClick={() => onSection('reportes')}
          >
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: section === 'reportes' ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)', boxShadow: section === 'reportes' ? '0 0 14px rgba(167,139,250,0.45)' : 'none' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </span>
              <span>Reportes</span>
            </div>
          </button>

          <button
            className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
              section === 'perfil'
                ? 'text-white font-semibold'
                : 'text-white/60 hover:text-white'
            }`}
            style={section === 'perfil' ? { background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #a78bfa' } : {}}
            onClick={() => onSection('perfil')}
          >
            <div className="flex items-center space-x-3">
              <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{ background: section === 'perfil' ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)', boxShadow: section === 'perfil' ? '0 0 14px rgba(167,139,250,0.45)' : 'none' }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </span>
              <span>Mi Perfil</span>
            </div>
          </button>

          {role !== 'user' && (
            <>
              <div className="pt-3 pb-1 px-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Administración</p>
              </div>

              <button
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  section === 'usuarios'
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
                style={section === 'usuarios' ? { background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #a78bfa' } : {}}
                onClick={() => onSection('usuarios')}
              >
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{ background: section === 'usuarios' ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)', boxShadow: section === 'usuarios' ? '0 0 14px rgba(167,139,250,0.45)' : 'none' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </span>
                  <span>Usuarios</span>
                </div>
              </button>

              <button
                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  section === 'aprobaciones'
                    ? 'text-white font-semibold'
                    : 'text-white/60 hover:text-white'
                }`}
                style={section === 'aprobaciones' ? { background: 'rgba(255,255,255,0.12)', boxShadow: 'inset 3px 0 0 #a78bfa' } : {}}
                onClick={() => onSection('aprobaciones')}
              >
                <div className="flex items-center space-x-3">
                  <span className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                    style={{ background: section === 'aprobaciones' ? 'rgba(167,139,250,0.28)' : 'rgba(255,255,255,0.07)', boxShadow: section === 'aprobaciones' ? '0 0 14px rgba(167,139,250,0.45)' : 'none' }}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <span>Aprobaciones</span>
                </div>
              </button>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ''; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.45)'; }}
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificar autenticación al cargar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    
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
      // Usar el rol principal para compatibilidad con el código existente
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
    if (!role) return; // Si no hay rol, no hacer nada
    
    const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isAdmin = userRoles.includes('admin');
    
    // Si no es admin y está en una sección no permitida, redirigir a facturación
    if (!isAdmin && (section === 'panel' || section === 'usuarios' || section === 'aprobaciones')) {
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
        <header className="bg-white border-b border-gray-200 fixed top-0 right-0 left-0 z-30 lg:left-64 transition-all duration-300"
          style={{ boxShadow: '0 1px 8px rgba(79,70,229,0.07)' }}>
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Botón de menú móvil */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-400 lg:hidden transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-bold font-display" style={{ color: '#0f0f23', letterSpacing: '-0.02em' }}>Sistema de Gestión Contable</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Contabiliza Ágil — Plataforma profesional para PYMES</p>
            </div>
            {/* Indicador de usuario activo */}
            <div className="flex items-center space-x-2 bg-indigo-50 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-medium text-indigo-700 hidden sm:block">
                {role === 'admin' ? 'Administrador' : role === 'approver' ? 'Aprobador' : 'Usuario'}
              </span>
            </div>
          </div>
        </header>
      )}

      {isLoggedIn ? (
        <div className="relative min-h-screen flex">
          {/* Overlay móvil */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            ></div>
          )}
          
          {/* Sidebar - Móvil y escritorio */}
          <div className={`fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-30 w-64 transition-transform duration-300 ease-in-out`}>
            <div className="h-full overflow-y-auto">
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
                onSection={(section) => {
                  setSection(section);
                  setMobileMenuOpen(false); // Cerrar menú al seleccionar una opción
                }} 
                section={section} 
              />
            </div>
          </div>
          
          {/* Contenido principal */}
          <main className="flex-1 pt-16 lg:pt-0 lg:ml-64 p-4 sm:p-6 transition-all duration-300">
            {section === 'panel' && role !== 'user' && <Home onSectionChange={setSection} />}
            {section === 'facturacion' && <Facturas userId={localStorage.getItem('userId')} />}
            {section === 'reportes' && <Reportes />}
            {section === 'usuarios' && role !== 'user' && <Usuarios />}
            {section === 'aprobaciones' && role !== 'user' && <Aprobaciones />}
            {section === 'perfil' && <Perfil />}
          </main>

          <ChatBot
            currentSection={section}
            onNavigate={(s) => setSection(s as Section)}
            isLoggedIn={isLoggedIn}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <AuthPage onLogin={(userRole) => { 
            setIsLoggedIn(true); 
            setRole(userRole);
            
            // Obtener roles desde localStorage
            const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
            const isAdmin = userRoles.includes('admin');
            
            // Redirigir según el rol
            if (isAdmin) {
              setSection('panel');
            } else {
              setSection('facturacion');
            }
          }} />
        </div>
      )}
    </div>
  );
}

export default App;
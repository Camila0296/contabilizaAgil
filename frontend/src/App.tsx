import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Home from './components/Home';
import Facturas from './components/Facturas';
import Usuarios from './components/Usuarios';
import Aprobaciones from './components/Aprobaciones';
import Perfil from './components/Perfil';

type Section = 'panel' | 'facturacion' | 'reportes' | 'usuarios' | 'aprobaciones' | 'perfil';

const Sidebar: React.FC<{ role: string | null; onLogout: () => void; onSection: (s: Section) => void; section: Section }> = ({ role, onLogout, onSection, section }) => {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">LOGO</div>
        <nav className="sidebar-nav">
          {role !== 'user' && (
            <button
              className={`sidebar-link${section === 'panel' ? ' active' : ''}`}
              type="button"
              onClick={() => onSection('panel')}
            >
              Panel
            </button>
          )}
          <button
            className={`sidebar-link${section === 'facturacion' ? ' active' : ''}`}
            type="button"
            onClick={() => onSection('facturacion')}
          >
            Facturación
          </button>
          <button
            className={`sidebar-link${section === 'reportes' ? ' active' : ''}`}
            type="button"
            onClick={() => onSection('reportes')}
          >
            Reportes
          </button>
          <button className={`sidebar-link${section === 'perfil' ? ' active' : ''}`} type="button" onClick={() => onSection('perfil')}>
            Perfil
          </button>
          {role !== 'user' && (
            <>
              <button className="sidebar-link" type="button" onClick={() => onSection('usuarios')}>Usuarios</button>
              <button className="sidebar-link" type="button" onClick={() => onSection('aprobaciones')}>Aprobaciones</button>
              <button className="sidebar-link" type="button">Clientes</button>
              <button className="sidebar-link" type="button">Configuración</button>
            </>
          )}
        </nav>
      </div>
      <div className="sidebar-footer">
        <button className="btn btn-light w-100" onClick={onLogout}>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

function App() {
  const initialLoggedIn = Boolean(localStorage.getItem('token'));
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoggedIn);
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [section, setSection] = useState<Section>('panel');

  // Si el rol es usuario y la sección actual no está permitida, redirigir
  useEffect(() => {
    if (role === 'user' && section === 'panel') {
      setSection('facturacion');
    }
  }, [role, section]);

  return (
    <>
      <header className={`main-header${isLoggedIn ? ' with-sidebar' : ''}`}>
        <div className="container d-flex flex-wrap justify-content-center">
          <h1 className="main-title">Mi Aplicación Contable</h1>
        </div>
      </header>
      {isLoggedIn ? (
        <div className="app-layout">
          <Sidebar role={role} onLogout={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            setIsLoggedIn(false);
            setRole(null);
          }} onSection={setSection} section={section} />
          <main className="main-content">
            {section === 'panel' && role !== 'user' && <Home />}
            {section === 'facturacion' && <Facturas userId={localStorage.getItem('userId')} />}
            {section === 'usuarios' && role !== 'user' && <Usuarios /> }
            {section === 'aprobaciones' && role !== 'user' && <Aprobaciones /> }
            {section === 'perfil' && <Perfil /> }
          </main>
        </div>
      ) : (
        <AuthPage onLogin={() => { setIsLoggedIn(true); setRole(localStorage.getItem('role')); }} />
      )}
    </>
  );
}

export default App;
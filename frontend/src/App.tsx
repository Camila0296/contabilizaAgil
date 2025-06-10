import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import Home from './components/Home';
import Facturas from './components/Facturas';

const Sidebar: React.FC<{ onLogout: () => void; onSection: (s: 'panel' | 'facturacion') => void; section: string }> = ({ onLogout, onSection, section }) => (
  <aside className="sidebar">
    <div>
      <div className="sidebar-logo">LOGO</div>
      <nav className="sidebar-nav">
        <button
          className={`sidebar-link${section === 'panel' ? ' active' : ''}`}
          type="button"
          onClick={() => onSection('panel')}
        >
          Panel
        </button>
        <button
          className={`sidebar-link${section === 'facturacion' ? ' active' : ''}`}
          type="button"
          onClick={() => onSection('facturacion')}
        >
          Facturación
        </button>
        <button className="sidebar-link" type="button">Reportes</button>
        <button className="sidebar-link" type="button">Clientes</button>
        <button className="sidebar-link" type="button">Configuración</button>
      </nav>
    </div>
    <div className="sidebar-footer">
      <button className="btn btn-light w-100" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  </aside>
);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [section, setSection] = useState<'panel' | 'facturacion'>('panel');

  return (
    <>
      <header className={`main-header${isLoggedIn ? ' with-sidebar' : ''}`}>
        <div className="container d-flex flex-wrap justify-content-center">
          <h1 className="main-title">Mi Aplicación Contable</h1>
        </div>
      </header>
      {isLoggedIn ? (
        <div className="app-layout">
          <Sidebar onLogout={() => setIsLoggedIn(false)} onSection={setSection} section={section} />
          <main className="main-content">
            {section === 'panel' && <Home />}
            {section === 'facturacion' && <Facturas />}
          </main>
        </div>
      ) : (
        <AuthPage onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
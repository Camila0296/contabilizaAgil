import React, { useState } from 'react';
import AuthPage from './components/AuthPage';
import Home from './components/Home';

const Sidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
  <aside className="sidebar">
    <div>
      <div className="sidebar-logo">LOGO</div>
      <nav className="sidebar-nav">
        <a className="sidebar-link" href="#">Panel</a>
        <a className="sidebar-link" href="#">Facturación</a>
        <a className="sidebar-link" href="#">Reportes</a>
        <a className="sidebar-link" href="#">Clientes</a>
        <a className="sidebar-link" href="#">Configuración</a>
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

  return (
    <>
      <header className={`main-header${isLoggedIn ? ' with-sidebar' : ''}`}>
        <div className="container d-flex flex-wrap justify-content-center">
          <h1 className="main-title">Mi Aplicación Contable</h1>
        </div>
      </header>
      {isLoggedIn ? (
        <div className="app-layout">
          <Sidebar onLogout={() => setIsLoggedIn(false)} />
          <main className="main-content">
            <Home />
          </main>
        </div>
      ) : (
        <AuthPage onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

export default App;
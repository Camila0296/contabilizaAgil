import React from 'react';
import AuthPage from './components/AuthPage';

function App() {
  return (
    <>
      <header className="py-3 mb-4 border-bottom" style={{ background: 'var(--primary)', color: 'white' }}>
        <div className="container d-flex flex-wrap justify-content-center">
          <h1 style={{ fontWeight: 700, letterSpacing: 1 }}>Mi Aplicación Contable</h1>
        </div>
      </header>
      <AuthPage />
    </>
  );
}

export default App;
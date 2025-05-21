import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

interface AuthPageProps {
  onLogin: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      {/* Logo dummy */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--primary, #22356f)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 700,
          fontSize: 32,
          marginBottom: 24,
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
        }}
      >
        LOGO
      </div>

      {/* Card with form and image */}
      <div className="card shadow-lg" style={{ maxWidth: 900, width: '100%', borderRadius: 16 }}>
        <div className="row g-0">
          {/* Formulario */}
          <div className="col-md-6 p-5 d-flex flex-column justify-content-center">
            {showLogin ? (
              <Login onLogin={onLogin} />
            ) : (
              <Register onRegisterSuccess={() => setShowLogin(true)} />
            )}
            <div className="text-center mt-3">
              {showLogin ? (
                <span>
                  ¿No tienes cuenta?{' '}
                  <button className="btn btn-link p-0" onClick={() => setShowLogin(false)}>
                    Regístrate
                  </button>
                </span>
              ) : (
                <span>
                  ¿Ya tienes cuenta?{' '}
                  <button className="btn btn-link p-0" onClick={() => setShowLogin(true)}>
                    Inicia sesión
                  </button>
                </span>
              )}
            </div>
          </div>
          {/* Imagen */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center" style={{ background: 'var(--primary-bg, #f5f6fa)' }}>
            <img
              src="https://impulso06.com/wp-content/uploads/2023/12/porque-estudiar-contabilidad-en-2024.png"
              alt="Contabilidad"
              style={{ maxWidth: '90%', borderRadius: 12 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
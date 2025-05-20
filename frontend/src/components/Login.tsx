import React from 'react';

const Login: React.FC = () => (
  <form>
    <h2 className="mb-3">Iniciar Sesión</h2>
    <div className="mb-3">
      <label className="form-label">Correo electrónico</label>
      <input type="email" className="form-control" required />
    </div>
    <div className="mb-3">
      <label className="form-label">Contraseña</label>
      <input type="password" className="form-control" required />
    </div>
    <button type="submit" className="btn btn-primary w-100">Entrar</button>
  </form>
);

export default Login;
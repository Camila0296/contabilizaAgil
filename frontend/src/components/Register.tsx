import React from 'react';

const Register: React.FC = () => (
  <form>
    <h2 className="mb-3">Registro</h2>
    <div className="mb-3">
      <label className="form-label">Correo electrónico</label>
      <input type="email" className="form-control" required />
    </div>
    <div className="mb-3">
      <label className="form-label">Contraseña</label>
      <input type="password" className="form-control" required />
    </div>
    <div className="mb-3">
      <label className="form-label">Confirmar contraseña</label>
      <input type="password" className="form-control" required />
    </div>
    <button type="submit" className="btn btn-success w-100">Registrarse</button>
  </form>
);

export default Register;
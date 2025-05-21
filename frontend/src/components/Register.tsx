import React, { useState } from 'react';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres,
          apellidos,
          email,
          password
        })
      });
      if (res.ok) {
        onRegisterSuccess(); // Regresa al login
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrar usuario');
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-3 text-center">Registro</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="mb-3">
        <label className="form-label">Nombres</label>
        <input
          type="text"
          className="form-control"
          value={nombres}
          onChange={e => setNombres(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Apellidos</label>
        <input
          type="text"
          className="form-control"
          value={apellidos}
          onChange={e => setApellidos(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Correo electrónico</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirmar contraseña</label>
        <input
          type="password"
          className="form-control"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-success w-100">Registrarse</button>
    </form>
  );
};

export default Register;
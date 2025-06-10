import React, { useState } from 'react';
import { apiFetch } from '../api';

interface RegisterProps {
  onRegisterSuccess?: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [form, setForm] = useState({ nombres: '', apellidos: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSuccess('Usuario registrado correctamente');
        if (onRegisterSuccess) onRegisterSuccess();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al registrar');
      }
    } catch {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="mb-3 text-center">Registro</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div className="mb-3">
        <label className="form-label">Nombres</label>
        <input
          type="text"
          className="form-control"
          name="nombres"
          value={form.nombres}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Apellidos</label>
        <input
          type="text"
          className="form-control"
          name="apellidos"
          value={form.apellidos}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Correo electrónico</label>
        <input
          type="email"
          className="form-control"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Contraseña</label>
        <input
          type="password"
          className="form-control"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Confirmar contraseña</label>
        <input
          type="password"
          className="form-control"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>
      <button type="submit" className="btn btn-success w-100">Registrarse</button>
    </form>
  );
};

export default Register;
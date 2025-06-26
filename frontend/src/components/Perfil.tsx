import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { showError, showSuccess } from '../utils/alerts';

interface PerfilData {
  nombres: string;
  apellidos: string;
  email: string;
}

const Perfil: React.FC = () => {
  const [form, setForm] = useState<PerfilData>({ nombres: '', apellidos: '', email: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiFetch('/users/me');
        const data = await res.json();
        setForm({ nombres: data.nombres, apellidos: data.apellidos, email: data.email });
      } catch {
        showError('No se pudo cargar el perfil');
      }
      setLoading(false);
    };
    fetchMe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { nombres: form.nombres, apellidos: form.apellidos };
      if (password.trim()) payload.password = password;
      const res = await apiFetch('/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showSuccess('Perfil actualizado');
        setPassword('');
      } else {
        const data = await res.json();
        showError(data.error || 'No se pudo actualizar');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  if (loading) return <p className="p-4">Cargando...</p>;

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <h3 className="mb-4" style={{ color: 'var(--primary)' }}>Mi perfil</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email (no editable)</label>
          <input className="form-control" value={form.email} readOnly />
        </div>
        <div className="mb-3">
          <label className="form-label">Nombres</label>
          <input name="nombres" className="form-control" value={form.nombres} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Apellidos</label>
          <input name="apellidos" className="form-control" value={form.apellidos} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Nueva contraseña (opcional)</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn btn-primary">Guardar cambios</button>
      </form>
    </div>
  );
};

export default Perfil;

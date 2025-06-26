import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { showError, showSuccess } from '../utils/alerts';

interface Usuario {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
}

const Aprobaciones: React.FC = () => {
  const [list, setList] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPendings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/users?approved=false');
      const data = await res.json();
      setList(data);
    } catch {
      showError('Error al cargar solicitudes');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPendings();
  }, []);

  const approve = async (id: string) => {
    try {
      const res = await apiFetch(`/users/${id}/approve`, { method: 'PUT' });
      if (res.ok) {
        showSuccess('Usuario aprobado');
        setList(list.filter(u => u._id !== id));
      } else showError('No se pudo aprobar');
    } catch { showError('Error de conexión'); }
  };

  const reject = async (id: string) => {
    try {
      const res = await apiFetch(`/users/${id}/reject`, { method: 'PUT' });
      if (res.ok) {
        showSuccess('Solicitud rechazada');
        setList(list.filter(u => u._id !== id));
      } else showError('No se pudo rechazar');
    } catch { showError('Error de conexión'); }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4" style={{ color: 'var(--primary)' }}>Solicitudes de Registro</h3>
      {loading ? (
        <p>Cargando...</p>
      ) : list.length === 0 ? (
        <p>No hay solicitudes pendientes</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover modern-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th style={{ width: 120 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map(u => (
                <tr key={u._id}>
                  <td>{u.nombres}</td>
                  <td>{u.apellidos}</td>
                  <td>{u.email}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-success me-2" title="Aprobar" onClick={() => approve(u._id)}>✔️</button>
                    <button className="btn btn-sm btn-outline-danger" title="Rechazar" onClick={() => reject(u._id)}>✖️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Aprobaciones;

import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { showSuccess, showError } from '../utils/alerts';

interface User {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role: {
    _id: string;
    name: string;
  };
  activo: boolean;
  approved: boolean;
  createdAt: string;
}

const Aprobaciones: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await apiFetch('/users');
      const data = await res.json();
      // Filtrar solo usuarios pendientes de aprobación
      const pendientes = data.filter((user: User) => !user.approved);
      setUsuarios(pendientes);
    } catch {
      showError('No se pudieron cargar las solicitudes');
    } finally {
    setLoading(false);
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true })
      });

      if (res.ok) {
        showSuccess('Usuario aprobado exitosamente');
        fetchUsuarios(); // Recargar la lista
      } else {
        showError('Error al aprobar usuario');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleRechazar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta solicitud? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: false })
      });

      if (res.ok) {
        showSuccess('Solicitud rechazada');
        fetchUsuarios(); // Recargar la lista
      } else {
        showError('Error al rechazar solicitud');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleAprobarTodos = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres aprobar todas las solicitudes pendientes (${usuarios.length})?`)) {
      return;
    }

    try {
      const promises = usuarios.map(user => 
        apiFetch(`/users/${user._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approved: true })
        })
      );

      await Promise.all(promises);
      showSuccess('Todas las solicitudes han sido aprobadas');
      fetchUsuarios();
    } catch {
      showError('Error al aprobar solicitudes');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Aprobaciones de Usuarios</h1>
          <p className="text-gray-600 mt-1">Gestiona las solicitudes de registro de nuevos usuarios</p>
        </div>
        {usuarios.length > 0 && (
          <button 
            className="btn btn-success flex items-center space-x-2"
            onClick={handleAprobarTodos}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Aprobar Todos ({usuarios.length})</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solicitudes Pendientes</p>
                <p className="text-2xl font-bold text-warning-600">{usuarios.length}</p>
              </div>
              <div className="p-3 bg-warning-100 rounded-lg">
                <svg className="w-6 h-6 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nuevos Hoy</p>
                <p className="text-2xl font-bold text-primary-600">
                  {usuarios.filter(u => {
                    const today = new Date().toDateString();
                    const userDate = new Date(u.createdAt).toDateString();
                    return today === userDate;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold text-success-600">
                  {usuarios.filter(u => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(u.createdAt) >= weekAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol Solicitado</th>
                <th>Fecha Solicitud</th>
                <th>Tiempo de Espera</th>
                <th className="w-48">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-500">Cargando solicitudes...</span>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-lg font-medium">No hay solicitudes pendientes</p>
                      <p className="text-sm">Todos los usuarios han sido procesados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map(usuario => {
                  const fechaSolicitud = new Date(usuario.createdAt);
                  const ahora = new Date();
                  const tiempoEspera = Math.floor((ahora.getTime() - fechaSolicitud.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <tr key={usuario._id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <p className="font-medium text-gray-900">
                            {usuario.nombres} {usuario.apellidos}
                          </p>
                        </div>
                      </td>
                      <td className="table-cell text-gray-600">{usuario.email}</td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.role.name === 'admin' 
                            ? 'bg-primary-100 text-primary-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {usuario.role.name}
                        </span>
                      </td>
                      <td className="table-cell text-sm text-gray-500">
                        {fechaSolicitud.toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          tiempoEspera > 7 
                            ? 'bg-danger-100 text-danger-800' 
                            : tiempoEspera > 3 
                            ? 'bg-warning-100 text-warning-800'
                            : 'bg-success-100 text-success-800'
                        }`}>
                          {tiempoEspera === 0 ? 'Hoy' : 
                           tiempoEspera === 1 ? 'Ayer' : 
                           `${tiempoEspera} días`}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            className="btn btn-success btn-sm flex items-center space-x-1"
                            onClick={() => handleAprobar(usuario._id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>Aprobar</span>
                          </button>
                          
                          <button
                            className="btn btn-danger btn-sm flex items-center space-x-1"
                            onClick={() => handleRechazar(usuario._id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span>Rechazar</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Información adicional */}
      {usuarios.length > 0 && (
        <div className="card">
          <div className="card-body">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Información sobre aprobaciones</h3>
                <div className="mt-2 text-sm text-gray-600">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Los usuarios aprobados podrán acceder al sistema inmediatamente</li>
                    <li>Los usuarios rechazados serán desactivados y no podrán acceder</li>
                    <li>Se recomienda revisar cada solicitud antes de aprobar</li>
                    <li>Las solicitudes con más de 7 días de espera se marcan en rojo</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprobaciones;

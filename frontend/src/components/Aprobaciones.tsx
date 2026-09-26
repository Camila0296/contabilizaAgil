import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { showSuccess, showError } from '../utils/alerts';
import { TIPOS_DOCUMENTO_PERMITIDOS } from '../utils/fileUpload';

// Reconstruye el data URI a partir de un tipo permitido y el contenido base64, para no
// incrustar tal cual un valor cargado por el usuario (p. ej. data:text/html,...)
export function documentoSrc(doc: { tipo?: string; datos?: string }): string | null {
  if (!doc.tipo || !TIPOS_DOCUMENTO_PERMITIDOS.includes(doc.tipo) || !doc.datos) return null;
  const base64 = doc.datos.includes(',') ? doc.datos.split(',').pop() : doc.datos;
  if (!base64 || !/^[A-Za-z0-9+/=s]+$/.test(base64)) return null;
  return `data:${doc.tipo};base64,${base64}`;
}

interface User {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  role: {
    _id: string;
    name: string;
  };
  activo: boolean;
  approved: boolean;
  documentoIdentidad?: {
    tipo?: string;
    fechaCargue?: string;
    verificado?: boolean;
  };
}

interface DocumentoIdentidad {
  tipo: string;
  datos: string;
  fechaCargue?: string;
  verificado?: boolean;
}

const Aprobaciones: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentoModal, setDocumentoModal] = useState<DocumentoIdentidad | null>(null);
  const [loadingDocumento, setLoadingDocumento] = useState<string | null>(null);

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      // El backend devuelve solo las cuentas pendientes (no depende de la paginación de /users)
      const res = await apiFetch('/aprobaciones/pendientes?limit=100');
      const response = await res.json();
      setUsuarios(response.data || []);
    } catch {
      showError('No se pudieron cargar las solicitudes');
    } finally {
    setLoading(false);
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      // Aprueba y reactiva la cuenta (approved + activo)
      const res = await apiFetch(`/aprobaciones/${id}/aprobar`, { method: 'PUT' });

      if (res.ok) {
        showSuccess('Usuario aprobado exitosamente');
        fetchUsuarios(); // Recargar la lista
      } else {
        const data = await res.json().catch(() => ({}));
        showError(data.error || 'Error al aprobar usuario');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleRechazar = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres rechazar esta solicitud? El usuario se eliminará permanentemente y esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await apiFetch(`/users/${id}/reject`, {
        method: 'DELETE'
      });

      if (res.ok) {
        showSuccess('Solicitud rechazada y usuario eliminado');
        fetchUsuarios(); // Recargar la lista
      } else {
        const data = await res.json();
        showError(data.error || 'Error al rechazar solicitud');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleVerDocumento = async (id: string) => {
    setLoadingDocumento(id);
    try {
      const res = await apiFetch(`/users/${id}/documento`);
      if (res.ok) {
        const data = await res.json();
        setDocumentoModal(data.documentoIdentidad);
      } else {
        showError('No se pudo cargar el documento del usuario');
      }
    } catch {
      showError('Error de conexión');
    } finally {
      setLoadingDocumento(null);
    }
  };

  const handleAprobarTodos = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres aprobar todas las solicitudes pendientes (${usuarios.length})?`)) {
      return;
    }

    try {
      const res = await apiFetch('/aprobaciones/batch/aprobar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: usuarios.map(user => user._id) })
      });

      if (res.ok) {
        showSuccess('Todas las solicitudes han sido aprobadas');
      } else {
        showError('Error al aprobar solicitudes');
      }
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
      <div className="grid grid-cols-1 gap-6">
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
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>N° Documento</th>
                <th>Rol Solicitado</th>
                <th>Documento</th>
                <th className="w-56">Acciones</th>
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
                  return (
                    <tr key={usuario._id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center">
                          <div>
                            <p className="font-medium text-gray-900">{`${usuario.nombres} ${usuario.apellidos}`}</p>
                            <p className="text-sm text-gray-500">{usuario.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-900">{usuario.email}</span>
                      </td>
                      <td className="table-cell">
                        <span className="text-gray-900">
                          {usuario.numeroDocumento
                            ? `${usuario.tipoDocumento || 'CC'} ${usuario.numeroDocumento}`
                            : '—'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {usuario.role.name}
                        </span>
                      </td>
                      <td className="table-cell">
                        {usuario.documentoIdentidad?.fechaCargue ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                            Cargado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center space-x-2">
                          <button
                            className="btn btn-secondary btn-sm flex items-center space-x-1"
                            disabled={!usuario.documentoIdentidad?.fechaCargue || loadingDocumento === usuario._id}
                            onClick={() => handleVerDocumento(usuario._id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Ver</span>
                          </button>
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
                    <li>Los usuarios rechazados serán eliminados permanentemente del sistema</li>
                    <li>Se recomienda revisar cada solicitud antes de aprobar</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {documentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Documento de identidad</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
                onClick={() => setDocumentoModal(null)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              {!documentoSrc(documentoModal) ? (
                <p className="text-center text-gray-500">El documento no tiene un formato válido</p>
              ) : documentoModal.tipo.startsWith('image/') ? (
                <img
                  src={documentoSrc(documentoModal) as string}
                  alt="Documento de identidad"
                  className="max-w-full max-h-[70vh] mx-auto rounded-lg"
                />
              ) : (
                <embed
                  src={documentoSrc(documentoModal) as string}
                  type="application/pdf"
                  className="w-full h-[70vh] rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Aprobaciones;

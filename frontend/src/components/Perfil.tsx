import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { showSuccess, showError } from '../utils/alerts';

interface UserProfile {
  _id: string;
  nombres: string;
  apellidos: string;
  email: string;
  role?: {
    _id: string;
    name: string;
  };
  activo: boolean;
  approved: boolean;
  createdAt: string;
}

const Perfil: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
      try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showError('No se pudo identificar al usuario');
        return;
      }

      const res = await apiFetch(`/users/${userId}`);
        const data = await res.json();
      setProfile(data);
      setForm({
        nombres: data.nombres,
        apellidos: data.apellidos,
        email: data.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      } catch {
        showError('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
    };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    if (form.newPassword && form.newPassword.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        showError('No se pudo identificar al usuario');
        return;
      }

      const updateData: any = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        email: form.email
      };

      if (form.newPassword) {
        updateData.currentPassword = form.currentPassword;
        updateData.newPassword = form.newPassword;
      }

      const res = await apiFetch(`/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        showSuccess('Perfil actualizado exitosamente');
        setEditing(false);
        fetchProfile();
        // Limpiar campos de contraseña
        setForm(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        const data = await res.json();
        showError(data.error || 'Error al actualizar perfil');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <svg className="animate-spin h-8 w-8 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-gray-500">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-500">No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y credenciales</p>
        </div>
        <button
          className={`btn ${editing ? 'btn-outline' : 'btn-primary'} flex items-center space-x-2`}
          onClick={() => setEditing(!editing)}
        >
          {editing ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Cancelar</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Editar Perfil</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Perfil */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información Personal */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
            </div>
            <div className="card-body">
              {editing ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
          <label className="form-label">Nombres</label>
                      <input
                        type="text"
                        className="form-input"
                        name="nombres"
                        value={form.nombres}
                        onChange={handleChange}
                        required
                        placeholder="Juan"
                      />
        </div>

                    <div className="form-group">
          <label className="form-label">Apellidos</label>
                      <input
                        type="text"
                        className="form-input"
                        name="apellidos"
                        value={form.apellidos}
                        onChange={handleChange}
                        required
                        placeholder="Pérez"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="juan.perez@email.com"
                    />
                  </div>

                  {/* Cambio de Contraseña */}
                  <div className="border-t border-gray-200 pt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Cambiar Contraseña</h4>
                    <div className="space-y-4">
                      <div className="form-group">
                        <label className="form-label">Contraseña Actual</label>
                        <input
                          type="password"
                          className="form-input"
                          name="currentPassword"
                          value={form.currentPassword}
                          onChange={handleChange}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label className="form-label">Nueva Contraseña</label>
                          <input
                            type="password"
                            className="form-input"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            minLength={6}
                          />
                          <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Confirmar Nueva Contraseña</label>
                          <input
                            type="password"
                            className="form-input"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setEditing(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                    >
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Nombres</p>
                      <p className="text-gray-900">{profile.nombres}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Apellidos</p>
                      <p className="text-gray-900">{profile.apellidos}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p className="text-gray-900">{profile.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar con información adicional */}
        <div className="space-y-6">
          {/* Estado de la Cuenta */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Estado de la Cuenta</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Rol</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.role?.name === 'admin' 
                    ? 'bg-primary-100 text-primary-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.role?.name || 'Sin rol'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Estado</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.activo 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {profile.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Aprobación</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.approved 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-warning-100 text-warning-800'
                }`}>
                  {profile.approved ? 'Aprobado' : 'Pendiente'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">Miembro desde</span>
                <span className="text-sm text-gray-900">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Información de Seguridad */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Autenticación de dos factores</p>
                  <p className="text-xs text-gray-500">Recomendado para mayor seguridad</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Sesión activa</p>
                  <p className="text-xs text-gray-500">Tu sesión está segura</p>
                </div>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Acciones</h3>
            </div>
            <div className="card-body space-y-3">
              <button className="w-full btn btn-outline flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span>Cambiar Contraseña</span>
              </button>

              <button className="w-full btn btn-outline flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil;

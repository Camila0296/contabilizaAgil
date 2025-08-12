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

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [roles, setRoles] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    role: '',
    activo: true,
    approved: false
  });

  useEffect(() => {
    fetchUsuarios();
    fetchRoles();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const res = await apiFetch('/users');
      const data = await res.json();
      setUsuarios(data);
    } catch {
      showError('No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await apiFetch('/roles');
      const data = await res.json();
      setRoles(data);
    } catch {
      showError('No se pudieron cargar los roles');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const openModal = (usuario?: User) => {
    if (usuario) {
      setEditing(usuario);
      setForm({
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        email: usuario.email,
        role: usuario.role._id,
        activo: usuario.activo,
        approved: usuario.approved
      });
    } else {
      setEditing(null);
      setForm({
        nombres: '',
        apellidos: '',
        email: '',
        role: '',
        activo: true,
        approved: false
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/users/${editing._id}` : '/users';
      
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        showSuccess(editing ? 'Usuario actualizado' : 'Usuario creado');
        closeModal();
        fetchUsuarios();
      } else {
        const data = await res.json();
        showError(data.error || 'Error al guardar usuario');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleToggleStatus = async (id: string, field: 'activo' | 'approved') => {
    try {
      const usuario = usuarios.find(u => u._id === id);
      if (!usuario) return;

      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [field]: !usuario[field]
        })
      });

      if (res.ok) {
        showSuccess(`Usuario ${field === 'activo' ? 'activado/desactivado' : 'aprobado/rechazado'}`);
        fetchUsuarios();
      } else {
        showError('Error al actualizar usuario');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    try {
      const res = await apiFetch(`/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Usuario eliminado');
        setUsuarios(usuarios.filter(u => u._id !== id));
      } else {
        showError('No se pudo eliminar el usuario');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-1">Administra usuarios y permisos del sistema</p>
        </div>
        <button 
          className="btn btn-primary flex items-center space-x-2"
          onClick={() => openModal()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-success-600">
                  {usuarios.filter(u => u.activo).length}
                </p>
              </div>
              <div className="p-3 bg-success-100 rounded-lg">
                <svg className="w-6 h-6 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pendientes de Aprobación</p>
                <p className="text-2xl font-bold text-warning-600">
                  {usuarios.filter(u => !u.approved).length}
                </p>
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
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold text-primary-600">
                  {usuarios.filter(u => u.role.name === 'admin').length}
                </p>
              </div>
              <div className="p-3 bg-primary-100 rounded-lg">
                <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <th>Rol</th>
              <th>Estado</th>
                <th>Aprobación</th>
                <th>Fecha Registro</th>
                <th className="w-40">Acciones</th>
            </tr>
          </thead>
            <tbody className="table-body">
            {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-500">Cargando usuarios...</span>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      <p className="text-lg font-medium">No hay usuarios registrados</p>
                      <p className="text-sm">Comienza creando el primer usuario</p>
                    </div>
                  </td>
                </tr>
            ) : (
                usuarios.map(usuario => (
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
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        usuario.activo 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-danger-100 text-danger-800'
                      }`}>
                        {usuario.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        usuario.approved 
                          ? 'bg-success-100 text-success-800' 
                          : 'bg-warning-100 text-warning-800'
                      }`}>
                        {usuario.approved ? 'Aprobado' : 'Pendiente'}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-gray-500">
                      {new Date(usuario.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                          title="Editar"
                          onClick={() => openModal(usuario)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          className={`p-2 rounded-lg transition-colors duration-200 ${
                            usuario.activo 
                              ? 'text-warning-600 hover:bg-warning-100' 
                              : 'text-success-600 hover:bg-success-100'
                          }`}
                          title={usuario.activo ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleStatus(usuario._id, 'activo')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {usuario.activo ? (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                            ) : (
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            )}
                          </svg>
                        </button>

                        {!usuario.approved && (
                          <button
                            className="p-2 text-success-600 hover:bg-success-100 rounded-lg transition-colors duration-200"
                            title="Aprobar"
                            onClick={() => handleToggleStatus(usuario._id, 'approved')}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}

                        <button
                          className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors duration-200"
                          title="Eliminar"
                          onClick={() => handleDelete(usuario._id)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full">
              <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  onClick={closeModal}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>

              {/* Body */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombres */}
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

                  {/* Apellidos */}
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

                  {/* Email */}
                  <div className="form-group md:col-span-2">
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

                  {/* Rol */}
                  <div className="form-group">
                    <label className="form-label">Rol</label>
                    <select
                      className="form-select"
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar rol</option>
                      {roles.map(role => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Estado */}
                  <div className="form-group">
                    <label className="form-label">Estado</label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          name="activo"
                          checked={form.activo}
                          onChange={handleChange}
                        />
                        <span className="ml-2 text-sm text-gray-700">Activo</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                          name="approved"
                          checked={form.approved}
                          onChange={handleChange}
                        />
                        <span className="ml-2 text-sm text-gray-700">Aprobado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                >
                  {editing ? 'Actualizar Usuario' : 'Crear Usuario'}
                </button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;

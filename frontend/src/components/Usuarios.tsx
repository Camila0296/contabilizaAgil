import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { apiFetch } from '../api';
import Select from 'react-select';
import { showError, showSuccess } from '../utils/alerts';

interface Usuario {
  _id?: string;
  nombres: string;
  apellidos: string;
  email: string;
  password?: string;
  role: string; // 'admin' | 'user'
}

const initialForm: Usuario = {
  nombres: '',
  apellidos: '',
  email: '',
  password: '',
  role: 'user'
};

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'user', label: 'Usuario' }
];

const Usuarios: React.FC = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [showActivos, setShowActivos] = useState<'true' | 'false' | 'all'>('true');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Usuario>(initialForm);
  const [editing, setEditing] = useState<Usuario | null>(null);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let queryParams: string[] = [];
      if (showActivos !== 'all') queryParams.push(`activo=${showActivos}`);
      if (search.trim() !== '') queryParams.push(`search=${encodeURIComponent(search.trim())}`);
      const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';
      const res = await apiFetch(`/users${queryStr}`);
      const data = await res.json();
      // Convierte role object a nombre string
      const normalized = data.map((u: any) => ({ ...u, role: u.role?.name || u.role }));
      setUsers(normalized);
    } catch {
      showError('No se pudieron cargar los usuarios');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [showActivos, search]);

  const openModal = (user?: Usuario) => {
    if (user) {
      setEditing(user);
      setForm({ ...user, password: '', role: (user.role as any).name || (user.role as any) });
    } else {
      setEditing(null);
      setForm(initialForm);
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(initialForm);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (option: any) => {
    setForm(prev => ({ ...prev, role: option ? option.value : 'user' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.nombres || !form.apellidos || !form.email || (!editing && !form.password)) {
      setError('Completa los campos obligatorios.');
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/users/${editing._id}` : '/users';
      const payload = { ...form } as any;
      if (editing && !payload.password) delete payload.password; // No cambiar si está vacío
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        showSuccess(editing ? 'Usuario actualizado' : 'Usuario creado');
        closeModal();
        fetchUsers();
      } else {
        const data = await res.json();
        showError(data.error || 'No se pudo guardar');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const confirmAction = async (title: string, text: string, icon: 'warning' | 'question') => {
    const result = await Swal.fire({ title, text, icon, showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'Cancelar' });
    return result.isConfirmed;
  };

  const handleActivate = async (id: string) => {
    try {
      const ok = await confirmAction('Reactivar usuario', '¿Activar nuevamente este usuario?', 'question');
      if (!ok) return;
      const res = await apiFetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: true })
      });
      if (res.ok) {
        showSuccess('Usuario reactivado');
        fetchUsers();
      } else {
        showError('No se pudo activar');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  const handleDelete = async (id: string) => {
    const ok = await confirmAction('Deshabilitar usuario', '¿Estás seguro de deshabilitar este usuario?', 'warning');
    if (!ok) return;
    try {
      const res = await apiFetch(`/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Usuario eliminado');
        fetchUsers();
      } else {
        showError('No se pudo eliminar');
      }
    } catch {
      showError('Error de conexión');
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4" style={{ color: 'var(--primary)' }}>Usuarios</h3>
      <div className="d-flex flex-wrap mb-3 align-items-center gap-2">
        <button className="btn btn-success" onClick={() => openModal()}>+ Agregar usuario</button>
        <select className="form-select w-auto" value={showActivos} onChange={e => setShowActivos(e.target.value as any)}>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
          <option value="all">Todos</option>
        </select>
        <input placeholder="Buscar nombre o email" className="form-control w-auto" style={{ minWidth: 200 }} value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="table-responsive">
        <table className="table table-hover modern-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th style={{ width: 120 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center">Cargando...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="text-center">No hay usuarios</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td>{user.nombres}</td>
                  <td>{user.apellidos}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{(user as any).activo === false ? 'Inactivo' : 'Activo'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openModal(user)}>✏️</button>
                    {(user as any).activo === false ? (
                      <button className="btn btn-sm btn-outline-success" title="Reactivar" onClick={() => handleActivate(user._id!)}>✔️</button>
                    ) : (
                      <button className="btn btn-sm btn-outline-warning" title="Deshabilitar" onClick={() => handleDelete(user._id!)}>🚫</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Editar usuario' : 'Agregar usuario'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label">Nombres</label>
                    <input className="form-control" name="nombres" value={form.nombres} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input className="form-control" name="apellidos" value={form.apellidos} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" name="email" value={form.email} onChange={handleChange} required />
                  </div>
                  {!editing && (
                    <div className="mb-3">
                      <label className="form-label">Contraseña</label>
                      <input type="password" className="form-control" name="password" value={form.password} onChange={handleChange} required />
                    </div>) }
                  <div className="mb-3">
                    <label className="form-label">Rol</label>
                    <Select options={roleOptions} value={roleOptions.find(o => o.value === form.role)} onChange={handleRoleChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Crear'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;

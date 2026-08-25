import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { showSuccess, showError } from '../utils/alerts';

interface Tercero {
  _id?: string;
  tipo: 'cliente' | 'proveedor' | 'ambos';
  razonSocial: string;
  tipoDocumento: 'CC' | 'NIT' | 'CE' | 'PASAPORTE';
  numeroDocumento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  ciudad?: string;
  contacto?: string;
  activo?: boolean;
}

const initialForm: Tercero = {
  tipo: 'cliente',
  razonSocial: '',
  tipoDocumento: 'NIT',
  numeroDocumento: '',
  email: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  contacto: '',
  activo: true
};

const Terceros: React.FC = () => {
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [form, setForm] = useState<Tercero>(initialForm);
  const [editing, setEditing] = useState<Tercero | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const isAdmin = localStorage.getItem('roles') ? JSON.parse(localStorage.getItem('roles') || '[]').includes('admin') : false;

  useEffect(() => {
    fetchTerceros();
  }, []);

  const fetchTerceros = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/terceros');
      const response = await res.json();
      setTerceros(response.data || response);
    } catch {
      showError('No se pudieron cargar los terceros');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (tercero?: Tercero) => {
    if (tercero) {
      setEditing(tercero);
      setForm(tercero);
    } else {
      setEditing(null);
      setForm(initialForm);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(initialForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/terceros/${editing._id}` : '/terceros';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showSuccess(editing ? 'Tercero actualizado' : 'Tercero creado');
        closeModal();
        fetchTerceros();
      } else {
        showError('No se pudo guardar el tercero');
      }
    } catch {
      showError('Error de conexión al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/terceros/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Tercero deshabilitado');
        setTerceros(terceros.filter(t => t._id !== id));
      } else {
        showError('No se pudo desabilitar el tercero');
      }
    } catch {
      showError('Error de conexión al desabilitar');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Terceros</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Administra clientes y proveedores</p>
        </div>
        <button
          className="w-full md:w-auto btn btn-primary flex items-center justify-center space-x-2 py-2.5 px-4"
          onClick={() => openModal()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nuevo Tercero</span>
        </button>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Razón Social</th>
                <th className="hidden sm:table-cell">Tipo Documento</th>
                <th>Documento</th>
                <th className="hidden md:table-cell">Email</th>
                <th className="hidden lg:table-cell">Teléfono</th>
                <th className="w-24">Acciones</th>
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
                      <span className="text-gray-500">Cargando terceros...</span>
                    </div>
                  </td>
                </tr>
              ) : terceros.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No hay terceros registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                terceros.map(tercero => (
                  <tr key={tercero._id} className="table-row">
                    <td className="table-cell font-medium">{tercero.razonSocial}</td>
                    <td className="table-cell hidden sm:table-cell text-sm">{tercero.tipoDocumento}</td>
                    <td className="table-cell">{tercero.numeroDocumento}</td>
                    <td className="table-cell hidden md:table-cell text-sm text-gray-500">{tercero.email}</td>
                    <td className="table-cell hidden lg:table-cell text-sm text-gray-500">{tercero.telefono}</td>
                    <td className="table-cell text-right space-x-2">
                      {isAdmin && (
                        <>
                          <button
                            className="text-primary-600 hover:text-primary-900 p-1"
                            onClick={() => openModal(tercero)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="text-danger-600 hover:text-danger-900 p-1"
                            onClick={() => handleDelete(tercero._id!)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editing ? 'Editar Tercero' : 'Nuevo Tercero'}
                </h2>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  onClick={closeModal}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label">Tipo</label>
                    <select className="form-select" name="tipo" value={form.tipo} onChange={handleChange} required>
                      <option value="cliente">Cliente</option>
                      <option value="proveedor">Proveedor</option>
                      <option value="ambos">Ambos</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Razón Social</label>
                    <input
                      type="text"
                      className="form-input"
                      name="razonSocial"
                      value={form.razonSocial}
                      onChange={handleChange}
                      required
                      placeholder="Nombre de la empresa"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tipo Documento</label>
                    <select className="form-select" name="tipoDocumento" value={form.tipoDocumento} onChange={handleChange} required>
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="NIT">NIT</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="PASAPORTE">Pasaporte</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Número Documento</label>
                    <input
                      type="text"
                      className="form-input"
                      name="numeroDocumento"
                      value={form.numeroDocumento}
                      onChange={handleChange}
                      required
                      placeholder="Número único"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="correo@empresa.com"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-input"
                      name="telefono"
                      value={form.telefono}
                      onChange={handleChange}
                      placeholder="+57..."
                    />
                  </div>

                  <div className="form-group md:col-span-2">
                    <label className="form-label">Dirección</label>
                    <input
                      type="text"
                      className="form-input"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleChange}
                      placeholder="Calle y número"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Ciudad</label>
                    <input
                      type="text"
                      className="form-input"
                      name="ciudad"
                      value={form.ciudad}
                      onChange={handleChange}
                      placeholder="Ciudad"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Contacto</label>
                    <input
                      type="text"
                      className="form-input"
                      name="contacto"
                      value={form.contacto}
                      onChange={handleChange}
                      placeholder="Nombre del contacto"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button type="button" className="btn btn-outline" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  {editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Terceros;

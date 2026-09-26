import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import Paginacion, { PaginationInfo, PAGE_SIZE } from './Paginacion';
import { showSuccess, showError } from '../utils/alerts';
import { hasRole, ROLES_CATALOGO } from '../utils/session';

interface Puc {
  _id?: string;
  codigo: string;
  nombre: string;
  naturaleza: 'debito' | 'credito';
  activo?: boolean;
}

const initialForm: Puc = {
  codigo: '',
  nombre: '',
  naturaleza: 'debito',
  activo: true
};

const Puc: React.FC = () => {
  const [pucs, setPucs] = useState<Puc[]>([]);
  const [form, setForm] = useState<Puc>(initialForm);
  const [editing, setEditing] = useState<Puc | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const canManage = hasRole(...ROLES_CATALOGO);

  useEffect(() => {
    fetchPucs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchPucs = async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/puc?page=${page}&limit=${PAGE_SIZE}`);
      const response = await res.json();
      setPucs(response.data || response);
      setPagination(response.pagination || null);
      // Si se eliminó el último registro de la página, volver a la anterior
      if (Array.isArray(response.data) && response.data.length === 0 && page > 1) setPage(page - 1);
    } catch {
      showError('No se pudieron cargar las cuentas PUC');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openModal = (puc?: Puc) => {
    if (puc) {
      setEditing(puc);
      setForm(puc);
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
      const url = editing ? `/puc/${editing._id}` : '/puc';
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        showSuccess(editing ? 'Cuenta actualizada' : 'Cuenta creada');
        closeModal();
        fetchPucs();
      } else {
        const data = await res.json().catch(() => ({}));
        showError(data.error || 'No se pudo guardar la cuenta');
      }
    } catch {
      showError('Error de conexión al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/puc/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Cuenta deshabilitada');
        setPucs(pucs.filter(p => p._id !== id));
      } else {
        showError('No se pudo desabilitar la cuenta');
      }
    } catch {
      showError('Error de conexión al desabilitar');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Plan Único de Cuentas</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Administra el catálogo de cuentas contables</p>
        </div>
        {canManage && (
          <button
            className="w-full md:w-auto btn btn-primary flex items-center justify-center space-x-2 py-2.5 px-4"
            onClick={() => openModal()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Cuenta</span>
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th className="hidden md:table-cell">Naturaleza</th>
                <th className="w-24">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-500">Cargando cuentas...</span>
                    </div>
                  </td>
                </tr>
              ) : pucs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No hay cuentas registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pucs.map(puc => (
                  <tr key={puc._id} className="table-row">
                    <td className="table-cell font-mono font-semibold">{puc.codigo}</td>
                    <td className="table-cell">{puc.nombre}</td>
                    <td className="table-cell hidden md:table-cell">
                      <span className={puc.naturaleza === 'debito' ? 'text-blue-600' : 'text-red-600'}>
                        {puc.naturaleza === 'debito' ? 'Débito' : 'Crédito'}
                      </span>
                    </td>
                    <td className="table-cell text-right space-x-2">
                      {canManage && (
                        <>
                          <button
                            className="text-primary-600 hover:text-primary-900 p-1"
                            aria-label="Editar"
                            onClick={() => openModal(puc)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            className="text-danger-600 hover:text-danger-900 p-1"
                            aria-label="Deshabilitar"
                            onClick={() => handleDelete(puc._id!)}
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
        <Paginacion pagination={pagination} onPageChange={setPage} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-md w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editing ? 'Editar Cuenta' : 'Nueva Cuenta'}
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
                <div className="space-y-6">
                  <div className="form-group">
                    <label className="form-label">Código</label>
                    <input
                      type="text"
                      className="form-input font-mono"
                      name="codigo"
                      value={form.codigo}
                      onChange={handleChange}
                      required
                      placeholder="5110"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-input"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      required
                      placeholder="Descripción de la cuenta"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Naturaleza</label>
                    <select className="form-select" name="naturaleza" value={form.naturaleza} onChange={handleChange} required>
                      <option value="debito">Débito</option>
                      <option value="credito">Crédito</option>
                    </select>
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

export default Puc;

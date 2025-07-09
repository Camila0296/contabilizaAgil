import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api';
import { formatCurrency } from '../utils/format';
import { showSuccess, showError } from '../utils/alerts';
import Select from 'react-select';
import { retefuenteOptions, icaOptions } from '../data/withholdingOptions';
import pucAccounts from '../data/pucAccounts';

interface Factura {
  retefuentePct: number;
  icaPct: number;
  _id?: string;
  numero: string;
  fecha: string;
  proveedor: string;
  monto: number;
  puc: string;
  detalle: string;
  naturaleza: 'credito' | 'debito';
  impuestos: {
    iva: number;
    retefuente: number;
    retefuentePct?: number;
    icaPct?: number;
    ica: number;
  };
  usuario?: any;
}

interface FacturasProps {
  userId: string | null;
}

const initialForm: Factura = {
  numero: '',
  fecha: '',
  proveedor: '',
  monto: 0,
  puc: '',
  detalle: '',
  naturaleza: 'debito',
  retefuentePct: 0,
  icaPct: 0,
  impuestos: {
    iva: 0,
    retefuente: 0,
    ica: 0,
  },
};

const Facturas: React.FC<FacturasProps> = ({ userId }) => {
  // Opciones para react-select
  const pucOptions = useMemo(
    () => pucAccounts.map(acc => ({ value: acc.codigo, label: `${acc.codigo} - ${acc.nombre}` })),
    []
  );

  const getPucLabel = (codigo: string) => {
    const acc = pucAccounts.find(a => a.codigo === codigo);
    return acc ? `${acc.codigo} - ${acc.nombre}` : codigo;
  };

  const toInputDate = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [form, setForm] = useState<Factura>(initialForm);
  const [editing, setEditing] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchFacturas();
  }, []);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/facturas');
      const data = await res.json();
      setFacturas(data);
    } catch {
      showError('No se pudieron cargar las facturas');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('impuestos.')) {
      const impuesto = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        impuestos: { ...prev.impuestos, [impuesto]: Number(value) }
      }));
    } else if (name === 'monto') {
      const num = Number(value);
      setForm(prev => {
        const retefuenteVal = +(num * (prev.retefuentePct || 0) / 100).toFixed(2);
        const icaVal = +(num * (prev.icaPct || 0) / 100).toFixed(2);
        return {
          ...prev,
          monto: num,
          impuestos: { ...prev.impuestos, iva: +(num * 0.19).toFixed(2), retefuente: retefuenteVal, ica: icaVal }
        };
      });
    } else if (name === 'retefuentePct' || name === 'icaPct') {
      const pct = Number(value);
      setForm(prev => {
        const retefuenteVal = name === 'retefuentePct' ? +(prev.monto * pct / 100).toFixed(2) : +(prev.monto * (prev.retefuentePct || 0) / 100).toFixed(2);
        const icaVal = name === 'icaPct' ? +(prev.monto * pct / 100).toFixed(2) : +(prev.monto * (prev.icaPct || 0) / 100).toFixed(2);
        return {
          ...prev,
          [name]: pct,
          impuestos: { ...prev.impuestos, retefuente: retefuenteVal, ica: icaVal }
        };
      });
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (factura?: Factura) => {
    if (factura) {
      setEditing(factura);
      setForm({ ...factura, fecha: toInputDate(factura.fecha) });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.numero || !form.fecha || !form.proveedor || !form.monto || !form.puc || !form.detalle) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!userId) {
      setError('No se ha identificado el usuario.');
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/facturas/${editing._id}` : '/facturas';
      const facturaData = editing
        ? { ...form }
        : { ...form, usuario: userId };
      const res = await apiFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facturaData)
      });
      if (res.ok) {
        showSuccess(editing ? 'Factura actualizada' : 'Factura creada');
        closeModal();
        fetchFacturas();
      } else {
        showError('No se pudo guardar la factura');
      }
    } catch {
      showError('Error de conexión al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await apiFetch(`/facturas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Factura eliminada');
        setFacturas(facturas.filter(f => f._id !== id));
      } else {
        showError('No se pudo eliminar la factura');
      }
    } catch {
      showError('Error de conexión al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600 mt-1">Administra tus facturas y documentos contables</p>
        </div>
        <button 
          className="btn btn-primary flex items-center space-x-2"
          onClick={() => openModal()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nueva Factura</span>
        </button>
      </div>

      {/* Tabla */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Número</th>
                <th>Fecha</th>
                <th>Proveedor</th>
                <th>PUC</th>
                <th>Monto</th>
                <th>ReteFte</th>
                <th>ICA</th>
                <th className="w-32">Acciones</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-5 w-5 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-gray-500">Cargando facturas...</span>
                    </div>
                  </td>
                </tr>
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <div className="text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No hay facturas registradas</p>
                      <p className="text-sm">Comienza creando tu primera factura</p>
                    </div>
                  </td>
                </tr>
              ) : (
                facturas.map(factura => (
                  <tr key={factura._id} className="table-row">
                    <td className="table-cell font-medium">{factura.numero}</td>
                    <td className="table-cell">{new Date(factura.fecha).toLocaleDateString()}</td>
                    <td className="table-cell">{factura.proveedor}</td>
                    <td className="table-cell text-sm text-gray-600">{getPucLabel(factura.puc)}</td>
                    <td className="table-cell font-semibold">{formatCurrency(factura.monto)}</td>
                    <td className="table-cell text-sm">
                      {formatCurrency(factura.impuestos.retefuente)}
                      <span className="text-gray-500 ml-1">({(factura.retefuentePct || 0).toFixed(2)}%)</span>
                    </td>
                    <td className="table-cell text-sm">
                      {formatCurrency(factura.impuestos.ica)}
                      <span className="text-gray-500 ml-1">({(factura.icaPct || 0).toFixed(3)}%)</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors duration-200"
                          title="Editar"
                          onClick={() => openModal(factura)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="p-2 text-danger-600 hover:bg-danger-100 rounded-lg transition-colors duration-200"
                          title="Eliminar"
                          onClick={() => handleDelete(factura._id!)}
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
          <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editing ? 'Editar Factura' : 'Nueva Factura'}
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
                {error && (
                  <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-danger-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="ml-3 text-sm text-danger-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Número */}
                  <div className="form-group">
                    <label className="form-label">Número de Factura</label>
                    <input
                      type="text"
                      className="form-input"
                      name="numero"
                      value={form.numero}
                      onChange={handleChange}
                      required
                      placeholder="F-2024-001"
                    />
                  </div>

                  {/* Fecha */}
                  <div className="form-group">
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      className="form-input"
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* Proveedor */}
                  <div className="form-group">
                    <label className="form-label">Proveedor</label>
                    <input
                      type="text"
                      className="form-input"
                      name="proveedor"
                      value={form.proveedor}
                      onChange={handleChange}
                      required
                      placeholder="Nombre del proveedor"
                    />
                  </div>

                  {/* Monto */}
                  <div className="form-group">
                    <label className="form-label">Monto</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        className="form-input pl-7"
                        name="monto"
                        value={form.monto}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* PUC */}
                  <div className="form-group">
                    <label className="form-label">Cuenta PUC</label>
                                         <Select
                       classNamePrefix="react-select"
                       options={pucOptions}
                       placeholder="Seleccione cuenta..."
                       value={pucOptions.find(o => o.value === form.puc) || null}
                       onChange={option =>
                         setForm(prev => ({ ...prev, puc: option ? option.value : '' }))
                       }
                       isClearable
                       className="react-select-container"
                     />
                  </div>

                  {/* Naturaleza */}
                  <div className="form-group">
                    <label className="form-label">Naturaleza</label>
                    <select
                      className="form-select"
                      name="naturaleza"
                      value={form.naturaleza}
                      onChange={handleChange}
                      required
                    >
                      <option value="debito">Débito</option>
                      <option value="credito">Crédito</option>
                    </select>
                  </div>

                  {/* Detalle */}
                  <div className="form-group md:col-span-2 lg:col-span-3">
                    <label className="form-label">Detalle</label>
                    <input
                      type="text"
                      className="form-input"
                      name="detalle"
                      value={form.detalle}
                      onChange={handleChange}
                      required
                      placeholder="Descripción del gasto o ingreso"
                    />
                  </div>

                  {/* Impuestos */}
                  <div className="form-group">
                    <label className="form-label">IVA (19%)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        className="form-input pl-7 bg-gray-50"
                        value={formatCurrency(form.impuestos.iva)}
                        readOnly
                      />
                    </div>
                  </div>

                  {/* ReteFuente */}
                  <div className="form-group">
                    <label className="form-label">ReteFuente %</label>
                    <select
                      className="form-select"
                      name="retefuentePct"
                      value={form.retefuentePct}
                      onChange={handleChange}
                    >
                      {retefuenteOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Valor: {formatCurrency(form.impuestos.retefuente)}
                    </p>
                  </div>

                  {/* ICA */}
                  <div className="form-group">
                    <label className="form-label">ICA %</label>
                    <select
                      className="form-select"
                      name="icaPct"
                      value={form.icaPct}
                      onChange={handleChange}
                    >
                      {icaOptions.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Valor: {formatCurrency(form.impuestos.ica)}
                    </p>
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
                  {editing ? 'Actualizar Factura' : 'Crear Factura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;
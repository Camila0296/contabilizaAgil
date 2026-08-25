import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api';
import { formatCurrency } from '../utils/format';
import { showSuccess, showError } from '../utils/alerts';
import Select from 'react-select';
import { retefuenteOptions, icaOptions } from '../data/withholdingOptions';

interface FacturaCartera {
  _id?: string;
  tipo?: 'factura' | 'creditNote' | 'debitNote';
  numeroDocumento?: string;
  consecutivo?: number;
  fecha: string;
  tercero: any;
  monto: number;
  puc: any;
  detalle: string;
  naturaleza: 'credito' | 'debito';
  retefuentePct?: number;
  icaPct?: number;
  impuestos: {
    iva: number;
    retefuente: number;
    ica: number;
  };
  usuario?: any;
}

interface Tercero {
  _id: string;
  razonSocial: string;
}

interface Puc {
  _id: string;
  codigo: string;
  nombre: string;
}

const initialForm: FacturaCartera = {
  tipo: 'factura',
  fecha: '',
  tercero: '',
  monto: 0,
  puc: '',
  detalle: '',
  naturaleza: 'debito',
  retefuentePct: 0,
  icaPct: 0,
  impuestos: {
    iva: 0,
    retefuente: 0,
    ica: 0
  }
};

interface FacturaCarteraProps {
  userId: string | null;
}

const FacturaCartera: React.FC<FacturaCarteraProps> = ({ userId }) => {
  const [facturas, setFacturas] = useState<FacturaCartera[]>([]);
  const [terceros, setTerceros] = useState<Tercero[]>([]);
  const [pucs, setPucs] = useState<Puc[]>([]);
  const [form, setForm] = useState<FacturaCartera>(initialForm);
  const [editing, setEditing] = useState<FacturaCartera | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const terceroOptions = useMemo(
    () => terceros.map(t => ({ value: t._id, label: t.razonSocial })),
    [terceros]
  );

  const pucOptions = useMemo(
    () => pucs.map(p => ({ value: p._id, label: `${p.codigo} - ${p.nombre}` })),
    [pucs]
  );

  const getPucLabel = (pucId: string) => {
    const puc = pucs.find(p => p._id === pucId);
    return puc ? `${puc.codigo} - ${puc.nombre}` : pucId;
  };

  const toInputDate = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchFacturas();
    fetchTerceros();
    fetchPucs();
  }, []);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/facturas-cartera');
      const data = await res.json();
      setFacturas(data);
    } catch {
      showError('No se pudieron cargar las facturas');
    }
    setLoading(false);
  };

  const fetchTerceros = async () => {
    try {
      const res = await apiFetch('/terceros?tipo=cliente');
      const data = await res.json();
      setTerceros(data);
    } catch {
      showError('No se pudieron cargar los terceros');
    }
  };

  const fetchPucs = async () => {
    try {
      const res = await apiFetch('/puc');
      const data = await res.json();
      setPucs(data);
    } catch {
      showError('No se pudieron cargar las cuentas PUC');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const openModal = (factura?: FacturaCartera) => {
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
    if (!form.fecha || !form.tercero || !form.monto || !form.puc || !form.detalle) {
      setError('Por favor completa todos los campos obligatorios.');
      return;
    }
    if (!userId && !editing) {
      setError('No se ha identificado el usuario.');
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/facturas-cartera/${editing._id}` : '/facturas-cartera';
      const { numeroDocumento, consecutivo, ...formData } = form;
      const facturaData = editing
        ? formData
        : { ...formData, usuario: userId };
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
      const res = await apiFetch(`/facturas-cartera/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Factura anulada');
        setFacturas(facturas.filter(f => f._id !== id));
      } else {
        showError('No se pudo anular la factura');
      }
    } catch {
      showError('Error de conexión al anular');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-24 pb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Facturación de Cartera</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Administra ventas y genera facturas para clientes</p>
        </div>
        {userId && (
          <button
            className="w-full md:w-auto btn btn-primary flex items-center justify-center space-x-2 py-2.5 px-4"
            onClick={() => openModal()}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Nueva Factura</span>
          </button>
        )}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th>Número</th>
                <th className="hidden sm:table-cell">Tipo</th>
                <th className="hidden sm:table-cell">Fecha</th>
                <th>Cliente</th>
                <th className="hidden lg:table-cell">PUC</th>
                <th className="text-right">Monto</th>
                <th className="w-24">Acciones</th>
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
                      <span className="text-gray-500">Cargando facturas...</span>
                    </div>
                  </td>
                </tr>
              ) : facturas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">No hay facturas registradas</p>
                    </div>
                  </td>
                </tr>
              ) : (
                facturas.map(factura => {
                  const tipoLabel = factura.tipo === 'creditNote' ? 'NC' : factura.tipo === 'debitNote' ? 'ND' : 'FC';
                  const tipoText = factura.tipo === 'creditNote' ? 'Nota Crédito' : factura.tipo === 'debitNote' ? 'Nota Débito' : 'Factura';
                  return (
                    <tr key={factura._id} className="table-row">
                      <td className="table-cell font-mono font-medium">{factura.numeroDocumento}</td>
                      <td className="table-cell hidden sm:table-cell text-xs">
                        <span className={`inline-block px-2 py-1 rounded ${
                          factura.tipo === 'creditNote' ? 'bg-blue-100 text-blue-700' :
                          factura.tipo === 'debitNote' ? 'bg-red-100 text-red-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {tipoText}
                        </span>
                      </td>
                      <td className="table-cell hidden sm:table-cell text-sm">
                        {new Date(factura.fecha).toLocaleDateString()}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm font-medium">{factura.tercero?.razonSocial}</div>
                        <div className="text-xs text-gray-500 lg:hidden">
                          {getPucLabel(factura.puc?._id || factura.puc)}
                        </div>
                      </td>
                      <td className="table-cell hidden lg:table-cell text-sm text-gray-500">
                        <div className="truncate max-w-[200px]">
                          {getPucLabel(factura.puc?._id || factura.puc)}
                        </div>
                      </td>
                      <td className="table-cell text-right font-semibold">
                        {formatCurrency(factura.monto)}
                      </td>
                      <td className="table-cell text-right space-x-2">
                        <button
                          className="text-primary-600 hover:text-primary-900 p-1"
                          onClick={() => openModal(factura)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          className="text-danger-600 hover:text-danger-900 p-1"
                          onClick={() => handleDelete(factura._id!)}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit}>
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editing ? 'Editar Factura' : 'Nueva Factura'}
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
                  {editing && (
                    <div className="form-group">
                      <label className="form-label">Número</label>
                      <input
                        type="text"
                        className="form-input bg-gray-50"
                        value={form.numeroDocumento || ''}
                        readOnly
                      />
                      <p className="text-xs text-gray-500 mt-1">(Generado automáticamente)</p>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Tipo de Documento</label>
                    <select
                      className="form-select"
                      name="tipo"
                      value={form.tipo || 'factura'}
                      onChange={handleChange}
                      required
                      disabled={!!editing}
                    >
                      <option value="factura">Factura</option>
                      <option value="creditNote">Nota de Crédito</option>
                      <option value="debitNote">Nota de Débito</option>
                    </select>
                  </div>

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

                  <div className="form-group">
                    <label className="form-label">Cliente</label>
                    <Select
                      classNamePrefix="react-select"
                      options={terceroOptions}
                      placeholder="Seleccione cliente..."
                      value={terceroOptions.find(o => o.value === form.tercero) || null}
                      onChange={option =>
                        setForm(prev => ({ ...prev, tercero: option ? option.value : '' }))
                      }
                      isClearable
                      className="react-select-container"
                    />
                  </div>

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

                  <div className="form-group md:col-span-2 lg:col-span-3">
                    <label className="form-label">Detalle</label>
                    <textarea
                      className="form-input"
                      name="detalle"
                      value={form.detalle}
                      onChange={handleChange}
                      required
                      placeholder="Descripción de la venta"
                      rows={2}
                    />
                  </div>

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

export default FacturaCartera;

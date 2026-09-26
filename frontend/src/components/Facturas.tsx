import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api';
import { formatCurrency, formatFecha } from '../utils/format';
import { showSuccess, showError } from '../utils/alerts';
import { hasRole, ROLES_GESTION } from '../utils/session';
import Select from 'react-select';
import { retefuenteOptions, icaOptions } from '../data/withholdingOptions';
import { getRecommendedRetention, retentionGuide } from '../data/retentionGuide';
import pucAccounts from '../data/pucAccounts';
import {
  validateNumeroFactura,
  validateFecha,
  validateProveedor,
  validateAmount,
  validatePuc,
  validateDetalle,
  validatePercentage,
  ValidationError,
  hasFieldError,
  getFieldError
} from '../utils/validation';

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
    totalAPagar: number;
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
    totalAPagar: 0,
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
  // El auxiliar solo crea facturas; editar/eliminar es para roles de gestión
  const canManage = hasRole(...ROLES_GESTION);
  const [form, setForm] = useState<Factura>(initialForm);
  const [editing, setEditing] = useState<Factura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [touched, setTouched] = useState({
    numero: false,
    fecha: false,
    proveedor: false,
    monto: false,
    puc: false,
    detalle: false,
    retefuentePct: false,
    icaPct: false
  });
  const [showModal, setShowModal] = useState(false);
  const [showRetentionGuide, setShowRetentionGuide] = useState(false);
  const [nextConsecutivo, setNextConsecutivo] = useState<string>('');
  const [consecutivoAvailable, setConsecutivoAvailable] = useState<boolean | null>(null);
  const [consecutivoMessage, setConsecutivoMessage] = useState<string>('');

  useEffect(() => {
    fetchFacturas();
    fetchNextConsecutivo();
  }, []);

  const fetchNextConsecutivo = async () => {
    try {
      const res = await apiFetch('/facturas/siguiente/consecutivo');
      const data = await res.json();
      setNextConsecutivo(data.nextSuggested || 'FAC-2026-001');
    } catch (error) {
      console.error('Error obteniendo siguiente consecutivo:', error);
      const year = new Date().getFullYear();
      setNextConsecutivo(`FAC-${year}-001`);
    }
  };

  const checkConsecutivoAvailability = async (numero: string) => {
    if (!numero) {
      setConsecutivoAvailable(null);
      setConsecutivoMessage('');
      return;
    }

    try {
      const res = await apiFetch(`/facturas/verificar/disponibilidad?numero=${encodeURIComponent(numero)}`);
      const data = await res.json();

      setConsecutivoAvailable(data.available);
      setConsecutivoMessage(data.message);
    } catch (error) {
      console.error('Error verificando consecutivo:', error);
      setConsecutivoAvailable(false);
      setConsecutivoMessage('Error al verificar disponibilidad');
    }
  };

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      // El backend pagina de a 10 por defecto; se piden hasta 100 (su máximo)
      const res = await apiFetch('/facturas?limit=100');
      const response = await res.json();
      setFacturas(response.data || response);
    } catch {
      showError('No se pudieron cargar las facturas');
    }
    setLoading(false);
  };

  const calcularImpuestosConTotal = (monto: number, retefuentePct: number, icaPct: number) => {
    const iva = +(monto * 0.19).toFixed(2);
    const retefuente = +(monto * (retefuentePct || 0) / 100).toFixed(2);
    const ica = +(monto * (icaPct || 0) / 100).toFixed(2);
    const totalAPagar = +(monto + iva - retefuente - ica).toFixed(2);
    return { iva, retefuente, ica, totalAPagar };
  };

  const validateField = (name: string, value: any) => {
    const newErrors = errors.filter(e => e.field !== name);

    switch (name) {
      case 'numero': {
        const error = validateNumeroFactura(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'fecha': {
        const error = validateFecha(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'proveedor': {
        const error = validateProveedor(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'monto': {
        const error = validateAmount(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'puc': {
        const error = validatePuc(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'detalle': {
        const error = validateDetalle(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'retefuentePct':
      case 'icaPct': {
        const error = validatePercentage(value, name === 'retefuentePct' ? 'Retención en la Fuente' : 'ICA');
        if (error) newErrors.push(error);
        break;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
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
        const impuestos = calcularImpuestosConTotal(num, prev.retefuentePct || 0, prev.icaPct || 0);
        return {
          ...prev,
          monto: num,
          impuestos
        };
      });
      if (touched.monto) {
        validateField(name, value);
      }
    } else if (name === 'retefuentePct' || name === 'icaPct') {
      const pct = Number(value);
      setForm(prev => {
        const impuestos = calcularImpuestosConTotal(
          prev.monto,
          name === 'retefuentePct' ? pct : (prev.retefuentePct || 0),
          name === 'icaPct' ? pct : (prev.icaPct || 0)
        );
        return {
          ...prev,
          [name]: pct,
          impuestos
        };
      });
      if (touched[name as keyof typeof touched]) {
        validateField(name, value);
      }
    } else if (name === 'detalle') {
      // Sugerir retención basada en el detalle
      const suggestedRate = getRecommendedRetention(value);
      setForm(prev => {
        const newRetefuentePct = suggestedRate !== null ? suggestedRate : prev.retefuentePct;
        const impuestos = calcularImpuestosConTotal(prev.monto, newRetefuentePct, prev.icaPct);
        return {
          ...prev,
          [name]: value,
          retefuentePct: newRetefuentePct,
          impuestos
        };
      });
      if (touched.detalle) {
        validateField(name, value);
      }
    } else if (name === 'numero') {
      setForm(prev => ({ ...prev, [name]: value }));
      // Validar disponibilidad del consecutivo
      if (value.trim()) {
        checkConsecutivoAvailability(value);
      } else {
        setConsecutivoAvailable(null);
        setConsecutivoMessage('');
      }
      if (touched.numero) {
        validateField(name, value);
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
      if (touched[name as keyof typeof touched]) {
        validateField(name, value);
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    const numeroError = validateNumeroFactura(form.numero);
    if (numeroError) newErrors.push(numeroError);

    const fechaError = validateFecha(form.fecha);
    if (fechaError) newErrors.push(fechaError);

    const proveedorError = validateProveedor(form.proveedor);
    if (proveedorError) newErrors.push(proveedorError);

    const montoError = validateAmount(form.monto);
    if (montoError) newErrors.push(montoError);

    const pucError = validatePuc(form.puc);
    if (pucError) newErrors.push(pucError);

    const detalleError = validateDetalle(form.detalle);
    if (detalleError) newErrors.push(detalleError);

    const retefuenteError = validatePercentage(form.retefuentePct, 'Retención en la Fuente');
    if (retefuenteError) newErrors.push(retefuenteError);

    const icaError = validatePercentage(form.icaPct, 'ICA');
    if (icaError) newErrors.push(icaError);

    setErrors(newErrors);
    return newErrors.length === 0;
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
    setErrors([]);
    setTouched({
      numero: false,
      fecha: false,
      proveedor: false,
      monto: false,
      puc: false,
      detalle: false,
      retefuentePct: false,
      icaPct: false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(initialForm);
    setError('');
    setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!userId) {
      setError('No se ha identificado el usuario.');
      return;
    }

    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/facturas/${editing._id}` : '/facturas';
      // Al editar no se envían campos que calcula o controla el backend (dueño, impuestos, metadatos)
      const { _id, usuario, impuestos, createdAt, updatedAt, __v, ...editable } = form as any;
      const facturaData = editing
        ? editable
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
        try {
          const errorData = await res.json();
          const errorMsg = errorData.details?.join(', ') || errorData.error || errorData.message || 'No se pudo guardar la factura';
          showError(errorMsg);
          setError(errorMsg);
        } catch {
          showError('No se pudo guardar la factura');
        }
      }
    } catch (error) {
      showError('Error de conexión al guardar');
      setError(String(error));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta factura? Esta acción no se puede deshacer.')) return;
    try {
      const res = await apiFetch(`/facturas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showSuccess('Factura eliminada');
        setFacturas(facturas.filter(f => f._id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        showError(data.error || 'No se pudo eliminar la factura');
      }
    } catch {
      showError('Error de conexión al eliminar');
    }
  };

  return (
    <div className="container mx-auto px-4 pt-4 pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestión de Facturas</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Administra tus facturas y documentos contables</p>
        </div>
        {userId && (
          <div className="w-full md:w-auto">
            <button 
              className="w-full md:w-auto btn btn-primary flex items-center justify-center space-x-2 py-2.5 px-4"
              onClick={() => openModal()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Nueva Factura</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden md:overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Número</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Fecha</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Proveedor</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">PUC</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Detalles Fiscales</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap font-bold">Total a Pagar</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Acciones</th>
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
                  <tr key={factura._id} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{factura.numero}</div>
                  <div className="text-xs text-gray-500 sm:hidden">
                    {formatFecha(factura.fecha)}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {formatFecha(factura.fecha)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{factura.proveedor}</div>
                  <div className="text-xs text-gray-500 lg:hidden truncate max-w-[150px]">
                    {getPucLabel(factura.puc)}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 hidden lg:table-cell">
                  <div className="truncate max-w-[200px]">
                    {getPucLabel(factura.puc)}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-sm text-gray-600">
                  <div className="space-y-1">
                    <div className="font-semibold text-gray-900">Base: {formatCurrency(factura.monto)}</div>
                    <div className="text-xs text-green-600">+IVA: {formatCurrency(factura.impuestos.iva)}</div>
                    <div className="text-xs text-red-600">-ReteFte: {formatCurrency(factura.impuestos.retefuente)}</div>
                    <div className="text-xs text-red-600">-ICA: {formatCurrency(factura.impuestos.ica)}</div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-bold text-gray-900 bg-blue-50 rounded">
                  {formatCurrency(factura.impuestos.totalAPagar)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {canManage && (
                    <>
                    <button
                      className="text-primary-600 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50 transition-colors duration-200"
                      title="Editar"
                      onClick={() => openModal(factura)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      className="text-danger-600 hover:text-danger-900 p-1 rounded-md hover:bg-danger-50 transition-colors duration-200"
                      title="Eliminar"
                      onClick={() => handleDelete(factura._id!)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    </>
                    )}
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
          <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[95vh] overflow-y-auto">
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
              <div className="p-6 pb-24">
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
                    <div className="flex items-center justify-between mb-2">
                      <label className="form-label">Número de Factura</label>
                      <button
                        type="button"
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition"
                        onClick={() => {
                          setForm(prev => ({ ...prev, numero: nextConsecutivo }));
                          checkConsecutivoAvailability(nextConsecutivo);
                        }}
                        title="Usar el siguiente consecutivo disponible"
                      >
                        Usar: {nextConsecutivo}
                      </button>
                    </div>
                    <input
                      type="text"
                      className={`form-input ${
                        hasFieldError(errors, 'numero') ? 'border-danger-500 bg-danger-50' :
                        form.numero && consecutivoAvailable === false ? 'border-danger-500 bg-danger-50' :
                        form.numero && consecutivoAvailable === true ? 'border-success-500 bg-success-50' : ''
                      }`}
                      name="numero"
                      value={form.numero}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="FAC-2026-001"
                      aria-invalid={hasFieldError(errors, 'numero')}
                    />
                    {hasFieldError(errors, 'numero') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'numero')}</p>
                    )}
                    {form.numero && consecutivoMessage && !hasFieldError(errors, 'numero') && (
                      <p className={`text-xs mt-2 ${
                        consecutivoAvailable ? 'text-success-600' : 'text-danger-600'
                      }`}>
                        {consecutivoMessage}
                      </p>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="form-group">
                      <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      className={`form-input ${hasFieldError(errors, 'fecha') ? 'border-danger-500 bg-danger-50' : ''}`}
                      name="fecha"
                      value={form.fecha}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      aria-invalid={hasFieldError(errors, 'fecha')}
                    />
                    {hasFieldError(errors, 'fecha') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'fecha')}</p>
                    )}
                    </div>

                  {/* Proveedor */}
                  <div className="form-group">
                      <label className="form-label">Proveedor</label>
                    <input
                      type="text"
                      className={`form-input ${hasFieldError(errors, 'proveedor') ? 'border-danger-500 bg-danger-50' : ''}`}
                      name="proveedor"
                      value={form.proveedor}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="Nombre del proveedor"
                      aria-invalid={hasFieldError(errors, 'proveedor')}
                    />
                    {hasFieldError(errors, 'proveedor') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'proveedor')}</p>
                    )}
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
                        className={`form-input pl-7 ${hasFieldError(errors, 'monto') ? 'border-danger-500 bg-danger-50' : ''}`}
                        name="monto"
                        value={form.monto}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        aria-invalid={hasFieldError(errors, 'monto')}
                      />
                    </div>
                    {hasFieldError(errors, 'monto') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'monto')}</p>
                    )}
                    </div>

                  {/* PUC */}
                  <div className="form-group">
                    <label className="form-label">Cuenta PUC</label>
                      <Select
                          classNamePrefix="react-select"
                          options={pucOptions}
                          placeholder="Seleccione cuenta..."
                          value={pucOptions.find(o => o.value === form.puc) || null}
                          onChange={option => {
                            setForm(prev => ({ ...prev, puc: option ? option.value : '' }));
                            validateField('puc', option ? option.value : '');
                          }}
                          onBlur={() => validateField('puc', form.puc)}
                          isClearable
                       className={`react-select-container ${hasFieldError(errors, 'puc') ? 'error' : ''}`}
                        />
                    {hasFieldError(errors, 'puc') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'puc')}</p>
                    )}
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
                      className={`form-input ${hasFieldError(errors, 'detalle') ? 'border-danger-500 bg-danger-50' : ''}`}
                      name="detalle"
                      value={form.detalle}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      required
                      placeholder="Descripción del gasto o ingreso"
                      aria-invalid={hasFieldError(errors, 'detalle')}
                    />
                    {hasFieldError(errors, 'detalle') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'detalle')}</p>
                    )}
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
                      className={`form-select ${hasFieldError(errors, 'retefuentePct') ? 'border-danger-500 bg-danger-50' : ''}`}
                      name="retefuentePct"
                      value={form.retefuentePct}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={hasFieldError(errors, 'retefuentePct')}
                    >
                        {retefuenteOptions.map(o => (
                          <option key={o.label} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Valor: {formatCurrency(form.impuestos.retefuente)}
                    </p>
                    {hasFieldError(errors, 'retefuentePct') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'retefuentePct')}</p>
                    )}
                    </div>

                  {/* ICA */}
                  <div className="form-group">
                      <label className="form-label">ICA %</label>
                    <select
                      className={`form-select ${hasFieldError(errors, 'icaPct') ? 'border-danger-500 bg-danger-50' : ''}`}
                      name="icaPct"
                      value={form.icaPct}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      aria-invalid={hasFieldError(errors, 'icaPct')}
                    >
                        {icaOptions.map(o => (
                          <option key={o.label} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Valor: {formatCurrency(form.impuestos.ica)}
                    </p>
                    {hasFieldError(errors, 'icaPct') && (
                      <p className="text-red-500 text-xs mt-1">{getFieldError(errors, 'icaPct')}</p>
                    )}
                  </div>
                </div>

                {/* Resumen de Impuestos */}
                <div className="mt-12 mb-8 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg shadow-sm">
                  <h3 className="text-base font-bold text-blue-900 mb-6 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Desglose de Impuestos
                  </h3>

                  <div className="space-y-3 text-sm bg-white bg-opacity-70 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Monto Base:</span>
                      <span className="font-semibold text-gray-900 text-lg">{formatCurrency(form.monto)}</span>
                    </div>

                    <div className="border-t border-blue-200 pt-3">
                      <div className="flex justify-between text-green-700">
                        <span className="font-medium">+ IVA (19%):</span>
                        <span className="font-bold text-green-600 text-lg">{formatCurrency(form.impuestos.iva)}</span>
                      </div>
                    </div>

                    <div className="border-t border-blue-200 pt-3 space-y-2">
                      <div className="flex justify-between text-red-700">
                        <span className="font-medium">- ReteFuente ({(form.retefuentePct || 0).toFixed(2)}%):</span>
                        <span className="font-bold text-red-600">{formatCurrency(form.impuestos.retefuente)}</span>
                      </div>
                      <div className="flex justify-between text-red-700">
                        <span className="font-medium">- ICA ({(form.icaPct || 0).toFixed(3)}%):</span>
                        <span className="font-bold text-red-600">{formatCurrency(form.impuestos.ica)}</span>
                      </div>
                    </div>

                    <div className="border-t-2 border-blue-400 pt-3 mt-3">
                      <div className="flex justify-between items-center bg-blue-100 p-3 rounded-lg">
                        <span className="font-bold text-blue-900 text-base">TOTAL A PAGAR:</span>
                        <span className="font-bold text-blue-700 text-2xl">{formatCurrency(form.impuestos.totalAPagar)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <button
                  type="button"
                  className="btn btn-outline flex items-center space-x-2"
                  onClick={() => setShowRetentionGuide(true)}
                  title="Ver guía de retenciones por tipo de factura"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Guía de Retenciones</span>
                </button>
                <div className="flex items-center space-x-3">
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
                </div>
              </form>
          </div>
        </div>
      )}

      {/* Modal - Guía de Retenciones */}
      {showRetentionGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-strong max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">
                Guía de Retenciones en Colombia - DIAN
              </h2>
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowRetentionGuide(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {retentionGuide.map((section, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">{section.category}</h3>
                    <div className="space-y-2">
                      {section.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">{item.type}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold whitespace-nowrap ml-4">
                              {item.rate}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-8">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> El sistema sugiere automáticamente el porcentaje de retención basado en el tipo de factura que ingreses.
                    Puedes modificarlo manualmente según tu situación específica.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;
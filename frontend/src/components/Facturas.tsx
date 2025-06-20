import React, { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../api';
import { formatCurrency } from '../utils/format';
import { showSuccess, showError } from '../utils/alerts';
import Select from 'react-select';
import pucAccounts from '../data/pucAccounts';

interface Factura {
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
    ica: number;
    reteiva: number;
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
  impuestos: {
    iva: 0,
    retefuente: 0,
    ica: 0,
    reteiva: 0,
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
      setForm(prev => ({
        ...prev,
        monto: num,
        impuestos: { ...prev.impuestos, iva: +(num * 0.19).toFixed(2) }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const openModal = (factura?: Factura) => {
    if (factura) {
      setEditing(factura);
      setForm({ ...factura });
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
    <div className="container py-4">
      <h3 className="mb-4" style={{ color: 'var(--primary)' }}>Facturas</h3>
      <button className="btn btn-success mb-3" onClick={() => openModal()}>
        + Agregar factura
      </button>
      <div className="table-responsive">
        <table className="table table-hover modern-table">
          <thead>
            <tr>
              <th>Número</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>PUC</th>
              <th>Monto</th>
              <th style={{ width: 120 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center">Cargando...</td>
              </tr>
            ) : facturas.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center">No hay facturas registradas</td>
              </tr>
            ) : (
              facturas.map(factura => (
                <tr key={factura._id}>
                  <td>{factura.numero}</td>
                  <td>{new Date(factura.fecha).toLocaleDateString()}</td>
                  <td>{factura.proveedor}</td>
                  <td>{getPucLabel(factura.puc)}</td>
                  <td>{formatCurrency(factura.monto)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      title="Editar"
                      onClick={() => openModal(factura)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar"
                      onClick={() => handleDelete(factura._id!)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal flotante */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Editar Factura' : 'Agregar Factura'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <div className="modal-body">
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label">Número</label>
                      <input type="text" className="form-control" name="numero" value={form.numero} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Fecha</label>
                      <input type="date" className="form-control" name="fecha" value={form.fecha} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Proveedor</label>
                      <input type="text" className="form-control" name="proveedor" value={form.proveedor} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Monto</label>
                      <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="number" className="form-control" name="monto" value={form.monto} onChange={handleChange} required />
                    </div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">PUC</label>
                      <Select
                          classNamePrefix="react-select"
                          options={pucOptions}
                          placeholder="Seleccione cuenta..."
                          value={pucOptions.find(o => o.value === form.puc) || null}
                          onChange={option =>
                            setForm(prev => ({ ...prev, puc: option ? option.value : '' }))
                          }
                          isClearable
                        />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Detalle</label>
                      <input type="text" className="form-control" name="detalle" value={form.detalle} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Naturaleza</label>
                      <select className="form-select" name="naturaleza" value={form.naturaleza} onChange={handleChange} required>
                        <option value="debito">Débito</option>
                        <option value="credito">Crédito</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">IVA</label>
                      <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input type="text" className="form-control" value={formatCurrency(form.impuestos.iva)} readOnly />
                    </div>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">ReteFuente</label>
                      <input type="number" className="form-control" name="impuestos.retefuente" value={form.impuestos.retefuente} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">ICA</label>
                      <input type="number" className="form-control" name="impuestos.ica" value={form.impuestos.ica} onChange={handleChange} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">ReteIVA</label>
                      <input type="number" className="form-control" name="impuestos.reteiva" value={form.impuestos.reteiva} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn btn-success">{editing ? 'Actualizar' : 'Agregar'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Facturas;
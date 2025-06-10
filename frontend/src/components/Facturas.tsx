import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';

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

const emptyFactura: Factura = {
  numero: '',
  fecha: '',
  proveedor: '',
  monto: 0,
  puc: '',
  detalle: '',
  naturaleza: 'credito',
  impuestos: { iva: 0, retefuente: 0, ica: 0, reteiva: 0 }
};

const Facturas: React.FC = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Factura | null>(null);
  const [form, setForm] = useState<Factura>(emptyFactura);
  const [error, setError] = useState('');

  const fetchFacturas = async () => {
    const res = await apiFetch('/facturas');
    const data = await res.json();
    setFacturas(data);
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const openModal = (factura?: Factura) => {
    setError('');
    setEditing(factura || null);
    setForm(factura ? { ...factura } : emptyFactura);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(emptyFactura);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('impuestos.')) {
      const key = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        impuestos: { ...prev.impuestos, [key]: Number(value) }
      }));
    } else if (name === 'monto') {
      setForm(prev => ({ ...prev, monto: Number(value) }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validación básica
    if (!form.numero || !form.fecha || !form.proveedor || !form.monto || !form.puc || !form.detalle) {
      setError('Todos los campos son obligatorios');
      return;
    }
    const method = editing ? 'PUT' : 'POST';
    const url = editing ? `/facturas/${editing._id}` : '/facturas';
    const res = await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      fetchFacturas();
      closeModal();
    } else {
      const data = await res.json();
      setError(data.error || 'Error al guardar la factura');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Eliminar esta factura?')) return;
    const res = await apiFetch(`/facturas/${id}`, { method: 'DELETE' });
    if (res.ok) fetchFacturas();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 style={{ color: 'var(--primary)' }}>Facturas</h3>
        <button className="btn btn-success" onClick={() => openModal()}>Nueva Factura</button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Proveedor</th>
              <th>Monto</th>
              <th>PUC</th>
              <th>Detalle</th>
              <th>Naturaleza</th>
              <th>IVA</th>
              <th>Rtefuente</th>
              <th>ICA</th>
              <th>RteIVA</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map(f => (
              <tr key={f._id}>
                <td>{f.numero}</td>
                <td>{new Date(f.fecha).toLocaleDateString()}</td>
                <td>{f.proveedor}</td>
                <td>${f.monto.toLocaleString()}</td>
                <td>{f.puc}</td>
                <td>{f.detalle}</td>
                <td>{f.naturaleza}</td>
                <td>{f.impuestos.iva}</td>
                <td>{f.impuestos.retefuente}</td>
                <td>{f.impuestos.ica}</td>
                <td>{f.impuestos.reteiva}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => openModal(f)}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(f._id!)}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
            {facturas.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center">No hay facturas registradas.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal flotante */}
      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editing ? 'Editar Factura' : 'Nueva Factura'}</h5>
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
                      <input type="date" className="form-control" name="fecha" value={form.fecha.slice(0,10)} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Proveedor</label>
                      <input type="text" className="form-control" name="proveedor" value={form.proveedor} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Monto</label>
                      <input type="number" className="form-control" name="monto" value={form.monto} onChange={handleChange} required min={0} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">PUC</label>
                      <input type="text" className="form-control" name="puc" value={form.puc} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Detalle</label>
                      <input type="text" className="form-control" name="detalle" value={form.detalle} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Naturaleza</label>
                      <select className="form-select" name="naturaleza" value={form.naturaleza} onChange={handleChange} required>
                        <option value="credito">Crédito</option>
                        <option value="debito">Débito</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">IVA</label>
                      <input type="number" className="form-control" name="impuestos.iva" value={form.impuestos.iva} onChange={handleChange} min={0} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">Rtefuente</label>
                      <input type="number" className="form-control" name="impuestos.retefuente" value={form.impuestos.retefuente} onChange={handleChange} min={0} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">ICA</label>
                      <input type="number" className="form-control" name="impuestos.ica" value={form.impuestos.ica} onChange={handleChange} min={0} />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">RteIVA</label>
                      <input type="number" className="form-control" name="impuestos.reteiva" value={form.impuestos.reteiva} onChange={handleChange} min={0} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                  <button type="submit" className="btn btn-success">{editing ? 'Actualizar' : 'Crear'}</button>
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
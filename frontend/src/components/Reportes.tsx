import React, { useEffect, useRef, useState } from 'react';
import Select from 'react-select';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { apiFetch } from '../api';

interface Impuestos {
  iva?: number | string;
  retefuente?: number | string;
  ica?: number | string;
}

interface Factura {
  _id: string;
  numero: string;
  fecha: string; // ISO string
  proveedor: string;
  cliente?: string;
  monto: number | string;
  puc: string;
  detalle: string;
  naturaleza: string;
  impuestos: Impuestos;
}

const formatosFecha = (iso: string) => new Date(iso).toLocaleDateString();

const parseNumero = (v: unknown): number => {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') return parseFloat(v.replace(/[^0-9.-]/g, '')) || 0;
  return 0;
};

const Reportes: React.FC = () => {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [filtrado, setFiltrado] = useState<Factura[]>([]);
  const [clientes, setClientes] = useState<{ label: string; value: string }[]>([]);
  const [clienteSel, setClienteSel] = useState<{ label: string; value: string } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/facturas');
        const data: Factura[] = await res.json();
        setFacturas(data);
        setFiltrado(data);
        const listaClientes: string[] = Array.from(new Set<string>(data.map((f) => f.proveedor ?? f.cliente ?? 'Sin nombre')));
        setClientes(listaClientes.map((c) => ({ label: c, value: c })));
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (clienteSel) {
      setFiltrado(facturas.filter((f) => (f.proveedor ?? f.cliente) === clienteSel.value));
    } else {
      setFiltrado(facturas);
    }
  }, [clienteSel, facturas]);

  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'letter' });
    const marginX = 40;
    let cursorY = 50;

    // Header
    doc.setFontSize(16);
    doc.text('Contabiliza Ágil', marginX, cursorY);
    doc.setFontSize(12);
    doc.text('Reporte de Facturas', marginX, cursorY + 18);
    doc.text(`Fecha de generación: ${new Date().toLocaleString()}`, marginX, cursorY + 34);

    // Tabla de facturas
    const body = filtrado.map((f, idx) => {
      const iva = parseNumero(f.impuestos?.iva);
      const rete = parseNumero(f.impuestos?.retefuente);
      const ica = parseNumero(f.impuestos?.ica);
      const base = parseNumero(f.monto);
      const pct = (val: number) => base ? ((val / base) * 100).toFixed(1) + '%' : '0%';
      const detalleImp = `IVA (${pct(iva)}): ${iva.toFixed(2)}\nRteFte (${pct(rete)}): ${rete.toFixed(2)}\nICA (${pct(ica)}): ${ica.toFixed(2)}`;
      const total = base + iva + rete + ica;
      return [
        idx + 1,
        f.numero,
        formatosFecha(f.fecha),
        f.proveedor ?? f.cliente,
        f.puc,
        f.naturaleza,
        base.toFixed(2),
        detalleImp,
        total.toFixed(2)
      ];
    });

    autoTable(doc, {
      head: [['#', 'Nº', 'Fecha', 'Proveedor', 'PUC', 'Naturaleza', 'Monto', 'Impuestos', 'Total']],
      body,
      startY: cursorY + 50,
      margin: { left: marginX, right: marginX },
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    // Footer dummy
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.text(`Página ${i} de ${pageCount}`, marginX, pageHeight - 30);
      doc.text('© 2025 Contabiliza Ágil. Todos los derechos reservados.', marginX, pageHeight - 16);
    }

    doc.save('Reporte_Facturas.pdf');
  };

  return (
    <div className="container" ref={reportRef}>
      <h2 className="mb-3">Reportes de Facturas</h2>
      <div className="d-flex align-items-center mb-3 gap-2">
        <Select
          options={clientes}
          placeholder="Filtrar por cliente"
          isClearable
          className="flex-grow-1"
          value={clienteSel}
          onChange={(opt) => setClienteSel(opt as any)}
        />
        <button className="btn btn-primary" onClick={handleExportPDF}>
          Exportar PDF
        </button>
      </div>

      <table className="table table-striped">
        <thead>
          <tr>
            <th>#</th>
            <th>Nº</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>PUC</th>
            <th>Naturaleza</th>
            <th>Monto</th>
            <th>Impuestos (detalle)</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {filtrado.map((f, idx) => {
            const iva = parseNumero(f.impuestos?.iva);
            const rete = parseNumero(f.impuestos?.retefuente);
            const ica = parseNumero(f.impuestos?.ica);
            const base = parseNumero(f.monto);
            const pct = (val: number) => base ? ((val / base) * 100).toFixed(1) + '%' : '0%';
            const detalleImp = `IVA (${pct(iva)}): ${iva.toFixed(2)} | RteFte (${pct(rete)}): ${rete.toFixed(2)} | ICA (${pct(ica)}): ${ica.toFixed(2)}`;
            const total = base + iva + rete + ica;
            return (
              <tr key={f._id}>
                <td>{idx + 1}</td>
                <td>{f.numero}</td>
                <td>{formatosFecha(f.fecha)}</td>
                <td>{f.proveedor ?? f.cliente}</td>
                <td>{f.puc}</td>
                <td>{f.naturaleza}</td>
                <td>{base.toFixed(2)}</td>
                <td>{detalleImp}</td>
                <td>{total.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Reportes;

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Reportes from '../Reportes';
import { apiFetch } from '../../api';
import { showError } from '../../utils/alerts';
import { exportarPDF, exportarExcel } from '../../utils/export';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));
jest.mock('../../utils/export', () => ({ exportarPDF: jest.fn(), exportarExcel: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const res = (body: any, ok = true, status = 200) =>
  Promise.resolve({ ok, status, statusText: 'x', json: () => Promise.resolve(body), text: () => Promise.resolve(JSON.stringify(body)) });

const reporte = {
  totalFacturas: 2, totalMonto: 3000, totalIva: 570, totalReteFuente: 60, totalIca: 30,
  facturasPorMes: [{ mes: '2026-03', cantidad: 2, monto: 3000 }],
  topProveedores: [{ proveedor: 'ACME', cantidad: 2, monto: 3000 }],
  facturasRecientes: [{ _id: 'f1', numero: 'FAC-001', fecha: '2026-03-01T00:00:00.000Z', proveedor: 'ACME', monto: 1000, puc: '5105', detalle: 'x', naturaleza: 'debito', impuestos: { iva: 190, retefuente: 20, ica: 10 } }],
  filtros: {
    mesesDisponibles: [{ id: '2026-03', label: 'marzo de 2026' }],
    proveedores: ['ACME', 'Beta'],
    usuarios: [{ _id: 'u1', nombre: 'Ana Pérez' }],
  },
};
const vacio = { ...reporte, totalFacturas: 0, facturasPorMes: [], topProveedores: [], facturasRecientes: [] };

const reportCalls = () => mockApi.mock.calls.map(c => c[0]).filter((u: string) => u.startsWith('/facturas/reportes'));

describe('Reportes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApi.mockImplementation(() => res(reporte));
  });
  afterEach(() => jest.restoreAllMocks());

  test('carga el reporte y los filtros disponibles', async () => {
    render(<Reportes />);
    expect(screen.getByText('Cargando reportes...')).toBeInTheDocument();
    expect(await screen.findByText('Reportes de Facturas')).toBeInTheDocument();
    expect(screen.getByText('FAC-001')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'marzo de 2026' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Ana Pérez' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Beta' })).toBeInTheDocument();
  });

  test('los filtros se envían como parámetros al backend', async () => {
    render(<Reportes />);
    await screen.findByText('FAC-001');
    await waitFor(() => expect(screen.getByLabelText('Proveedor')).toBeEnabled());
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-03' } });
    fireEvent.change(screen.getByLabelText('Proveedor'), { target: { value: 'ACME' } });
    await waitFor(() => expect(reportCalls()).toContain('/facturas/reportes?mes=2026-03&proveedor=ACME'), { timeout: 2000 });
  });

  test('al filtrar mantiene la página montada (no reemplaza los filtros por el spinner)', async () => {
    render(<Reportes />);
    await screen.findByText('FAC-001');
    const mes = screen.getByLabelText('Mes');
    fireEvent.change(mes, { target: { value: '2026-03' } });
    await waitFor(() => expect(reportCalls().length).toBeGreaterThan(2), { timeout: 2000 });
    expect(screen.getByLabelText('Mes')).toBe(mes);
    expect(screen.queryByText('Cargando reportes...')).not.toBeInTheDocument();
  });

  test('si un filtro no tiene datos se puede limpiar desde el aviso', async () => {
    render(<Reportes />);
    await screen.findByText('FAC-001');
    mockApi.mockImplementation((url: string) => res(url.includes('?') ? vacio : reporte));
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: '2026-03' } });

    expect(await screen.findByText('No se encontraron datos de facturas para mostrar en el reporte.', {}, { timeout: 2000 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(await screen.findByText('FAC-001', {}, { timeout: 2000 })).toBeInTheDocument();
    expect(reportCalls().pop()).toBe('/facturas/reportes');
  });

  test('muestra el error del backend', async () => {
    mockApi.mockImplementation(() => res({ error: 'usuarioId: debe ser un ObjectId válido' }, false, 400));
    render(<Reportes />);
    expect(await screen.findByText(/usuarioId: debe ser un ObjectId válido/, {}, { timeout: 2000 })).toBeInTheDocument();
    expect(showError).toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Limpiar filtros' })).not.toBeInTheDocument();
  });

  test('exporta a PDF y Excel con los datos y el mes filtrado', async () => {
    render(<Reportes />);
    await screen.findByText('FAC-001');
    fireEvent.click(screen.getByRole('button', { name: /PDF/ }));
    fireEvent.click(screen.getByRole('button', { name: /Excel/ }));
    const mesActual = new Date().toISOString().slice(0, 7);
    expect(exportarPDF).toHaveBeenCalledWith(expect.objectContaining({ totalFacturas: 2 }), mesActual);
    expect(exportarExcel).toHaveBeenCalledWith(expect.objectContaining({ totalFacturas: 2 }), mesActual);
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../Home';
import { apiFetch } from '../../api';
import { showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const getItem = window.localStorage.getItem as jest.Mock;
const res = (body: any, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

const stats = {
  totalFacturas: 1234, totalMonto: 5000000, usuariosActivos: 7, usuariosPendientes: 2,
  facturasRecientes: [{ id: 'f1', numero: 'FAC-2026-001', proveedor: 'ACME', monto: 1190000, fecha: '2026-03-01T00:00:00.000Z', usuario: 'Ana' }],
};

describe('Home (panel de control)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getItem.mockImplementation((k: string) => (k === 'role' ? 'administrador' : null));
    mockApi.mockImplementation(() => res(stats));
  });

  test('muestra las estadísticas del dashboard', async () => {
    render(<Home />);
    expect(screen.getByText('Cargando estadísticas...')).toBeInTheDocument();
    expect(await screen.findByText('Panel de Control')).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith('/facturas/dashboard/stats');
    expect(screen.getByText('1.234')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('la actividad reciente muestra la factura con su fecha real (sin correrse un día)', async () => {
    render(<Home />);
    expect(await screen.findByText(/Factura #FAC-2026-001/)).toBeInTheDocument();
    expect(screen.getByText('1/3/2026')).toBeInTheDocument();
  });

  test('sin facturas recientes muestra el estado vacío', async () => {
    mockApi.mockImplementation(() => res({ ...stats, facturasRecientes: [] }));
    render(<Home />);
    expect(await screen.findByText('No hay actividad reciente')).toBeInTheDocument();
  });

  test('si el backend responde con error lo informa en lugar de mostrar ceros', async () => {
    mockApi.mockImplementation(() => res({ error: 'Acceso denegado' }, false));
    render(<Home />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Acceso denegado'));
    expect(screen.getByText('No se pudieron cargar las estadísticas')).toBeInTheDocument();
  });

  test('error de red', async () => {
    mockApi.mockRejectedValue(new Error('offline'));
    render(<Home />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Error al cargar las estadísticas del dashboard'));
  });

  test('los accesos rápidos cambian de sección', async () => {
    const onSectionChange = jest.fn();
    render(<Home onSectionChange={onSectionChange} />);
    fireEvent.click(await screen.findByText('Nueva Factura'));
    fireEvent.click(screen.getByText('Generar Reporte', { selector: 'h3' }));
    fireEvent.click(screen.getByText('Gestionar Usuarios'));
    expect(onSectionChange.mock.calls.map(c => c[0])).toEqual(['facturacion', 'reportes', 'usuarios']);
  });

  test('el contador no ve el acceso a gestión de usuarios', async () => {
    getItem.mockImplementation((k: string) => (k === 'role' ? 'contador' : null));
    render(<Home />);
    await screen.findByText('Nueva Factura');
    expect(screen.queryByText('Gestionar Usuarios')).not.toBeInTheDocument();
  });
});

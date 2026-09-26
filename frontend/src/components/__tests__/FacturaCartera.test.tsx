import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import FacturaCartera from '../FacturaCartera';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const getItem = window.localStorage.getItem as jest.Mock;
const res = (body: any, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

const tercero = { _id: 't1', razonSocial: 'Cliente SA' };
const puc = { _id: 'p1', codigo: '4135', nombre: 'Comercio' };
const base = {
  tipo: 'factura', fecha: '2026-03-01T00:00:00.000Z', tercero, puc, monto: 1000, detalle: 'Venta',
  naturaleza: 'credito', impuestos: { iva: 190, retefuente: 0, ica: 0 }, totalPagado: 0, pagos: [],
};
const facturas = [
  { ...base, _id: 'c1', numeroDocumento: 'FAC-001', estadoPago: 'Pendiente', saldoPendiente: 1000, estado: 'activa' },
  { ...base, _id: 'c2', numeroDocumento: 'FAC-002', estadoPago: 'Pagada', saldoPendiente: 0, totalPagado: 1000, estado: 'activa' },
  { ...base, _id: 'c3', numeroDocumento: 'FAC-003', estadoPago: 'Pendiente', saldoPendiente: 1000, estado: 'anulada' },
];

const route = (overrides: Record<string, () => any> = {}) => (url: string, opts?: any) => {
  const key = `${opts?.method || 'GET'} ${url}`;
  if (overrides[key]) return overrides[key]();
  if (url.startsWith('/facturas-cartera?')) return res({ data: facturas });
  if (url.startsWith('/terceros')) return res({ data: [tercero] });
  if (url.startsWith('/puc')) return res({ data: [puc] });
  return res({});
};

const setRole = (role: string) => getItem.mockImplementation((k: string) => (k === 'role' ? role : null));
const rowOf = async (numero: string) => (await screen.findByText(numero)).closest('tr') as HTMLElement;
const field = (name: string) => document.querySelector(`[name="${name}"]`) as HTMLInputElement;
const setField = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const pickOption = async (placeholder: string, option: string) => {
  const input = screen.getByText(placeholder).parentElement!.querySelector('input') as HTMLInputElement;
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText(option, { selector: '.react-select__option' }));
};

describe('FacturaCartera', () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    setRole('contador');
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockApi.mockImplementation(route());
  });
  afterEach(() => confirmSpy.mockRestore());

  test('carga facturas y solo clientes/cuentas activos (hasta 100)', async () => {
    render(<FacturaCartera userId="u1" />);
    await rowOf('FAC-001');
    expect(mockApi).toHaveBeenCalledWith('/terceros?tipo=cliente&activo=true&limit=100');
    expect(mockApi).toHaveBeenCalledWith('/puc?activo=true&limit=100');
    expect(within(await rowOf('FAC-001')).getByText('1/3/2026')).toBeInTheDocument();
  });

  test('acciones por estado: pagada sin botón de pago, anulada sin acciones', async () => {
    render(<FacturaCartera userId="u1" />);
    const pendiente = await rowOf('FAC-001');
    const pagada = await rowOf('FAC-002');
    const anulada = await rowOf('FAC-003');
    expect(within(pendiente).getByRole('button', { name: 'Registrar pago' })).toBeInTheDocument();
    expect(within(pagada).queryByRole('button', { name: 'Registrar pago' })).not.toBeInTheDocument();
    expect(within(anulada).getByText('Anulada')).toBeInTheDocument();
    expect(within(anulada).queryAllByRole('button')).toHaveLength(0);
  });

  test.each([
    ['administrador', true], ['contador', true], ['analista', true], ['auxiliar', false],
  ])('%s → puede editar/anular: %p (pero siempre puede registrar pagos)', async (role, canManage) => {
    setRole(role);
    render(<FacturaCartera userId="u1" />);
    const row = await rowOf('FAC-001');
    expect(!!within(row).queryByRole('button', { name: 'Editar' })).toBe(canManage);
    expect(!!within(row).queryByRole('button', { name: 'Anular' })).toBe(canManage);
    expect(within(row).getByRole('button', { name: 'Registrar pago' })).toBeInTheDocument();
  });

  test('crear exige los campos obligatorios', async () => {
    render(<FacturaCartera userId="u1" />);
    await rowOf('FAC-001');
    fireEvent.click(screen.getByRole('button', { name: /Nueva Factura/ }));
    fireEvent.submit(screen.getByRole('button', { name: 'Crear Factura' }).closest('form') as HTMLFormElement);
    expect(await screen.findByText('Por favor completa todos los campos obligatorios.')).toBeInTheDocument();
    expect(mockApi).not.toHaveBeenCalledWith('/facturas-cartera', expect.objectContaining({ method: 'POST' }));
  });

  test('crear envía tercero y puc como ids y el usuario', async () => {
    render(<FacturaCartera userId="u1" />);
    await rowOf('FAC-001');
    fireEvent.click(screen.getByRole('button', { name: /Nueva Factura/ }));
    setField('fecha', '2026-05-01');
    setField('monto', '2000');
    setField('detalle', 'Venta de mercancía');
    await pickOption('Seleccione cliente...', 'Cliente SA');
    await pickOption('Seleccione cuenta...', '4135 - Comercio');
    fireEvent.submit(screen.getByRole('button', { name: 'Crear Factura' }).closest('form') as HTMLFormElement);

    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Factura creada'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/facturas-cartera' && c[1]?.method === 'POST');
    expect(JSON.parse(opts.body)).toEqual(expect.objectContaining({ tercero: 't1', puc: 'p1', monto: 2000, usuario: 'u1' }));
  });

  test('editar precarga cliente y cuenta y envía sus ids (no los objetos populados)', async () => {
    render(<FacturaCartera userId="u1" />);
    fireEvent.click(within(await rowOf('FAC-001')).getByRole('button', { name: 'Editar' }));
    expect(await screen.findByText('Cliente SA', { selector: '.react-select__single-value' })).toBeInTheDocument();
    expect(screen.getByText('4135 - Comercio', { selector: '.react-select__single-value' })).toBeInTheDocument();
    expect(field('fecha')).toHaveValue('2026-03-01');

    fireEvent.submit(screen.getByRole('button', { name: 'Actualizar Factura' }).closest('form') as HTMLFormElement);
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Factura actualizada'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/facturas-cartera/c1' && c[1]?.method === 'PUT');
    const body = JSON.parse(opts.body);
    expect(body.tercero).toBe('t1');
    expect(body.puc).toBe('p1');
  });

  test('muestra el detalle de validación del backend al guardar', async () => {
    mockApi.mockImplementation(route({ 'PUT /facturas-cartera/c1': () => res({ details: ['monto: debe ser un número positivo'] }, false) }));
    render(<FacturaCartera userId="u1" />);
    fireEvent.click(within(await rowOf('FAC-001')).getByRole('button', { name: 'Editar' }));
    fireEvent.submit(screen.getByRole('button', { name: 'Actualizar Factura' }).closest('form') as HTMLFormElement);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('monto: debe ser un número positivo'));
  });

  test('anular pide confirmación y recarga la lista', async () => {
    render(<FacturaCartera userId="u1" />);
    const row = await rowOf('FAC-001');
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(within(row).getByRole('button', { name: 'Anular' }));
    expect(mockApi).not.toHaveBeenCalledWith('/facturas-cartera/c1', { method: 'DELETE' });

    fireEvent.click(within(row).getByRole('button', { name: 'Anular' }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Factura anulada'));
    expect(mockApi).toHaveBeenCalledWith('/facturas-cartera/c1', { method: 'DELETE' });
    expect(mockApi.mock.calls.filter(c => c[0].startsWith('/facturas-cartera?') && !c[1]).length).toBe(2);
  });

  describe('registro de pagos', () => {
    const openPago = async (numero = 'FAC-001') => {
      fireEvent.click(within(await rowOf(numero)).getByRole('button', { name: 'Registrar pago' }));
      return screen.findByRole('button', { name: 'Registrar Pago' });
    };

    test('las cuentas de pago corresponden al PUC (1105 Caja, 1110 Bancos)', async () => {
      render(<FacturaCartera userId="u1" />);
      await openPago();
      expect(screen.getByRole('option', { name: '1105 - Caja' })).toHaveValue('1105');
      expect(screen.getByRole('option', { name: '1110 - Bancos' })).toHaveValue('1110');
    });

    test('envía monto numérico, referencia y cuenta', async () => {
      render(<FacturaCartera userId="u1" />);
      const submit = await openPago();
      const form = submit.closest('form') as HTMLFormElement;
      fireEvent.change(within(form).getByPlaceholderText('0.00'), { target: { value: '400' } });
      fireEvent.change(within(form).getByPlaceholderText('Cheque, transferencia, referencia...'), { target: { value: 'TRX-9' } });
      fireEvent.change(within(form).getByRole('combobox'), { target: { value: '1105' } });
      fireEvent.submit(form);

      await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Pago registrado correctamente'));
      const [, opts] = mockApi.mock.calls.find(c => c[0] === '/facturas-cartera/c1/pagos');
      expect(JSON.parse(opts.body)).toEqual({ monto: 400, referencia: 'TRX-9', cuenta: '1105' });
    });

    test('muestra el error del backend (p. ej. monto mayor al saldo)', async () => {
      mockApi.mockImplementation(route({ 'POST /facturas-cartera/c1/pagos': () => res({ error: 'El monto excede el saldo pendiente (1000)' }, false) }));
      render(<FacturaCartera userId="u1" />);
      const form = (await openPago()).closest('form') as HTMLFormElement;
      fireEvent.change(within(form).getByPlaceholderText('0.00'), { target: { value: '5000' } });
      fireEvent.submit(form);
      await waitFor(() => expect(showError).toHaveBeenCalledWith('El monto excede el saldo pendiente (1000)'));
    });

    test('una factura con saldo 0 no se muestra con el monto completo como pendiente', async () => {
      const parcial = { ...facturas[0], _id: 'c4', numeroDocumento: 'FAC-004', estadoPago: 'Parcialmente Pagada', saldoPendiente: 0, monto: 1000 };
      mockApi.mockImplementation(route({ 'GET /facturas-cartera?page=1&limit=20': () => res({ data: [parcial] }) }));
      render(<FacturaCartera userId="u1" />);
      const form = (await openPago('FAC-004')).closest('form') as HTMLFormElement;
      expect(within(form).getByPlaceholderText('0.00')).toHaveAttribute('max', '0');
    });
  });
});

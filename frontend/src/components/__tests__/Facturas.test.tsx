import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Facturas from '../Facturas';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const getItem = window.localStorage.getItem as jest.Mock;
const res = (body: any, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

const factura = {
  _id: 'f1', numero: 'FAC-2026-001', fecha: '2026-03-01T00:00:00.000Z', proveedor: 'ACME SAS', monto: 1000,
  puc: '5110', detalle: 'Honorarios', naturaleza: 'debito', retefuentePct: 10, icaPct: 0,
  impuestos: { iva: 190, retefuente: 100, ica: 0, totalAPagar: 1090 },
  usuario: { _id: 'u1', nombres: 'Ana', apellidos: 'Pérez' }, createdAt: '2026-03-01T10:00:00Z',
};

const route = (overrides: Record<string, () => any> = {}) => (url: string, opts?: any) => {
  const key = `${opts?.method || 'GET'} ${url.split('?')[0]}`;
  if (overrides[key]) return overrides[key]();
  if (url.startsWith('/facturas?')) return res({ data: [factura] });
  if (url === '/facturas/siguiente/consecutivo') return res({ nextSuggested: 'FAC-2026-002' });
  if (url.startsWith('/facturas/verificar/disponibilidad')) {
    const numero = decodeURIComponent(url.split('numero=')[1]);
    return res(numero === 'FAC-2026-001'
      ? { available: false, message: `El consecutivo "${numero}" ya está registrado` }
      : { available: true, message: `El consecutivo "${numero}" está disponible` });
  }
  return res({});
};

const setRole = (role: string) => getItem.mockImplementation((k: string) => (k === 'role' ? role : null));
const field = (name: string) => document.querySelector(`[name="${name}"]`) as HTMLInputElement;
const setField = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const rowOf = async (text: string) => (await screen.findByText(text)).closest('tr') as HTMLElement;
const submitForm = () => fireEvent.submit(screen.getByRole('button', { name: /(Crear|Actualizar) Factura/ }).closest('form') as HTMLFormElement);
const openNueva = async () => {
  await rowOf('FAC-2026-001');
  fireEvent.click(screen.getByRole('button', { name: /Nueva Factura/ }));
  await screen.findByRole('heading', { name: 'Nueva Factura' });
};
const pickPuc = async (label: string) => {
  const input = screen.getByText('Seleccione cuenta...').parentElement!.querySelector('input') as HTMLInputElement;
  fireEvent.keyDown(input, { key: 'ArrowDown' });
  fireEvent.click(await screen.findByText(label, { selector: '.react-select__option' }));
};

describe('Facturas', () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    setRole('contador');
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApi.mockImplementation(route());
  });
  afterEach(() => jest.restoreAllMocks());

  test('lista hasta 100 facturas con impuestos, total y fecha real', async () => {
    render(<Facturas userId="u1" />);
    const row = await rowOf('FAC-2026-001');
    expect(mockApi).toHaveBeenCalledWith('/facturas?limit=100');
    expect(within(row).getAllByText('1/3/2026').length).toBeGreaterThan(0);
    expect(within(row).getByText(/Base:/)).toHaveTextContent('1.000,00');
    expect(within(row).getByText(/-ReteFte:/)).toHaveTextContent('100,00');
    expect(within(row).getAllByText(/1\.090,00/).length).toBeGreaterThan(0);
  });

  test('sin userId no permite crear', async () => {
    render(<Facturas userId={null} />);
    await rowOf('FAC-2026-001');
    expect(screen.queryByRole('button', { name: /Nueva Factura/ })).not.toBeInTheDocument();
  });

  test.each([
    ['administrador', true], ['contador', true], ['analista', true], ['auxiliar', false],
  ])('%s → puede editar/eliminar: %p', async (role, canManage) => {
    setRole(role);
    render(<Facturas userId="u1" />);
    const row = await rowOf('FAC-2026-001');
    expect(!!within(row).queryByTitle('Editar')).toBe(canManage);
    expect(!!within(row).queryByTitle('Eliminar')).toBe(canManage);
  });

  test('sugiere el siguiente consecutivo y verifica disponibilidad', async () => {
    render(<Facturas userId="u1" />);
    await openNueva();
    fireEvent.click(screen.getByRole('button', { name: /Usar: FAC-2026-002/ }));
    expect(field('numero')).toHaveValue('FAC-2026-002');
    expect(await screen.findByText('El consecutivo "FAC-2026-002" está disponible')).toBeInTheDocument();

    setField('numero', 'FAC-2026-001');
    expect(await screen.findByText('El consecutivo "FAC-2026-001" ya está registrado')).toBeInTheDocument();
  });

  test('calcula IVA, retenciones y total mientras se diligencia', async () => {
    render(<Facturas userId="u1" />);
    await openNueva();
    setField('monto', '1000000');
    setField('retefuentePct', '2.5');
    setField('icaPct', '0.966');
    const form = screen.getByRole('heading', { name: 'Nueva Factura' }).closest('form') as HTMLElement;
    [/190.000,00/, /25.000,00/, /9.660,00/, /1.155.340,00/].forEach(valor =>
      expect(within(form).getAllByText(valor).length).toBeGreaterThan(0));
  });

  test('sugiere la retención según el detalle', async () => {
    render(<Facturas userId="u1" />);
    await openNueva();
    setField('detalle', 'Honorarios abogado');
    expect(field('retefuentePct')).toHaveValue('11');
  });

  test('valida el formulario antes de enviar', async () => {
    render(<Facturas userId="u1" />);
    await openNueva();
    submitForm();
    expect(await screen.findByText('El número de factura es requerido')).toBeInTheDocument();
    expect(screen.getByText('El proveedor es requerido')).toBeInTheDocument();
    expect(screen.getByText('El PUC es requerido')).toBeInTheDocument();
    expect(mockApi).not.toHaveBeenCalledWith('/facturas', expect.objectContaining({ method: 'POST' }));
  });

  test('crea una factura con el usuario y los impuestos calculados', async () => {
    render(<Facturas userId="u1" />);
    await openNueva();
    setField('numero', 'FAC-2026-002');
    setField('fecha', '2026-03-10');
    setField('proveedor', 'Proveedor Nuevo');
    setField('monto', '2000');
    setField('detalle', 'Compra de insumos');
    await pickPuc('5110 - Honorarios (Administración)');
    submitForm();

    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Factura creada'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/facturas' && c[1]?.method === 'POST');
    expect(JSON.parse(opts.body)).toEqual(expect.objectContaining({
      numero: 'FAC-2026-002', proveedor: 'Proveedor Nuevo', monto: 2000, puc: '5110', usuario: 'u1',
      impuestos: expect.objectContaining({ iva: 380 }),
    }));
  });

  test('editar no envía dueño, impuestos ni metadatos', async () => {
    render(<Facturas userId="u1" />);
    fireEvent.click(within(await rowOf('FAC-2026-001')).getByTitle('Editar'));
    expect(await screen.findByRole('heading', { name: 'Editar Factura' })).toBeInTheDocument();
    expect(field('fecha')).toHaveValue('2026-03-01');
    setField('proveedor', 'ACME Colombia');
    submitForm();

    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Factura actualizada'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/facturas/f1' && c[1]?.method === 'PUT');
    const body = JSON.parse(opts.body);
    expect(body.proveedor).toBe('ACME Colombia');
    ['_id', 'usuario', 'impuestos', 'createdAt'].forEach(k => expect(body).not.toHaveProperty(k));
  });

  test('muestra el detalle de validación del backend', async () => {
    mockApi.mockImplementation(route({ 'PUT /facturas/f1': () => res({ error: 'Validación fallida', details: ['monto: debe ser un número positivo'] }, false) }));
    render(<Facturas userId="u1" />);
    fireEvent.click(within(await rowOf('FAC-2026-001')).getByTitle('Editar'));
    await screen.findByRole('heading', { name: 'Editar Factura' });
    submitForm();
    await waitFor(() => expect(showError).toHaveBeenCalledWith('monto: debe ser un número positivo'));
  });

  test('eliminar pide confirmación', async () => {
    render(<Facturas userId="u1" />);
    const row = await rowOf('FAC-2026-001');
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(within(row).getByTitle('Eliminar'));
    expect(mockApi).not.toHaveBeenCalledWith('/facturas/f1', { method: 'DELETE' });

    fireEvent.click(within(row).getByTitle('Eliminar'));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Factura eliminada'));
    expect(screen.queryByText('FAC-2026-001')).not.toBeInTheDocument();
  });

  test('error del backend al eliminar', async () => {
    mockApi.mockImplementation(route({ 'DELETE /facturas/f1': () => res({ error: 'No tienes permiso para eliminar esta factura' }, false) }));
    render(<Facturas userId="u1" />);
    fireEvent.click(within(await rowOf('FAC-2026-001')).getByTitle('Eliminar'));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('No tienes permiso para eliminar esta factura'));
    expect(screen.getByText('FAC-2026-001')).toBeInTheDocument();
  });

  test('las opciones de retención no generan claves duplicadas en React', async () => {
    const errorSpy = console.error as jest.Mock;
    render(<Facturas userId="u1" />);
    await openNueva();
    expect(errorSpy.mock.calls.flat().join(' ')).not.toMatch(/same key/);
  });

  test('abre la guía de retenciones', async () => {
    render(<Facturas userId="u1" />);
    await openNueva();
    fireEvent.click(screen.getByRole('button', { name: /Guía de Retenciones/ }));
    expect(await screen.findByText(/Guía de Retenciones en Colombia - DIAN/)).toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Terceros from '../Terceros';
import Puc from '../Puc';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const getItem = window.localStorage.getItem as jest.Mock;
const ok = (body: any, okFlag = true) => Promise.resolve({ ok: okFlag, json: () => Promise.resolve(body) });
const setRole = (role: string | null) => getItem.mockImplementation((k: string) => (k === 'role' ? role : null));

const tercero = { _id: 't1', tipo: 'cliente', razonSocial: 'Cliente SA', tipoDocumento: 'NIT', numeroDocumento: '900123', email: 'c@sa.com' };
const cuenta = { _id: 'p1', codigo: '110505', nombre: 'Caja general', naturaleza: 'debito' };

const setInput = (name: string, value: string) =>
  fireEvent.change(document.querySelector(`[name="${name}"]`) as HTMLElement, { target: { value } });

describe('Terceros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.mockImplementation(() => ok({ data: [tercero] }));
  });

  test('lista los terceros del backend', async () => {
    setRole('auxiliar');
    render(<Terceros />);
    expect(screen.getByText('Cargando terceros...')).toBeInTheDocument();
    expect(await screen.findByText('Cliente SA')).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith('/terceros?limit=100');
  });

  test('muestra estado vacío', async () => {
    setRole('auxiliar');
    mockApi.mockImplementation(() => ok({ data: [] }));
    render(<Terceros />);
    expect(await screen.findByText('No hay terceros registrados')).toBeInTheDocument();
  });

  test.each([
    ['administrador', true], ['contador', true], ['analista', false], ['auxiliar', false],
  ])('%s → puede editar/deshabilitar: %p', async (role, canManage) => {
    setRole(role);
    render(<Terceros />);
    await screen.findByText('Cliente SA');
    expect(!!screen.queryByRole('button', { name: 'Editar' })).toBe(canManage);
    expect(!!screen.queryByRole('button', { name: 'Deshabilitar' })).toBe(canManage);
    expect(screen.getByRole('button', { name: /Nuevo Tercero/ })).toBeInTheDocument();
  });

  test('crea un tercero con POST y recarga la lista', async () => {
    setRole('auxiliar');
    render(<Terceros />);
    await screen.findByText('Cliente SA');
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Tercero/ }));
    setInput('razonSocial', 'Proveedor Nuevo');
    setInput('numeroDocumento', '800111');
    setInput('tipo', 'proveedor');
    mockApi.mockImplementationOnce(() => ok({}));
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Tercero creado'));
    const [url, opts] = mockApi.mock.calls.find(c => c[1]?.method === 'POST');
    expect(url).toBe('/terceros');
    expect(JSON.parse(opts.body)).toEqual(expect.objectContaining({ razonSocial: 'Proveedor Nuevo', numeroDocumento: '800111', tipo: 'proveedor' }));
    expect(screen.queryByRole('button', { name: 'Crear' })).not.toBeInTheDocument();
  });

  test('edita con PUT y muestra el error del backend si falla', async () => {
    setRole('contador');
    render(<Terceros />);
    await screen.findByText('Cliente SA');
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    expect(screen.getByText('Editar Tercero')).toBeInTheDocument();
    expect(document.querySelector('[name="razonSocial"]')).toHaveValue('Cliente SA');

    mockApi.mockImplementationOnce(() => ok({ error: 'Ya existe un tercero con ese documento' }, false));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Ya existe un tercero con ese documento'));
    expect(mockApi).toHaveBeenCalledWith('/terceros/t1', expect.objectContaining({ method: 'PUT' }));
  });

  test('deshabilita un tercero y lo quita de la lista', async () => {
    setRole('administrador');
    render(<Terceros />);
    await screen.findByText('Cliente SA');
    mockApi.mockImplementationOnce(() => ok({}));
    fireEvent.click(screen.getByRole('button', { name: 'Deshabilitar' }));
    await waitFor(() => expect(screen.queryByText('Cliente SA')).not.toBeInTheDocument());
    expect(mockApi).toHaveBeenCalledWith('/terceros/t1', { method: 'DELETE' });
  });

  test('error de carga', async () => {
    setRole('auxiliar');
    mockApi.mockRejectedValue(new Error('offline'));
    render(<Terceros />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('No se pudieron cargar los terceros'));
  });
});

describe('Puc', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApi.mockImplementation(() => ok({ data: [cuenta] }));
  });

  test.each([
    ['administrador', true], ['contador', true], ['analista', false], ['auxiliar', false],
  ])('%s → puede crear/editar/deshabilitar cuentas: %p', async (role, canManage) => {
    setRole(role);
    render(<Puc />);
    await screen.findByText('Caja general');
    expect(!!screen.queryByRole('button', { name: /Nueva Cuenta/ })).toBe(canManage);
    expect(!!screen.queryByRole('button', { name: 'Editar' })).toBe(canManage);
    expect(!!screen.queryByRole('button', { name: 'Deshabilitar' })).toBe(canManage);
  });

  test('crea una cuenta', async () => {
    setRole('contador');
    render(<Puc />);
    await screen.findByText('Caja general');
    fireEvent.click(screen.getByRole('button', { name: /Nueva Cuenta/ }));
    setInput('codigo', '110510');
    setInput('nombre', 'Caja menor');
    setInput('naturaleza', 'credito');
    mockApi.mockImplementationOnce(() => ok({}));
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Cuenta creada'));
    const [, opts] = mockApi.mock.calls.find(c => c[1]?.method === 'POST');
    expect(JSON.parse(opts.body)).toEqual(expect.objectContaining({ codigo: '110510', nombre: 'Caja menor', naturaleza: 'credito' }));
  });

  test('muestra el error del backend al guardar', async () => {
    setRole('administrador');
    render(<Puc />);
    await screen.findByText('Caja general');
    fireEvent.click(screen.getByRole('button', { name: 'Editar' }));
    mockApi.mockImplementationOnce(() => ok({ error: 'Ya existe una cuenta PUC con ese código' }, false));
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Ya existe una cuenta PUC con ese código'));
  });

  test('deshabilita una cuenta', async () => {
    setRole('administrador');
    render(<Puc />);
    const row = (await screen.findByText('Caja general')).closest('tr') as HTMLElement;
    mockApi.mockImplementationOnce(() => ok({}));
    fireEvent.click(within(row).getByRole('button', { name: 'Deshabilitar' }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Cuenta deshabilitada'));
    expect(screen.queryByText('Caja general')).not.toBeInTheDocument();
  });

  test('cerrar el modal con Cancelar no envía nada', async () => {
    setRole('administrador');
    render(<Puc />);
    await screen.findByText('Caja general');
    fireEvent.click(screen.getByRole('button', { name: /Nueva Cuenta/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('button', { name: 'Crear' })).not.toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledTimes(1);
  });
});

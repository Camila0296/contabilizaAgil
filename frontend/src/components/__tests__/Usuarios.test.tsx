import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Usuarios from '../Usuarios';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const res = (body: any, ok = true, status = 200) => Promise.resolve({ ok, status, json: () => Promise.resolve(body) });

const roles = [{ _id: 'r1', name: 'administrador' }, { _id: 'r2', name: 'contador' }];
const usuarios = [
  { _id: 'u1', nombres: 'Ana', apellidos: 'Admin', email: 'ana@t.com', role: roles[0], activo: true, approved: true, telefono: '3001234567', numeroDocumento: '123456', direccion: 'Calle 1 # 2-3', ciudad: 'Bogotá' },
  { _id: 'u2', nombres: 'Luis', apellidos: 'Pendiente', email: 'luis@t.com', role: roles[1], activo: false, approved: false },
];

const route = (overrides: Record<string, () => any> = {}) => (url: string, opts?: any) => {
  const key = `${opts?.method || 'GET'} ${url}`;
  if (overrides[key]) return overrides[key]();
  if (url.startsWith('/users?')) return res({ data: usuarios });
  if (url === '/roles') return res(roles);
  return res({});
};

const field = (name: string) => document.querySelector(`[name="${name}"]`) as HTMLInputElement;
const setField = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const rowOf = async (name: string) => (await screen.findByText(name)).closest('tr') as HTMLElement;

const fillValidForm = () => {
  setField('nombres', 'Nuevo');
  setField('apellidos', 'Usuario');
  setField('email', 'nuevo@t.com');
  setField('telefono', '300-123-4567');
  setField('numeroDocumento', '1.234.567');
  setField('direccion', 'Calle 10 # 5-20');
  setField('ciudad', 'Cali');
  setField('role', 'r2');
};

describe('Usuarios', () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockApi.mockImplementation(route());
  });
  afterEach(() => jest.restoreAllMocks());

  test('lista hasta 100 usuarios con su rol, estado y aprobación', async () => {
    render(<Usuarios />);
    const ana = await rowOf('Ana Admin');
    const luis = await rowOf('Luis Pendiente');
    expect(mockApi).toHaveBeenCalledWith('/users?limit=100');
    expect(within(ana).getByText('administrador')).toHaveClass('bg-primary-100');
    expect(within(ana).getByText('Activo')).toBeInTheDocument();
    expect(within(luis).getByText('Inactivo')).toBeInTheDocument();
    expect(within(luis).getByText('Pendiente')).toBeInTheDocument();
    expect(within(ana).queryByTitle('Aprobar')).not.toBeInTheDocument();
    expect(within(luis).getByTitle('Aprobar')).toBeInTheDocument();
  });

  test('crear usuario: valida, limpia teléfono/documento y envía el rol seleccionado', async () => {
    render(<Usuarios />);
    await rowOf('Ana Admin');
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Usuario/ }));
    await screen.findByRole('option', { name: 'contador' });

    // submit directo: omite la validación nativa (required) para probar la del componente
    fireEvent.submit(screen.getByRole('button', { name: 'Crear Usuario' }).closest('form') as HTMLFormElement);
    expect(await screen.findByText('El nombres es requerido')).toBeInTheDocument();
    expect(screen.getByText('El rol es requerido')).toBeInTheDocument();
    expect(mockApi).not.toHaveBeenCalledWith('/users', expect.objectContaining({ method: 'POST' }));

    fillValidForm();
    expect(field('telefono')).toHaveValue('3001234567');
    expect(field('numeroDocumento')).toHaveValue('1234567');
    fireEvent.click(screen.getByRole('button', { name: 'Crear Usuario' }));

    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Usuario creado'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/users' && c[1]?.method === 'POST');
    expect(JSON.parse(opts.body)).toEqual(expect.objectContaining({
      nombres: 'Nuevo', email: 'nuevo@t.com', telefono: '3001234567', numeroDocumento: '1234567', role: 'r2',
    }));
  });

  test('valida un campo al salir de él', async () => {
    render(<Usuarios />);
    await rowOf('Ana Admin');
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Usuario/ }));
    await screen.findByRole('option', { name: 'contador' });
    setField('email', 'malo');
    fireEvent.blur(field('email'));
    expect(await screen.findByText('El correo electrónico no es válido')).toBeInTheDocument();
    expect(field('email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('muestra el error del backend al crear', async () => {
    mockApi.mockImplementation(route({ 'POST /users': () => res({ error: 'Email ya registrado' }, false, 400) }));
    render(<Usuarios />);
    await rowOf('Ana Admin');
    fireEvent.click(screen.getByRole('button', { name: /Nuevo Usuario/ }));
    await screen.findByRole('option', { name: 'contador' });
    fillValidForm();
    fireEvent.click(screen.getByRole('button', { name: 'Crear Usuario' }));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Email ya registrado'));
    expect(screen.getByRole('button', { name: 'Crear Usuario' })).toBeInTheDocument();
  });

  test('editar precarga los datos y hace PUT', async () => {
    render(<Usuarios />);
    fireEvent.click(within(await rowOf('Ana Admin')).getByTitle('Editar'));
    await screen.findByText('Editar Usuario');
    expect(field('nombres')).toHaveValue('Ana');
    expect(field('role')).toHaveValue('r1');
    expect(field('activo')).toBeChecked();
    setField('ciudad', 'Medellín');
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar Usuario' }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Usuario actualizado'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/users/u1' && c[1]?.method === 'PUT');
    expect(JSON.parse(opts.body).ciudad).toBe('Medellín');
  });

  test('activar/desactivar y aprobar cambian el campo correspondiente', async () => {
    render(<Usuarios />);
    fireEvent.click(within(await rowOf('Ana Admin')).getByTitle('Desactivar'));
    await waitFor(() => expect(mockApi).toHaveBeenCalledWith('/users/u1', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ activo: false }) })));

    fireEvent.click(within(await rowOf('Luis Pendiente')).getByTitle('Aprobar'));
    await waitFor(() => expect(mockApi).toHaveBeenCalledWith('/users/u2', expect.objectContaining({ method: 'PUT', body: JSON.stringify({ approved: true }) })));
  });

  test('deshabilitar pide confirmación, recarga la lista y no dice "eliminado"', async () => {
    render(<Usuarios />);
    const callsBefore = () => mockApi.mock.calls.filter(c => c[0] === '/users?limit=100').length;
    fireEvent.click(within(await rowOf('Luis Pendiente')).getByTitle('Eliminar'));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Usuario deshabilitado'));
    expect(confirmSpy.mock.calls[0][0]).toMatch(/deshabilitar/);
    expect(mockApi).toHaveBeenCalledWith('/users/u2', { method: 'DELETE' });
    await waitFor(() => expect(callsBefore()).toBe(2));
  });

  test('deshabilitar cancelado no llama al backend; error del backend se muestra', async () => {
    confirmSpy.mockReturnValueOnce(false);
    mockApi.mockImplementation(route({ 'DELETE /users/u1': () => res({ error: 'No puedes deshabilitar tu propia cuenta' }, false, 400) }));
    render(<Usuarios />);
    const ana = await rowOf('Ana Admin');
    fireEvent.click(within(ana).getByTitle('Eliminar'));
    expect(mockApi).not.toHaveBeenCalledWith('/users/u1', { method: 'DELETE' });

    fireEvent.click(within(ana).getByTitle('Eliminar'));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('No puedes deshabilitar tu propia cuenta'));
  });

  test('informa si no se pueden cargar los roles', async () => {
    mockApi.mockImplementation(route({ 'GET /roles': () => res({}, false, 403) }));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<Usuarios />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Error al cargar roles: 403'));
  });
});

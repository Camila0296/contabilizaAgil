import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Perfil from '../Perfil';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const getItem = window.localStorage.getItem as jest.Mock;
const res = (body: any, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

const perfil = {
  _id: 'u1', nombres: 'Ana', apellidos: 'Pérez', email: 'ana@t.com',
  role: { name: 'administrador' }, activo: true, approved: true, createdAt: '2026-01-15T15:00:00.000Z',
};

const field = (name: string) => document.querySelector(`[name="${name}"]`) as HTMLInputElement;
const setField = (name: string, value: string) => fireEvent.change(field(name), { target: { value } });
const submit = () => fireEvent.submit(screen.getByRole('button', { name: 'Guardar Cambios' }).closest('form') as HTMLFormElement);
const lastPut = () => mockApi.mock.calls.filter(c => c[1]?.method === 'PUT').pop();

describe('Perfil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    getItem.mockImplementation((k: string) => (k === 'token' ? 'tok' : null));
    mockApi.mockImplementation((url: string, opts?: any) => (opts?.method === 'PUT' ? res({}) : res(perfil)));
  });
  afterEach(() => jest.restoreAllMocks());

  test('muestra los datos y el estado de la cuenta', async () => {
    render(<Perfil />);
    expect(await screen.findByText('ana@t.com')).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith('/users/me');
    expect(screen.getByText('administrador')).toHaveClass('bg-primary-100');
    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText('Aprobado')).toBeInTheDocument();
  });

  test('sin token no llama al backend y avisa', async () => {
    getItem.mockReturnValue(null);
    render(<Perfil />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('No se encontró el token de autenticación'));
    expect(mockApi).not.toHaveBeenCalled();
  });

  test('muestra el mensaje de error del backend al cargar', async () => {
    mockApi.mockImplementation(() => res({ error: 'Cuenta deshabilitada' }, false));
    render(<Perfil />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Cuenta deshabilitada'));
  });

  test('actualiza nombres y email sin enviar contraseña', async () => {
    render(<Perfil />);
    fireEvent.click(await screen.findByRole('button', { name: /Editar Perfil/ }));
    setField('nombres', 'Ana María');
    setField('email', 'ana.maria@t.com');
    submit();
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Perfil actualizado exitosamente'));
    const [url, opts] = lastPut();
    expect(url).toBe('/users/me');
    expect(JSON.parse(opts.body)).toEqual({ nombres: 'Ana María', apellidos: 'Pérez', email: 'ana.maria@t.com' });
  });

  test('cambiar contraseña exige la actual, contraseña fuerte y confirmación', async () => {
    render(<Perfil />);
    fireEvent.click(await screen.findByRole('button', { name: /Cambiar Contraseña/ }));

    setField('newPassword', 'debil');
    setField('confirmPassword', 'otra');
    submit();
    expect(await screen.findByText('La contraseña debe tener al menos 8 caracteres')).toBeInTheDocument();
    expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument();
    expect(screen.getByText('Ingresa tu contraseña actual para cambiarla')).toBeInTheDocument();
    expect(lastPut()).toBeUndefined();

    setField('currentPassword', 'Actual#123');
    setField('newPassword', 'Nueva#2026');
    setField('confirmPassword', 'Nueva#2026');
    submit();
    await waitFor(() => expect(showSuccess).toHaveBeenCalled());
    expect(JSON.parse(lastPut()[1].body)).toEqual(expect.objectContaining({ currentPassword: 'Actual#123', password: 'Nueva#2026' }));
  });

  test('muestra el error del backend (p. ej. contraseña actual incorrecta)', async () => {
    mockApi.mockImplementation((url: string, opts?: any) =>
      opts?.method === 'PUT' ? res({ error: 'Contraseña actual incorrecta' }, false) : res(perfil));
    render(<Perfil />);
    fireEvent.click(await screen.findByRole('button', { name: /Editar Perfil/ }));
    setField('currentPassword', 'Mala#1234');
    setField('newPassword', 'Nueva#2026');
    setField('confirmPassword', 'Nueva#2026');
    submit();
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Contraseña actual incorrecta'));
  });

  test('valida nombres y email', async () => {
    render(<Perfil />);
    fireEvent.click(await screen.findByRole('button', { name: /Editar Perfil/ }));
    setField('nombres', '');
    setField('email', 'malo');
    submit();
    expect(await screen.findByText('El nombres es requerido')).toBeInTheDocument();
    expect(screen.getByText('El correo electrónico no es válido')).toBeInTheDocument();
  });

  test('cerrar sesión llama a onLogout', async () => {
    const onLogout = jest.fn();
    render(<Perfil onLogout={onLogout} />);
    fireEvent.click(await screen.findByRole('button', { name: /Cerrar Sesión/ }));
    expect(onLogout).toHaveBeenCalled();
  });
});

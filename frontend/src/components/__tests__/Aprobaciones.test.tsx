import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import Aprobaciones, { documentoSrc } from '../Aprobaciones';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const res = (body: any, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

const PNG = 'data:image/png;base64,iVBORw0KGgo=';
const pendientes = [
  { _id: 'u1', nombres: 'Ana', apellidos: 'Pérez', email: 'ana@t.com', tipoDocumento: 'CC', numeroDocumento: '123456', role: { _id: 'r', name: 'auxiliar' }, approved: false, activo: true, documentoIdentidad: { tipo: 'image/png', fechaCargue: '2026-01-01' } },
  { _id: 'u2', nombres: 'Luis', apellidos: 'Gómez', email: 'luis@t.com', role: { _id: 'r', name: 'auxiliar' }, approved: false, activo: true },
];

const rowOf = async (name: string) => (await screen.findByText(name)).closest('tr') as HTMLElement;

describe('Aprobaciones', () => {
  let confirmSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);
    mockApi.mockImplementation((url: string) =>
      url.startsWith('/aprobaciones/pendientes') ? res({ data: pendientes }) : res({}));
  });
  afterEach(() => confirmSpy.mockRestore());

  test('carga las solicitudes desde el endpoint de pendientes (sin depender de la paginación de /users)', async () => {
    render(<Aprobaciones />);
    expect(screen.getByText('Cargando solicitudes...')).toBeInTheDocument();
    await rowOf('Ana Pérez');
    expect(mockApi).toHaveBeenCalledWith('/aprobaciones/pendientes?limit=100');
    expect(screen.getByText('CC 123456')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aprobar Todos \(2\)/ })).toBeInTheDocument();
  });

  test('estado vacío oculta "Aprobar Todos"', async () => {
    mockApi.mockImplementation(() => res({ data: [] }));
    render(<Aprobaciones />);
    expect(await screen.findByText('No hay solicitudes pendientes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aprobar Todos/ })).not.toBeInTheDocument();
  });

  test('indica si el documento fue cargado y solo permite verlo en ese caso', async () => {
    render(<Aprobaciones />);
    const ana = await rowOf('Ana Pérez');
    const luis = await rowOf('Luis Gómez');
    expect(within(ana).getByText('Cargado')).toBeInTheDocument();
    expect(within(luis).getByText('Pendiente')).toBeInTheDocument();
    expect(within(ana).getByRole('button', { name: 'Ver' })).toBeEnabled();
    expect(within(luis).getByRole('button', { name: 'Ver' })).toBeDisabled();
  });

  test('aprobar usa el endpoint que aprueba y reactiva la cuenta', async () => {
    render(<Aprobaciones />);
    fireEvent.click(within(await rowOf('Ana Pérez')).getByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Usuario aprobado exitosamente'));
    expect(mockApi).toHaveBeenCalledWith('/aprobaciones/u1/aprobar', { method: 'PUT' });
  });

  test('muestra el error del backend al aprobar', async () => {
    mockApi.mockImplementation((url: string) =>
      url.startsWith('/aprobaciones/pendientes') ? res({ data: pendientes }) : res({ error: 'Usuario ya está aprobado' }, false));
    render(<Aprobaciones />);
    fireEvent.click(within(await rowOf('Ana Pérez')).getByRole('button', { name: 'Aprobar' }));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Usuario ya está aprobado'));
  });

  test('rechazar pide confirmación y no hace nada si se cancela', async () => {
    confirmSpy.mockReturnValue(false);
    render(<Aprobaciones />);
    fireEvent.click(within(await rowOf('Ana Pérez')).getByRole('button', { name: 'Rechazar' }));
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockApi).not.toHaveBeenCalledWith('/users/u1/reject', expect.anything());
  });

  test('rechazar confirmado elimina la solicitud', async () => {
    render(<Aprobaciones />);
    fireEvent.click(within(await rowOf('Ana Pérez')).getByRole('button', { name: 'Rechazar' }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Solicitud rechazada y usuario eliminado'));
    expect(mockApi).toHaveBeenCalledWith('/users/u1/reject', { method: 'DELETE' });
  });

  test('aprobar todos envía los ids en una sola petición', async () => {
    render(<Aprobaciones />);
    await rowOf('Ana Pérez');
    fireEvent.click(screen.getByRole('button', { name: /Aprobar Todos/ }));
    await waitFor(() => expect(showSuccess).toHaveBeenCalledWith('Todas las solicitudes han sido aprobadas'));
    const [, opts] = mockApi.mock.calls.find(c => c[0] === '/aprobaciones/batch/aprobar');
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ ids: ['u1', 'u2'] });
  });

  test('aprobar todos informa el error si el backend falla', async () => {
    mockApi.mockImplementation((url: string) =>
      url.startsWith('/aprobaciones/pendientes') ? res({ data: pendientes }) : res({}, false));
    render(<Aprobaciones />);
    await rowOf('Ana Pérez');
    fireEvent.click(screen.getByRole('button', { name: /Aprobar Todos/ }));
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Error al aprobar solicitudes'));
    expect(showSuccess).not.toHaveBeenCalled();
  });

  test('ver documento abre el modal con la imagen y se puede cerrar', async () => {
    mockApi.mockImplementation((url: string) =>
      url.startsWith('/aprobaciones/pendientes') ? res({ data: pendientes })
        : url === '/users/u1/documento' ? res({ documentoIdentidad: { tipo: 'image/png', datos: PNG } }) : res({}));
    render(<Aprobaciones />);
    fireEvent.click(within(await rowOf('Ana Pérez')).getByRole('button', { name: 'Ver' }));
    const img = await screen.findByAltText('Documento de identidad');
    expect(img).toHaveAttribute('src', PNG);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByAltText('Documento de identidad')).not.toBeInTheDocument();
  });

  test('error de carga', async () => {
    mockApi.mockRejectedValue(new Error('offline'));
    render(<Aprobaciones />);
    await waitFor(() => expect(showError).toHaveBeenCalledWith('No se pudieron cargar las solicitudes'));
  });
});

describe('documentoSrc', () => {
  test('reconstruye el data URI con el tipo permitido', () => {
    expect(documentoSrc({ tipo: 'image/png', datos: PNG })).toBe(PNG);
    expect(documentoSrc({ tipo: 'application/pdf', datos: 'JVBERi0=' })).toBe('data:application/pdf;base64,JVBERi0=');
  });

  test.each([
    [{ tipo: 'text/html', datos: 'PGgxPg==' }],
    [{ tipo: 'application/pdf', datos: 'data:text/html,<script>alert(1)</script>' }],
    [{ tipo: 'image/png', datos: '' }],
    [{}],
  ])('rechaza contenido no permitido (%#)', (doc) => {
    expect(documentoSrc(doc)).toBeNull();
  });

  test('un tipo declarado como PDF con contenido HTML no se incrusta como HTML', () => {
    const src = documentoSrc({ tipo: 'application/pdf', datos: 'data:text/html;base64,PGgxPg==' });
    expect(src).toBe('data:application/pdf;base64,PGgxPg==');
  });
});

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecuperarDocumento from '../RecuperarDocumento';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

const mockApi = apiFetch as jest.Mock;

const fill = (email: string, doc: string) => {
  fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: email } });
  fireEvent.change(screen.getByLabelText('Número de documento'), { target: { value: doc } });
};
const upload = () => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [new File(['x'], 'cedula.png', { type: 'image/png' })] } });
  fireEvent.click(screen.getByRole('button', { name: 'Completar cargue' }));
};

describe('RecuperarDocumento', () => {
  beforeEach(() => jest.clearAllMocks());

  test('el número de documento solo acepta dígitos', () => {
    render(<RecuperarDocumento onBack={jest.fn()} />);
    fill('a@b.com', '12.345-ab67');
    expect(screen.getByLabelText('Número de documento')).toHaveValue('1234567');
  });

  test('exige correo y documento antes de enviar', async () => {
    render(<RecuperarDocumento onBack={jest.fn()} />);
    upload();
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Ingresa tu correo y número de documento'));
    expect(mockApi).not.toHaveBeenCalled();
  });

  test('envía los datos al endpoint público y muestra la confirmación', async () => {
    mockApi.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
    const onBack = jest.fn();
    render(<RecuperarDocumento onBack={onBack} />);
    fill('ana@test.com', '1234567');
    upload();

    await screen.findByText('¡Listo!');
    const [path, options] = mockApi.mock.calls[0];
    expect(path).toBe('/auth/documento-pendiente');
    expect(JSON.parse(options.body)).toEqual(expect.objectContaining({ email: 'ana@test.com', numeroDocumento: '1234567', tipo: 'image/png' }));
    expect(showSuccess).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Volver a iniciar sesión' }));
    expect(onBack).toHaveBeenCalled();
  });

  test('muestra el error del backend y permanece en el formulario', async () => {
    mockApi.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: 'Datos no coinciden o la cuenta no existe' }) });
    render(<RecuperarDocumento onBack={jest.fn()} />);
    fill('ana@test.com', '1234567');
    upload();
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Datos no coinciden o la cuenta no existe'));
    expect(screen.queryByText('¡Listo!')).not.toBeInTheDocument();
  });

  test('error de red', async () => {
    mockApi.mockRejectedValue(new Error('offline'));
    render(<RecuperarDocumento onBack={jest.fn()} />);
    fill('ana@test.com', '1234567');
    upload();
    await waitFor(() => expect(showError).toHaveBeenCalledWith('Error de conexión'));
  });
});

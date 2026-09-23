import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Register from '../Register';
import { apiFetch } from '../../api';
import { showSuccess, showError } from '../../utils/alerts';

// Mock de las funciones de alerta
jest.mock('../../utils/alerts', () => ({
  showSuccess: jest.fn(),
  showError: jest.fn(),
}));

// Mock de la API
jest.mock('../../api', () => ({
  apiFetch: jest.fn(),
}));

describe('Register Component', () => {
  const mockOnRegisterSuccess = jest.fn();
  const mockApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Llena los campos de seguridad requeridos que no son el foco de cada test
  // (teléfono, número de documento, dirección, ciudad)
  const fillSecurityFields = async () => {
    await userEvent.type(screen.getByLabelText(/teléfono/i), '3001234567');
    await userEvent.type(screen.getByLabelText(/número de documento/i), '1234567890');
    await userEvent.type(screen.getByLabelText(/dirección/i), 'Calle Principal #123');
    await userEvent.type(screen.getByLabelText(/ciudad/i), 'Bogota');
  };

  it('should render registration form', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);
    
    expect(screen.getByRole('heading', { name: /crear cuenta/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Nombres')).toBeInTheDocument();
    expect(screen.getByLabelText('Apellidos')).toBeInTheDocument();
    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
    
    // Verificamos los campos de contraseña por su id
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument();
  });

  it('should update form data on input change', () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);
    
    // Usamos getByPlaceholderText para los inputs
    const nombresInput = screen.getByLabelText('Nombres');
    const emailInput = screen.getByLabelText('Correo electrónico');
    
    fireEvent.change(nombresInput, { target: { value: 'Juan' } });
    fireEvent.change(emailInput, { target: { value: 'juan@example.com' } });
    
    expect(nombresInput).toHaveValue('Juan');
    expect(emailInput).toHaveValue('juan@example.com');
  });

  it('should handle form input changes', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);
    
    // Usamos getByPlaceholderText para los inputs de contraseña
    const nombresInput = screen.getByLabelText('Nombres');
    const apellidosInput = screen.getByLabelText('Apellidos');
    const emailInput = screen.getByLabelText('Correo electrónico');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    
    await userEvent.type(nombresInput, 'Juan');
    await userEvent.type(apellidosInput, 'Pérez');
    await userEvent.type(emailInput, 'juan@example.com');
    await userEvent.type(passwordInput, 'Password123!');
    await userEvent.type(confirmPasswordInput, 'Password123!');

    expect(nombresInput).toHaveValue('Juan');
    expect(apellidosInput).toHaveValue('Pérez');
    expect(emailInput).toHaveValue('juan@example.com');
    expect(passwordInput).toHaveValue('Password123!');
    expect(confirmPasswordInput).toHaveValue('Password123!');
  });

  it('should show error when passwords do not match', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);

    // Llenar los campos requeridos con datos válidos
    await userEvent.type(screen.getByLabelText('Nombres'), 'Test');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'User');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await fillSecurityFields();

    // Establecer contraseñas que NO coinciden pero que SÍ son fuertes
    await userEvent.type(screen.getByLabelText('Contraseña'), 'Password123!');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'DifferentPass123!');

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    // Verificar que el error se muestra en la UI (no como alert, sino en validación)
    await waitFor(() => {
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument();
    });

    // Verificar que NO se llamó a la API (validación previno el envío)
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('should show error when password does not meet strength requirements', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);

    // Llenar los campos requeridos
    await userEvent.type(screen.getByLabelText('Nombres'), 'Test');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'User');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    await fillSecurityFields();

    // Establecer contraseña débil (sin mayúscula, número ni carácter especial)
    await userEvent.type(screen.getByLabelText('Contraseña'), 'weak');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'weak');

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    // Verificar que se muestra el error en la UI (validación de contraseña débil)
    await waitFor(() => {
      // El mensaje puede ser sobre 8 caracteres, mayúscula, minúscula, número o carácter especial
      expect(screen.getByText(/contraseña debe tener al menos 8 caracteres|incluir mayúscula|incluir minúscula|incluir número|incluir carácter especial/i)).toBeInTheDocument();
    });

    // Verificar que NO se llamó a la API (validación previno el envío)
    expect(mockApiFetch).not.toHaveBeenCalled();
  });

  it('should handle successful registration', async () => {
    // Configurar el mock de la API
    const mockResponse = {
      ok: true,
      json: async () => ({ status: 'Registro exitoso', token: 'fake-jwt-token', user: { email: 'juan@example.com' } })
    };
    mockApiFetch.mockResolvedValueOnce(mockResponse as Response);

    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);

    // Llenar el formulario
    await userEvent.type(screen.getByLabelText('Nombres'), 'Juan');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'Pérez');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'juan@example.com');
    await fillSecurityFields();

    // Usar fireEvent.change para los campos de contraseña
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Password123!' } });

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    // Verificar que se llamó a la API con los datos correctos
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalledWith('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: 'Juan',
          apellidos: 'Pérez',
          email: 'juan@example.com',
          telefono: '3001234567',
          tipoDocumento: 'CC',
          numeroDocumento: '1234567890',
          direccion: 'Calle Principal #123',
          ciudad: 'Bogota',
          password: 'Password123!'
        }),
      });

      // Verificar que se mostró el mensaje de éxito
      expect(showSuccess).toHaveBeenCalledWith('Registro exitoso. Tu cuenta está pendiente de aprobación.');
    });

    // Tras el registro exitoso, se muestra el paso de carga de documento
    // (el registro aún no está "completo" hasta que el usuario carga o lo omite)
    expect(await screen.findByRole('heading', { name: /verifica tu identidad/i })).toBeInTheDocument();
    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();

    // Omitir la carga de documento debe completar el flujo
    fireEvent.click(screen.getByRole('button', { name: /omitir por ahora/i }));
    expect(mockOnRegisterSuccess).toHaveBeenCalled();
  });

  it('should handle registration error', async () => {
    const errorMessage = 'El correo ya está registrado';

    // Configurar el mock de la API para simular un error
    const mockErrorResponse = {
      ok: false,
      json: async () => ({ error: errorMessage })
    };
    mockApiFetch.mockResolvedValueOnce(mockErrorResponse as Response);

    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);

    // Llenar el formulario
    await userEvent.type(screen.getByLabelText('Nombres'), 'Juan');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'Pérez');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'existente@example.com');
    await fillSecurityFields();

    // Usar fireEvent.change para los campos de contraseña
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Password123!' } });

    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    // Verificar que se mostró el mensaje de error
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
      expect(showError).toHaveBeenCalledWith(errorMessage);
    });
  });
});

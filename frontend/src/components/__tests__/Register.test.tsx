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
    await userEvent.type(passwordInput, 'password123');
    await userEvent.type(confirmPasswordInput, 'password123');

    expect(nombresInput).toHaveValue('Juan');
    expect(apellidosInput).toHaveValue('Pérez');
    expect(emailInput).toHaveValue('juan@example.com');
    expect(passwordInput).toHaveValue('password123');
    expect(confirmPasswordInput).toHaveValue('password123');
  });

  it('should show error when passwords do not match', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);
    
    // Llenar los campos requeridos
    await userEvent.type(screen.getByLabelText('Nombres'), 'Test');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'User');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    
    // Establecer contraseñas que no coinciden
    await userEvent.type(screen.getByLabelText('Contraseña'), 'password123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), 'different123');
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    
    // Verificar que se muestra el error correcto
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('Las contraseñas no coinciden');
    });
  });

  it('should show error when password is too short', async () => {
    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);
    
    // Llenar los campos requeridos
    await userEvent.type(screen.getByLabelText('Nombres'), 'Test');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'User');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'test@example.com');
    
    // Establecer contraseña demasiado corta
    await userEvent.type(screen.getByLabelText('Contraseña'), '123');
    await userEvent.type(screen.getByLabelText('Confirmar contraseña'), '123');
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));
    
    // Verificar que se muestra el error correcto
    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith('La contraseña debe tener al menos 6 caracteres');
    });
  });

  it('should handle successful registration', async () => {
    // Configurar el mock de la API
    const mockResponse = {
      ok: true,
      json: async () => ({ message: 'User registered successfully' })
    };
    mockApiFetch.mockResolvedValueOnce(mockResponse as Response);

    render(<Register onRegisterSuccess={mockOnRegisterSuccess} />);
    
    // Llenar el formulario
    await userEvent.type(screen.getByLabelText('Nombres'), 'Juan');
    await userEvent.type(screen.getByLabelText('Apellidos'), 'Pérez');
    await userEvent.type(screen.getByLabelText('Correo electrónico'), 'juan@example.com');
    
    // Usar fireEvent.change para los campos de contraseña
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } });
    
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
          password: 'password123'
        }),
      });
      
      // Verificar que se mostró el mensaje de éxito
      expect(showSuccess).toHaveBeenCalledWith('Registro exitoso. Tu cuenta está pendiente de aprobación.');
      
      // Verificar que se llamó a la función de éxito
      expect(mockOnRegisterSuccess).toHaveBeenCalled();
    });
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
    
    // Usar fireEvent.change para los campos de contraseña
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'password123' } });
    
    // Enviar el formulario
    fireEvent.click(screen.getByRole('button', { name: /crear cuenta/i }));

    // Verificar que se mostró el mensaje de error
    await waitFor(() => {
      expect(mockApiFetch).toHaveBeenCalled();
      expect(showError).toHaveBeenCalledWith(errorMessage);
    });
  });
});

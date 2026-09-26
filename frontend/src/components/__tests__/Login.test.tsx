import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../Login';

// Mock de la función de navegación
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock de la API
jest.mock('../../api', () => ({
  apiFetch: jest.fn(),
}));

jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

describe('Login Component', () => {
  const mockOnLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  it('should render form fields correctly', () => {
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it('should handle form input changes', async () => {
    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
  });

  it('should handle successful login', async () => {
    const mockLoginResponse = {
      token: 'test-token',
      user: {
        id: '1',
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        role: 'user'
      }
    };

    const { apiFetch } = require('../../api');
    apiFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockLoginResponse)
    });

    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith('/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        }),
      });
    });
  });

  it('should handle login error', async () => {
    const { apiFetch } = require('../../api');
    apiFetch.mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ error: 'Credenciales inválidas' })
    });

    render(<Login onLogin={mockOnLogin} />);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'wrongpassword');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalled();
    });
  });

  it('should have password field with correct type', () => {
    render(<Login onLogin={mockOnLogin} />);

    const passwordInput = screen.getByLabelText(/contraseña/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  describe('escenarios de sesión', () => {
    const { apiFetch } = require('../../api');
    const { showSuccess, showError } = require('../../utils/alerts');
    const submit = () => fireEvent.submit(screen.getByRole('button', { name: /iniciar sesión/i }).closest('form') as HTMLFormElement);
    const fill = (email: string, password: string) => {
      fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: email } });
      fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: password } });
    };

    it('guarda la sesión y notifica el rol al iniciar sesión', async () => {
      apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ token: 'tok', user: { id: 'u1', role: 'contador' } }) });
      render(<Login onLogin={mockOnLogin} />);
      fill('ana@test.com', 'Clave#123');
      submit();

      await waitFor(() => expect(mockOnLogin).toHaveBeenCalledWith('contador'));
      expect(localStorage.setItem).toHaveBeenCalledWith('token', 'tok');
      expect(localStorage.setItem).toHaveBeenCalledWith('userId', 'u1');
      expect(localStorage.setItem).toHaveBeenCalledWith('role', 'contador');
      expect(localStorage.setItem).toHaveBeenCalledWith('roles', JSON.stringify(['contador']));
      expect(showSuccess).toHaveBeenCalledWith('Inicio de sesión exitoso');
    });

    it('acepta el rol como objeto { name }', async () => {
      apiFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ token: 'tok', user: { id: 'u1', role: { name: 'analista' } } }) });
      render(<Login onLogin={mockOnLogin} />);
      fill('ana@test.com', 'Clave#123');
      submit();
      await waitFor(() => expect(mockOnLogin).toHaveBeenCalledWith('analista'));
    });

    it.each([
      ['credenciales inválidas', 'Credenciales inválidas'],
      ['cuenta pendiente', 'Cuenta pendiente de aprobación'],
      ['cuenta deshabilitada', 'Cuenta deshabilitada'],
    ])('muestra el error del backend: %s', async (_caso, mensaje) => {
      apiFetch.mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: mensaje }) });
      render(<Login onLogin={mockOnLogin} />);
      fill('ana@test.com', 'Clave#123');
      submit();
      await waitFor(() => expect(showError).toHaveBeenCalledWith(mensaje));
      expect(mockOnLogin).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('error de red', async () => {
      apiFetch.mockRejectedValue(new Error('offline'));
      render(<Login onLogin={mockOnLogin} />);
      fill('ana@test.com', 'Clave#123');
      submit();
      await waitFor(() => expect(showError).toHaveBeenCalledWith('Error de conexión'));
    });

    it('valida email y contraseña antes de llamar al backend', async () => {
      render(<Login onLogin={mockOnLogin} />);
      fill('no-es-email', '');
      submit();
      expect(await screen.findByText('El correo electrónico no es válido')).toBeInTheDocument();
      expect(screen.getByText('La contraseña es requerida')).toBeInTheDocument();
      expect(apiFetch).not.toHaveBeenCalled();
    });

    it('valida el email al salir del campo', async () => {
      render(<Login onLogin={mockOnLogin} />);
      const email = screen.getByLabelText(/correo electrónico/i);
      fireEvent.change(email, { target: { value: 'malo' } });
      fireEvent.blur(email);
      expect(await screen.findByText('El correo electrónico no es válido')).toBeInTheDocument();
      expect(email).toHaveAttribute('aria-invalid', 'true');
    });
  });
}); 
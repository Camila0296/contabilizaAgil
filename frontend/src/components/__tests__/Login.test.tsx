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
}); 
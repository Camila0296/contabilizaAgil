import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AuthPage from '../AuthPage';
import Logo from '../Logo';

jest.mock('../Login', () => ({ __esModule: true, default: ({ onLogin }: any) => <button onClick={() => onLogin('contador')}>login-form</button> }));
jest.mock('../Register', () => ({ __esModule: true, default: ({ onRegisterSuccess }: any) => <button onClick={onRegisterSuccess}>register-form</button> }));
jest.mock('../RecuperarDocumento', () => ({ __esModule: true, default: ({ onBack }: any) => <button onClick={onBack}>recuperar-form</button> }));

describe('AuthPage', () => {
  test('inicia en login y propaga el rol al iniciar sesión', () => {
    const onLogin = jest.fn();
    render(<AuthPage onLogin={onLogin} />);
    fireEvent.click(screen.getByText('login-form'));
    expect(onLogin).toHaveBeenCalledWith('contador');
  });

  test('navega a registro y vuelve a login (por enlace o tras registrarse)', () => {
    render(<AuthPage onLogin={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Regístrate aquí' }));
    expect(screen.getByText('register-form')).toBeInTheDocument();
    expect(screen.queryByText('login-form')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Inicia sesión' }));
    expect(screen.getByText('login-form')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Regístrate aquí' }));
    fireEvent.click(screen.getByText('register-form'));
    expect(screen.getByText('login-form')).toBeInTheDocument();
  });

  test('navega a completar documento y vuelve', () => {
    render(<AuthPage onLogin={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Complétalo aquí' }));
    expect(screen.getByText('recuperar-form')).toBeInTheDocument();
    fireEvent.click(screen.getByText('recuperar-form'));
    expect(screen.getByText('login-form')).toBeInTheDocument();
  });
});

describe('Logo', () => {
  test('renderiza el ícono accesible con el tamaño indicado y sin texto por defecto', () => {
    render(<Logo size={32} />);
    const svg = screen.getByRole('img', { name: 'Contabiliza Ágil' });
    expect(svg).toHaveAttribute('width', '32');
    expect(screen.queryByText('Contabiliza')).not.toBeInTheDocument();
  });

  test('muestra el texto en modo claro u oscuro', () => {
    const { rerender } = render(<Logo withText textMode="dark" />);
    expect(screen.getByText('Contabiliza')).toHaveStyle({ color: '#0f0f23' });
    rerender(<Logo withText textMode="light" />);
    expect(screen.getByText('Contabiliza')).toHaveStyle({ color: '#ffffff' });
  });
});

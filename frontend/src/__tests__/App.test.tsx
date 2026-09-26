import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { apiFetch } from '../api';

jest.mock('../api', () => ({ apiFetch: jest.fn() }));

// Componentes de sección reemplazados por marcadores: aquí se prueba la navegación y la sesión
function mockStub(name: string) {
  return { __esModule: true, default: () => <div>seccion-{name}</div> };
}
jest.mock('../components/Home', () => mockStub('panel'));
jest.mock('../components/Facturas', () => mockStub('facturacion'));
jest.mock('../components/FacturaCartera', () => mockStub('cartera'));
jest.mock('../components/Reportes', () => mockStub('reportes'));
jest.mock('../components/Terceros', () => mockStub('terceros'));
jest.mock('../components/Puc', () => mockStub('puc'));
jest.mock('../components/Usuarios', () => mockStub('usuarios'));
jest.mock('../components/Aprobaciones', () => mockStub('aprobaciones'));
jest.mock('../components/Perfil', () => ({ __esModule: true, default: ({ onLogout }: any) => <button onClick={onLogout}>seccion-perfil-logout</button> }));
jest.mock('../components/AuthPage', () => ({ __esModule: true, default: ({ onLogin }: any) => (
  <div>
    <span>pantalla-login</span>
    <button onClick={() => onLogin('auxiliar')}>login-auxiliar</button>
    <button onClick={() => onLogin('contador')}>login-contador</button>
  </div>
) }));
jest.mock('../components/ChatBot', () => ({ __esModule: true, default: ({ onNavigate }: any) => (
  <button onClick={() => onNavigate('usuarios')}>chat-navegar-usuarios</button>
) }));

const mockApi = apiFetch as jest.Mock;
const storage = window.localStorage as unknown as Record<string, jest.Mock>;

const session = (values: Record<string, string> | null) =>
  storage.getItem.mockImplementation((k: string) => (values ? values[k] ?? null : null));

const MENU = ['Panel de Control', 'Facturación', 'Cartera', 'Reportes', 'Terceros', 'PUC', 'Mi Perfil', 'Usuarios', 'Aprobaciones'];
const visibleMenu = () => MENU.filter(label => screen.queryByText(label, { selector: 'span' }));

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockApi.mockResolvedValue({ ok: true });
  });
  afterEach(() => jest.restoreAllMocks());

  test('sin sesión muestra la pantalla de login y no valida token', async () => {
    session(null);
    render(<App />);
    expect(await screen.findByText('pantalla-login')).toBeInTheDocument();
    expect(mockApi).not.toHaveBeenCalled();
  });

  test('con sesión válida verifica el token con apiFetch y muestra la app', async () => {
    session({ token: 't', role: 'administrador' });
    render(<App />);
    expect(await screen.findByText('seccion-panel')).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith('/auth/verify');
  });

  test('token rechazado limpia toda la sesión y vuelve al login', async () => {
    session({ token: 't', role: 'administrador' });
    mockApi.mockResolvedValue({ ok: false });
    render(<App />);
    expect(await screen.findByText('pantalla-login')).toBeInTheDocument();
    ['token', 'userId', 'role', 'roles'].forEach(k => expect(storage.removeItem).toHaveBeenCalledWith(k));
  });

  test('un error de red no cierra la sesión', async () => {
    session({ token: 't', role: 'contador' });
    mockApi.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);
    expect(await screen.findByText('seccion-panel')).toBeInTheDocument();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  test.each([
    ['administrador', MENU],
    ['contador', MENU.filter(m => !['Usuarios', 'Aprobaciones'].includes(m))],
    ['analista', MENU.filter(m => !['Panel de Control', 'Usuarios', 'Aprobaciones'].includes(m))],
    ['auxiliar', MENU.filter(m => !['Panel de Control', 'Usuarios', 'Aprobaciones'].includes(m))],
  ])('menú visible para %s', async (role, expected) => {
    session({ token: 't', role });
    render(<App />);
    await screen.findByText(/seccion-/);
    expect(visibleMenu()).toEqual(expected);
  });

  test('analista/auxiliar entran a Facturación porque no tienen Panel', async () => {
    session({ token: 't', role: 'analista' });
    render(<App />);
    expect(await screen.findByText('seccion-facturacion')).toBeInTheDocument();
  });

  test('navegar por el menú cambia la sección', async () => {
    session({ token: 't', role: 'administrador' });
    render(<App />);
    await screen.findByText('seccion-panel');
    for (const [label, marker] of [['Cartera', 'cartera'], ['Reportes', 'reportes'], ['Terceros', 'terceros'], ['PUC', 'puc'], ['Usuarios', 'usuarios'], ['Aprobaciones', 'aprobaciones']]) {
      fireEvent.click(screen.getByText(label, { selector: 'span' }));
      expect(await screen.findByText(`seccion-${marker}`)).toBeInTheDocument();
    }
  });

  test('una sección no permitida (p. ej. desde el chatbot) redirige a Facturación', async () => {
    session({ token: 't', role: 'contador' });
    render(<App />);
    await screen.findByText('seccion-panel');
    fireEvent.click(screen.getByText('chat-navegar-usuarios'));
    expect(await screen.findByText('seccion-facturacion')).toBeInTheDocument();
    expect(screen.queryByText('seccion-usuarios')).not.toBeInTheDocument();
  });

  test('al iniciar sesión lleva a la sección según el rol', async () => {
    session(null);
    const { unmount } = render(<App />);
    fireEvent.click(await screen.findByText('login-auxiliar'));
    expect(await screen.findByText('seccion-facturacion')).toBeInTheDocument();
    unmount();

    render(<App />);
    fireEvent.click(await screen.findByText('login-contador'));
    expect(await screen.findByText('seccion-panel')).toBeInTheDocument();
  });

  test('cerrar sesión limpia el almacenamiento', async () => {
    session({ token: 't', role: 'auxiliar' });
    render(<App />);
    await screen.findByText('seccion-facturacion');
    fireEvent.click(screen.getByText('Mi Perfil', { selector: 'span' }));
    fireEvent.click(await screen.findByText('seccion-perfil-logout'));
    await waitFor(() => ['token', 'userId', 'role', 'roles'].forEach(k => expect(storage.removeItem).toHaveBeenCalledWith(k)));
  });
});

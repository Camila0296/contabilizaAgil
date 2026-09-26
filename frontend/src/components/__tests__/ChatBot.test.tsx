import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ChatBot from '../ChatBot';
import { apiFetch } from '../../api';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));

const mockApi = apiFetch as jest.Mock;
const reply = (body: any, ok = true) => Promise.resolve({ ok, json: () => Promise.resolve(body) });

beforeAll(() => {
  // jsdom no implementa scrollIntoView
  Element.prototype.scrollIntoView = jest.fn();
});

const open = () => fireEvent.click(screen.getByRole('button', { name: 'Abrir asistente contable' }));
const send = (text: string, viaEnter = false) => {
  const input = screen.getByPlaceholderText('Escribe tu pregunta...');
  fireEvent.change(input, { target: { value: text } });
  if (viaEnter) fireEvent.keyDown(input, { key: 'Enter' });
  else fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
};

describe('ChatBot', () => {
  beforeEach(() => jest.clearAllMocks());

  test('no se muestra si el usuario no ha iniciado sesión', () => {
    const { container } = render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('se abre con el mensaje de bienvenida y se cierra', () => {
    render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
    open();
    expect(screen.getByText(/Soy tu asesor contable de/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar chat' }));
    expect(screen.queryByPlaceholderText('Escribe tu pregunta...')).not.toBeInTheDocument();
  });

  test('el botón Enviar está deshabilitado con texto vacío', () => {
    render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
    open();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
    fireEvent.change(screen.getByPlaceholderText('Escribe tu pregunta...'), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeDisabled();
  });

  test('envía el historial al backend y muestra la respuesta con formato markdown', async () => {
    mockApi.mockImplementation(() => reply({ reply: 'El **IVA** es del _19%_' }));
    render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
    open();
    send('¿qué es el IVA?', true);

    expect(screen.getByText('¿qué es el IVA?')).toBeInTheDocument();
    expect(await screen.findByText('IVA', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('19%', { selector: 'em' })).toBeInTheDocument();

    const [path, opts] = mockApi.mock.calls[0];
    expect(path).toBe('/chat/message');
    const { messages } = JSON.parse(opts.body);
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: '¿qué es el IVA?' });
    expect(messages[0].role).toBe('assistant');
  });

  test('envía como máximo los últimos 10 mensajes', async () => {
    mockApi.mockImplementation(() => reply({ reply: 'ok' }));
    render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
    open();
    for (let i = 0; i < 6; i++) {
      send(`pregunta ${i}`);
      await waitFor(() => expect(mockApi).toHaveBeenCalledTimes(i + 1));
      await screen.findAllByText('ok');
      await waitFor(() => expect(screen.getByPlaceholderText('Escribe tu pregunta...')).toBeEnabled());
    }
    const { messages } = JSON.parse(mockApi.mock.calls[5][1].body);
    expect(messages).toHaveLength(10);
    expect(messages[9].content).toBe('pregunta 5');
  });

  test('ejecuta la acción de navegación y cierra el chat', async () => {
    jest.useFakeTimers();
    try {
      mockApi.mockImplementation(() => reply({ reply: 'Te llevo a Reportes', action: { type: 'navigate', payload: 'reportes' } }));
      const onNavigate = jest.fn();
      render(<ChatBot currentSection="panel" onNavigate={onNavigate} isLoggedIn />);
      open();
      send('llévame a reportes');
      await act(async () => { await Promise.resolve(); await Promise.resolve(); });
      expect(await screen.findByText('Te llevo a Reportes')).toBeInTheDocument();
      expect(onNavigate).not.toHaveBeenCalled();
      act(() => { jest.advanceTimersByTime(800); });
      expect(onNavigate).toHaveBeenCalledWith('reportes');
      expect(screen.queryByPlaceholderText('Escribe tu pregunta...')).not.toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  test.each([
    ['respuesta HTTP de error', () => reply({ error: 'x' }, false)],
    ['error de red', () => Promise.reject(new Error('offline'))],
  ])('muestra un mensaje de error ante %s', async (_n, impl) => {
    mockApi.mockImplementation(impl);
    render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
    open();
    send('hola');
    expect(await screen.findByText(/ocurrió un error al procesar tu mensaje/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Escribe tu pregunta...')).toBeEnabled();
  });

  describe('mejoras del flujo', () => {
    const getItem = window.localStorage.getItem as jest.Mock;
    const setRole = (role: string) => getItem.mockImplementation((k: string) => (k === 'role' ? role : null));

    test.each([
      ['facturacion', '¿Cuánto es el IVA de 1.000.000?'],
      ['facturacion-cartera', '¿Cuánto me deben?'],
      ['reportes', '¿Cómo exporto a Excel?'],
      ['perfil', '¿Qué puedes hacer?'],
    ])('muestra sugerencias según la sección (%s)', (section, sugerencia) => {
      render(<ChatBot currentSection={section} onNavigate={jest.fn()} isLoggedIn />);
      open();
      expect(screen.getByRole('button', { name: sugerencia })).toBeInTheDocument();
    });

    test('una sugerencia se envía como pregunta y las sugerencias desaparecen', async () => {
      mockApi.mockImplementation(() => reply({ reply: 'Tus clientes te deben $ 1.200.000' }));
      render(<ChatBot currentSection="facturacion-cartera" onNavigate={jest.fn()} isLoggedIn />);
      open();
      fireEvent.click(screen.getByRole('button', { name: '¿Cuánto me deben?' }));

      expect(await screen.findByText(/Tus clientes te deben/)).toBeInTheDocument();
      const { messages } = JSON.parse(mockApi.mock.calls[0][1].body);
      expect(messages[messages.length - 1]).toEqual({ role: 'user', content: '¿Cuánto me deben?' });
      expect(screen.queryByRole('button', { name: '¿Tengo facturas vencidas?' })).not.toBeInTheDocument();
    });

    test('tras un error permite reintentar la misma pregunta sin duplicarla', async () => {
      mockApi
        .mockImplementationOnce(() => Promise.reject(new Error('offline')))
        .mockImplementationOnce(() => reply({ reply: 'Ahora sí respondo' }));
      render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
      open();
      send('¿qué es el PUC?');

      fireEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
      expect(await screen.findByText('Ahora sí respondo')).toBeInTheDocument();
      expect(screen.queryByText(/ocurrió un error/)).not.toBeInTheDocument();
      expect(screen.getAllByText('¿qué es el PUC?')).toHaveLength(1);

      const { messages } = JSON.parse(mockApi.mock.calls[1][1].body);
      expect(messages.filter((m: any) => m.content === '¿qué es el PUC?')).toHaveLength(1);
      expect(messages.some((m: any) => /ocurrió un error/.test(m.content))).toBe(false);
    });

    test('nueva conversación limpia el historial y vuelve a mostrar las sugerencias', async () => {
      mockApi.mockImplementation(() => reply({ reply: 'Respuesta anterior' }));
      render(<ChatBot currentSection="panel" onNavigate={jest.fn()} isLoggedIn />);
      open();
      send('hola');
      await screen.findByText('Respuesta anterior');

      fireEvent.click(screen.getByRole('button', { name: 'Nueva conversación' }));
      expect(screen.queryByText('Respuesta anterior')).not.toBeInTheDocument();
      expect(screen.getByText(/Soy tu asesor contable de/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '¿Cuántas facturas tengo?' })).toBeInTheDocument();
    });

    test('no navega a una sección que el rol no tiene aunque el backend lo pida', async () => {
      jest.useFakeTimers();
      try {
        setRole('auxiliar');
        mockApi.mockImplementation(() => reply({ reply: 'Te llevo a Usuarios', action: { type: 'navigate', payload: 'usuarios' } }));
        const onNavigate = jest.fn();
        render(<ChatBot currentSection="facturacion" onNavigate={onNavigate} isLoggedIn />);
        open();
        send('abre usuarios');
        await act(async () => { await Promise.resolve(); await Promise.resolve(); });
        await screen.findByText('Te llevo a Usuarios');
        act(() => { jest.advanceTimersByTime(1000); });
        expect(onNavigate).not.toHaveBeenCalled();
      } finally {
        jest.useRealTimers();
        getItem.mockReset();
      }
    });
  });
});

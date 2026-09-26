import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Paginacion, { PAGE_SIZE } from '../Paginacion';
import Terceros from '../Terceros';
import { apiFetch } from '../../api';

jest.mock('../../api', () => ({ apiFetch: jest.fn() }));
jest.mock('../../utils/alerts', () => ({ showSuccess: jest.fn(), showError: jest.fn() }));

describe('Paginacion', () => {
  test('no se muestra si hay una sola página o no hay datos', () => {
    const { container, rerender } = render(<Paginacion pagination={null} onPageChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<Paginacion pagination={{ page: 1, limit: 20, total: 5, pages: 1 }} onPageChange={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('muestra el rango y deshabilita "Anterior" en la primera página', () => {
    const onPageChange = jest.fn();
    render(<Paginacion pagination={{ page: 1, limit: 20, total: 45, pages: 3 }} onPageChange={onPageChange} />);
    expect(screen.getByText('Mostrando 1–20 de 45')).toBeInTheDocument();
    expect(screen.getByText('Página 1 de 3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  test('en la última página muestra el rango parcial y deshabilita "Siguiente"', () => {
    const onPageChange = jest.fn();
    render(<Paginacion pagination={{ page: 3, limit: 20, total: 45, pages: 3 }} onPageChange={onPageChange} />);
    expect(screen.getByText('Mostrando 41–45 de 45')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});

describe('Paginación en una pantalla (Terceros)', () => {
  const mockApi = apiFetch as jest.Mock;
  const pagina = (n: number, pages: number, nombres: string[]) => Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      data: nombres.map((razonSocial, i) => ({ _id: `${n}-${i}`, razonSocial, tipo: 'cliente', tipoDocumento: 'NIT', numeroDocumento: `${n}${i}` })),
      pagination: { page: n, limit: PAGE_SIZE, total: (pages - 1) * PAGE_SIZE + nombres.length, pages },
    }),
  });

  beforeEach(() => jest.clearAllMocks());

  test('pide la página siguiente al backend y muestra sus registros', async () => {
    mockApi.mockImplementation((url: string) =>
      url.includes('page=2') ? pagina(2, 2, ['Tercero Página 2']) : pagina(1, 2, ['Tercero Página 1']));
    render(<Terceros />);
    expect(await screen.findByText('Tercero Página 1')).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith(`/terceros?page=1&limit=${PAGE_SIZE}`);

    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Tercero Página 2')).toBeInTheDocument();
    expect(mockApi).toHaveBeenCalledWith(`/terceros?page=2&limit=${PAGE_SIZE}`);
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument();
  });

  test('si la página actual queda vacía vuelve a la anterior', async () => {
    let paginas = 2;
    mockApi.mockImplementation((url: string) => {
      if (url.includes('page=2')) return pagina(2, paginas, paginas === 2 ? ['Único en página 2'] : []);
      return pagina(1, paginas, ['Tercero Página 1']);
    });
    render(<Terceros />);
    await screen.findByText('Tercero Página 1');
    paginas = 1; // el registro de la página 2 se eliminó en otra parte
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(mockApi.mock.calls.filter(c => c[0].includes('page=1')).length).toBe(2));
    expect(await screen.findByText('Tercero Página 1')).toBeInTheDocument();
  });
});

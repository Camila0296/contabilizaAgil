import React from 'react';
import { render } from '@testing-library/react';
import Usuarios from '../Usuarios';
import Terceros from '../Terceros';
import FacturaCartera from '../FacturaCartera';
import Perfil from '../Perfil';
import * as api from '../../api';

jest.mock('../../api');
jest.mock('../../utils/alerts');

const mockApiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>;

describe('Componentes Principales - Tests Básicos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockImplementation((url: string) => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            data: [],
            pagination: { total: 0, page: 1, limit: 10, pages: 0 },
          }),
      } as any);
    });
  });

  describe('Usuarios', () => {
    test('debe renderizar correctamente', () => {
      const { container } = render(<Usuarios />);
      expect(container).toBeTruthy();
    });

    test('debe hacer llamada a API al cargar', async () => {
      render(<Usuarios />);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockApiFetch).toHaveBeenCalled();
    });
  });

  describe('Terceros', () => {
    test('debe renderizar correctamente', () => {
      const { container } = render(<Terceros />);
      expect(container).toBeTruthy();
    });

    test('debe hacer llamada a API al cargar', async () => {
      render(<Terceros />);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockApiFetch).toHaveBeenCalled();
    });
  });

  describe('FacturaCartera', () => {
    test('debe renderizar correctamente', () => {
      const { container } = render(<FacturaCartera userId="test" />);
      expect(container).toBeTruthy();
    });

    test('debe hacer llamada a API al cargar', async () => {
      render(<FacturaCartera userId="test" />);
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(mockApiFetch).toHaveBeenCalled();
    });
  });

  describe('Perfil', () => {
    test('debe renderizar correctamente', () => {
      const { container } = render(<Perfil />);
      expect(container).toBeTruthy();
    });
  });
});

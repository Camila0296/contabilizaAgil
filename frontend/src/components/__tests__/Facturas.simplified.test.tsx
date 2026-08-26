import React from 'react';
import { render } from '@testing-library/react';
import Facturas from '../Facturas';
import * as api from '../../api';

jest.mock('../../api');
jest.mock('../../utils/alerts');

const mockApiFetch = api.apiFetch as jest.MockedFunction<typeof api.apiFetch>;

describe('Facturas Component - Básico', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiFetch.mockImplementation((url: string) => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            data: [],
            pagination: { total: 0, page: 1, limit: 10, pages: 0 },
            nextSuggested: 'FAC-2026-001',
          }),
      } as any);
    });
  });

  test('debe renderizar el componente', () => {
    const { container } = render(<Facturas userId="test-user" />);
    expect(container).toBeTruthy();
  });

  test('debe llamar a la API al cargar', async () => {
    render(<Facturas userId="test-user" />);

    // Esperar a que se llame la API
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockApiFetch).toHaveBeenCalled();
  });
});

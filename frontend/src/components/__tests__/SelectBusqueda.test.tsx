import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SelectBusqueda from '../SelectBusqueda';

const inputOf = () => screen.getByText('Buscar...').parentElement!.querySelector('input') as HTMLInputElement;

describe('SelectBusqueda', () => {
  test('al montar pide las primeras opciones (texto vacío)', async () => {
    const buscar = jest.fn().mockResolvedValue([{ value: '1', label: 'Uno' }]);
    render(<SelectBusqueda placeholder="Buscar..." buscar={buscar} value={null} onChange={jest.fn()} espera={0} />);
    await waitFor(() => expect(buscar).toHaveBeenCalledWith(''));
  });

  test('espera a que se deje de escribir: una sola consulta con el texto final', async () => {
    const buscar = jest.fn().mockResolvedValue([{ value: '1', label: 'ACME SAS' }]);
    render(<SelectBusqueda placeholder="Buscar..." buscar={buscar} value={null} onChange={jest.fn()} espera={50} />);
    await waitFor(() => expect(buscar).toHaveBeenCalledTimes(1));
    buscar.mockClear();

    const input = inputOf();
    for (const texto of ['A', 'AC', 'ACM', 'ACME']) fireEvent.change(input, { target: { value: texto } });

    expect(await screen.findByText('ACME SAS')).toBeInTheDocument();
    expect(buscar).toHaveBeenCalledTimes(1);
    expect(buscar).toHaveBeenCalledWith('ACME');
  });

  test('al elegir una opción la entrega completa (id y etiqueta)', async () => {
    const onChange = jest.fn();
    const buscar = jest.fn().mockResolvedValue([{ value: 't1', label: 'Cliente SA' }]);
    render(<SelectBusqueda placeholder="Buscar..." buscar={buscar} value={null} onChange={onChange} espera={0} />);
    fireEvent.change(inputOf(), { target: { value: 'Cli' } });
    fireEvent.click(await screen.findByText('Cliente SA'));
    expect(onChange).toHaveBeenCalledWith({ value: 't1', label: 'Cliente SA' });
  });

  test('muestra la opción seleccionada aunque no esté en los resultados', () => {
    render(<SelectBusqueda placeholder="Buscar..." buscar={jest.fn().mockResolvedValue([])} value={{ value: 'x', label: 'Guardada' }} onChange={jest.fn()} />);
    expect(screen.getByText('Guardada')).toBeInTheDocument();
  });

  test('sin coincidencias o con error de red muestra "Sin resultados"', async () => {
    const buscar = jest.fn().mockImplementation((texto: string) => (texto ? Promise.reject(new Error('offline')) : Promise.resolve([])));
    render(<SelectBusqueda placeholder="Buscar..." buscar={buscar} value={null} onChange={jest.fn()} espera={0} />);
    fireEvent.change(inputOf(), { target: { value: 'zzz' } });
    expect(await screen.findByText('Sin resultados')).toBeInTheDocument();
  });
});

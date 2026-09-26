import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DocumentoUploader from '../DocumentoUploader';

const selectFile = (file: File) => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  fireEvent.change(input, { target: { files: [file] } });
};

const fileOf = (name: string, type: string, size?: number) => {
  const f = new File(['contenido'], name, { type });
  if (size !== undefined) Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('DocumentoUploader', () => {
  test('el botón está deshabilitado hasta seleccionar un archivo y usa la etiqueta personalizada', () => {
    render(<DocumentoUploader onSubmit={jest.fn()} submitLabel="Subir cédula" />);
    expect(screen.getByRole('button', { name: 'Subir cédula' })).toBeDisabled();
    expect(document.querySelector('input[type="file"]')).toHaveAttribute('accept', 'image/jpeg,image/png,application/pdf');
  });

  test('muestra el archivo seleccionado y lo envía como data URI con su tipo', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined);
    render(<DocumentoUploader onSubmit={onSubmit} />);
    selectFile(fileOf('cedula.png', 'image/png'));

    expect(screen.getByText('Seleccionado: cedula.png')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cargar documento' }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.stringMatching(/^data:image\/png;base64,/), 'image/png'));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Cargar documento' })).toBeEnabled());
  });

  test('rechaza tipos no permitidos y bloquea el envío', () => {
    const onSubmit = jest.fn();
    render(<DocumentoUploader onSubmit={onSubmit} />);
    selectFile(fileOf('foto.gif', 'image/gif'));
    expect(screen.getByText('El archivo debe ser JPG, PNG o PDF')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cargar documento' })).toBeDisabled();
  });

  test('rechaza archivos mayores a 5MB', () => {
    render(<DocumentoUploader onSubmit={jest.fn()} />);
    selectFile(fileOf('grande.pdf', 'application/pdf', 6 * 1024 * 1024));
    expect(screen.getByText('El archivo no puede superar 5MB')).toBeInTheDocument();
  });

  test('muestra "Cargando..." mientras se envía y vuelve a habilitarse al terminar', async () => {
    let resolve!: () => void;
    const onSubmit = jest.fn(() => new Promise<void>((r) => { resolve = r; }));
    render(<DocumentoUploader onSubmit={onSubmit} />);
    selectFile(fileOf('cedula.pdf', 'application/pdf'));
    fireEvent.click(screen.getByRole('button', { name: 'Cargar documento' }));

    expect(await screen.findByRole('button', { name: 'Cargando...' })).toBeDisabled();
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    resolve();
    expect(await screen.findByRole('button', { name: 'Cargar documento' })).toBeEnabled();
  });
});

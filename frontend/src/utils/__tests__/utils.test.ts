import { formatCurrency, formatFecha } from '../format';
import { validateDocumentoFile, fileToBase64, TIPOS_DOCUMENTO_PERMITIDOS, MAX_DOCUMENTO_MB } from '../fileUpload';
import { showSuccess, showError } from '../alerts';
import { apiFetch, API_URL } from '../../api';
import withReactContent from 'sweetalert2-react-content';

const fileOf = (type: string, size = 10) => {
  const f = new File(['x'], 'doc', { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('utils/format - formatCurrency', () => {
  test('formatea en pesos colombianos con 2 decimales', () => {
    const out = formatCurrency(1234567.5);
    expect(out).toMatch(/1\.234\.567,50/);
    expect(out).toMatch(/\$/);
  });

  test('NaN se muestra como $0', () => {
    expect(formatCurrency(NaN)).toBe('$0');
  });

  test('acepta otra moneda y locale', () => {
    expect(formatCurrency(10, 'en-US', 'USD')).toBe('$10.00');
  });
});

describe('utils/format - formatFecha', () => {
  test('una fecha guardada a medianoche UTC no se corre al día anterior', () => {
    expect(formatFecha('2026-03-01T00:00:00.000Z', {}, 'es-CO')).toBe('1/3/2026');
    expect(formatFecha('2026-03-01', { year: 'numeric', month: 'long', day: 'numeric' }, 'es-ES')).toBe('1 de marzo de 2026');
  });

  test.each([null, undefined, '', 'no-es-fecha'])('valores vacíos o inválidos devuelven cadena vacía (%p)', (v) => {
    expect(formatFecha(v as any)).toBe('');
  });
});

describe('utils/fileUpload', () => {
  test('tipos y tamaño máximo coinciden con el backend', () => {
    expect(TIPOS_DOCUMENTO_PERMITIDOS).toEqual(['image/jpeg', 'image/png', 'application/pdf']);
    expect(MAX_DOCUMENTO_MB).toBe(5);
  });

  test('exige un archivo', () => {
    expect(validateDocumentoFile(null)?.message).toMatch(/Selecciona/);
  });

  test.each(['image/jpeg', 'image/png', 'application/pdf'])('acepta %s', (type) => {
    expect(validateDocumentoFile(fileOf(type))).toBeNull();
  });

  test('rechaza otros tipos', () => {
    expect(validateDocumentoFile(fileOf('image/gif'))?.message).toMatch(/JPG, PNG o PDF/);
  });

  test('rechaza archivos de más de 5MB (el límite exacto se acepta)', () => {
    expect(validateDocumentoFile(fileOf('image/png', 5 * 1024 * 1024))).toBeNull();
    expect(validateDocumentoFile(fileOf('image/png', 5 * 1024 * 1024 + 1))?.message).toMatch(/5MB/);
  });

  test('fileToBase64 produce un data URI', async () => {
    const f = new File(['hola'], 'a.txt', { type: 'text/plain' });
    await expect(fileToBase64(f)).resolves.toBe(`data:text/plain;base64,${btoa('hola')}`);
  });
});

describe('utils/alerts', () => {
  const swal = (withReactContent as unknown as () => { fire: jest.Mock })();
  beforeEach(() => swal.fire.mockClear());

  test('showSuccess muestra un toast de éxito', () => {
    showSuccess('Guardado');
    expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'success', text: 'Guardado', toast: true }));
  });

  test('showError muestra un toast de error', () => {
    showError('Falló');
    expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon: 'error', text: 'Falló', toast: true }));
  });
});

describe('api - apiFetch', () => {
  const fetchMock = global.fetch as jest.Mock;
  const getItem = window.localStorage.getItem as jest.Mock;

  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    getItem.mockReset();
  });

  test('usa la URL base del backend local', () => {
    expect(API_URL).toBe('http://localhost:3000/api');
  });

  test('agrega el token Bearer si existe', async () => {
    getItem.mockImplementation((k: string) => (k === 'token' ? 'abc' : null));
    await apiFetch('/facturas');
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/facturas', { headers: { Authorization: 'Bearer abc' } });
  });

  test('no agrega Authorization sin token y conserva las opciones', async () => {
    getItem.mockReturnValue(null);
    await apiFetch('/auth/login', { method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' } });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
      method: 'POST', body: '{}', headers: { 'Content-Type': 'application/json' },
    });
  });

  test('un Authorization explícito tiene prioridad sobre el token guardado', async () => {
    getItem.mockReturnValue('viejo');
    await apiFetch('/users/me/documento', { headers: { Authorization: 'Bearer recien-emitido' } });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer recien-emitido');
  });

  test('devuelve la respuesta de fetch sin procesarla', async () => {
    const response = { ok: false, status: 401 };
    fetchMock.mockResolvedValue(response);
    await expect(apiFetch('/x')).resolves.toBe(response);
  });
});

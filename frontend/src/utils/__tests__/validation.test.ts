import {
  isValidEmail, validateEmail, validateName, validateNombres, validateApellidos,
  isStrongPassword, validatePassword, validatePasswordMatch, validateAmount, validateProveedor,
  validateDetalle, validatePuc, validateFecha, validatePercentage, validateRole, validateTelefono,
  validateNumeroDocumento, validateDireccion, validateCiudad, validateRegisterFormCompleto,
  validateNumeroFactura, validateFactura, validateRegisterForm, validateUsuario, getFieldError,
  hasFieldError, PASSWORD_ERROR,
} from '../validation';
import * as passwordUtils from '../password';

describe('utils/validation', () => {
  describe('email', () => {
    test.each(['a@b.co', ' user.name+tag@dominio.com.co '])('acepta %p', (e) => {
      expect(isValidEmail(e)).toBe(true);
      expect(validateEmail(e)).toBeNull();
    });

    test.each([
      ['', /requerido/], ['   ', /requerido/], ['sin-arroba.com', /no es válido/],
      ['a@b', /no es válido/], ['a b@c.com', /no es válido/], [`${'a'.repeat(250)}@b.com`, /255/],
    ])('rechaza %p', (e, msg) => {
      expect(validateEmail(e)?.message).toMatch(msg);
    });
  });

  describe('nombres y apellidos', () => {
    test('acepta nombres con tildes, ñ, espacios, guiones y apóstrofes', () => {
      expect(validateName("José Ñúñez O'Neil-Pérez")).toBeNull();
    });

    test.each([
      ['', /requerido/], ['A', /al menos 2/], ['a'.repeat(51), /exceder 50/], ['Ana3', /no válidos/], ['Ana@', /no válidos/],
    ])('rechaza %p', (v, msg) => {
      expect(validateName(v)?.message).toMatch(msg);
    });

    test('usa el nombre de campo correcto', () => {
      expect(validateNombres('')?.field).toBe('nombres');
      expect(validateApellidos('')?.field).toBe('apellidos');
    });
  });

  describe('contraseña', () => {
    test.each([
      ['Segura#123', true], ['Ab1!abcd', true], ['Ab1!abc', false], ['segura#123', false],
      ['SEGURA#123', false], ['Segura#abc', false], ['Segura1234', false],
    ])('isStrongPassword(%p) = %p (igual que utils/password y el backend)', (pwd, expected) => {
      expect(isStrongPassword(pwd)).toBe(expected);
      expect(passwordUtils.isStrongPassword(pwd)).toBe(expected);
    });

    test('ambos módulos exponen el mismo mensaje de error', () => {
      expect(PASSWORD_ERROR).toBe(passwordUtils.PASSWORD_ERROR);
    });

    test('validatePassword distingue requerido, longitud y complejidad', () => {
      expect(validatePassword('')?.message).toMatch(/requerida/);
      expect(validatePassword('Ab1!')?.message).toMatch(/al menos 8/);
      expect(validatePassword('abcdefgh')?.message).toMatch(/mayúscula/);
      expect(validatePassword('Segura#123')).toBeNull();
    });

    test('validatePasswordMatch', () => {
      expect(validatePasswordMatch('a', 'b')?.field).toBe('confirmPassword');
      expect(validatePasswordMatch('a', 'a')).toBeNull();
    });
  });

  describe('montos y porcentajes', () => {
    test.each([100, '100.50', 0.01, 999999999999.99])('monto válido %p', (m) => {
      expect(validateAmount(m)).toBeNull();
    });

    test.each([
      ['', /requerido/], ['abc', /positivo/], [-1, /positivo/], [0, /mayor a 0/], ['0', /mayor a 0/], [1e13, /demasiado grande/],
    ])('monto inválido %p', (m, msg) => {
      expect(validateAmount(m as any)?.message).toMatch(msg);
    });

    test.each([0, 100, '19.5'])('porcentaje válido %p', (p) => expect(validatePercentage(p)).toBeNull());
    test.each([[-0.1, /entre 0 y 100/], [100.1, /entre 0 y 100/], ['x', /número/]])('porcentaje inválido %p', (p, msg) => {
      expect(validatePercentage(p as any)?.message).toMatch(msg);
    });
  });

  describe('campos de factura', () => {
    test('proveedor: requerido, 3-100 caracteres', () => {
      expect(validateProveedor('')?.message).toMatch(/requerido/);
      expect(validateProveedor('AB')?.message).toMatch(/al menos 3/);
      expect(validateProveedor('a'.repeat(101))?.message).toMatch(/100/);
      expect(validateProveedor('ACME')).toBeNull();
    });

    test('detalle: requerido, 5-500 caracteres', () => {
      expect(validateDetalle(' ')?.message).toMatch(/requerido/);
      expect(validateDetalle('abcd')?.message).toMatch(/al menos 5/);
      expect(validateDetalle('a'.repeat(501))?.message).toMatch(/500/);
      expect(validateDetalle('Compra de insumos')).toBeNull();
    });

    test('puc y número de factura', () => {
      expect(validatePuc('')).not.toBeNull();
      expect(validatePuc('510506')).toBeNull();
      expect(validateNumeroFactura('')?.message).toMatch(/requerido/);
      expect(validateNumeroFactura('x'.repeat(51))?.message).toMatch(/50/);
      expect(validateNumeroFactura('FAC-2026-001')).toBeNull();
    });

    test('fecha: requerida, válida y no futura', () => {
      expect(validateFecha('')?.message).toMatch(/requerida/);
      expect(validateFecha('no-fecha')?.message).toMatch(/no es válida/);
      const manana = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
      expect(validateFecha(manana)?.message).toMatch(/mayor a hoy/);
      expect(validateFecha('2024-01-15')).toBeNull();
    });

    test('validateFactura acumula todos los errores', () => {
      const r = validateFactura({ numero: '', fecha: '', proveedor: '', monto: '', puc: '', detalle: '' });
      expect(r.isValid).toBe(false);
      expect(r.errors.map(e => e.field)).toEqual(['numero', 'fecha', 'proveedor', 'monto', 'puc', 'detalle']);
    });

    test('validateFactura válida', () => {
      const r = validateFactura({ numero: 'F-1', fecha: '2024-01-01', proveedor: 'ACME', monto: 100, puc: '510506', detalle: 'Servicio' });
      expect(r).toEqual({ isValid: true, errors: [] });
    });
  });

  describe('datos de contacto e identificación', () => {
    test('teléfono: ignora separadores y exige 10 dígitos', () => {
      expect(validateTelefono('')?.message).toMatch(/requerido/);
      expect(validateTelefono('300 123 456')?.message).toMatch(/10 dígitos/);
      expect(validateTelefono('300-123-4567')).toBeNull();
    });

    test('número de documento: al menos 5 dígitos, máximo 20', () => {
      expect(validateNumeroDocumento('')?.message).toMatch(/requerido/);
      expect(validateNumeroDocumento('1234')?.message).toMatch(/al menos 5/);
      expect(validateNumeroDocumento('1'.repeat(21))?.message).toMatch(/solo puede contener/);
      expect(validateNumeroDocumento('1.234.567')).toBeNull();
    });

    test('dirección y ciudad', () => {
      expect(validateDireccion('')?.message).toMatch(/requerida/);
      expect(validateDireccion('Cra')?.message).toMatch(/al menos 5/);
      expect(validateDireccion('a'.repeat(201))?.message).toMatch(/200/);
      expect(validateDireccion('Calle 1 # 2-3')).toBeNull();
      expect(validateCiudad('')?.message).toMatch(/requerida/);
      expect(validateCiudad('B')?.message).toMatch(/al menos 2/);
      expect(validateCiudad('Cali')).toBeNull();
    });

    test('rol requerido', () => {
      expect(validateRole('')).not.toBeNull();
      expect(validateRole('contador')).toBeNull();
    });
  });

  describe('formularios completos', () => {
    const registro = {
      nombres: 'Ana', apellidos: 'Pérez', email: 'ana@test.com', telefono: '3001234567', numeroDocumento: '1234567',
      direccion: 'Calle 1 # 2-3', ciudad: 'Bogotá', password: 'Segura#123', confirmPassword: 'Segura#123',
    };

    test('registro completo válido', () => {
      expect(validateRegisterFormCompleto(registro)).toEqual({ isValid: true, errors: [] });
    });

    test('registro completo inválido reporta cada campo', () => {
      const r = validateRegisterFormCompleto({ ...registro, telefono: '1', ciudad: '', confirmPassword: 'otra' });
      expect(r.errors.map(e => e.field)).toEqual(['telefono', 'ciudad', 'confirmPassword']);
    });

    test('registro simple y usuario', () => {
      expect(validateRegisterForm(registro).isValid).toBe(true);
      expect(validateUsuario({ nombres: 'Ana', apellidos: 'Pérez', email: 'x', role: '' }).errors.map(e => e.field))
        .toEqual(['email', 'role']);
    });

    test('getFieldError / hasFieldError', () => {
      const errors = [{ field: 'email', message: 'mal' }];
      expect(getFieldError(errors, 'email')).toBe('mal');
      expect(getFieldError(errors, 'otro')).toBeNull();
      expect(hasFieldError(errors, 'email')).toBe(true);
      expect(hasFieldError(errors, 'otro')).toBe(false);
    });
  });
});

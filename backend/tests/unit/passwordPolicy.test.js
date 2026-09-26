const { isStrongPassword, PASSWORD_ERROR, BCRYPT_ROUNDS, generateTempPassword } = require('../../utils/passwordPolicy');

describe('utils/passwordPolicy', () => {
  describe('isStrongPassword', () => {
    test('acepta una contraseña que cumple todas las reglas', () => {
      expect(isStrongPassword('Segura#123')).toBe(true);
    });

    test('acepta exactamente 8 caracteres', () => {
      expect(isStrongPassword('Ab1!abcd')).toBe(true);
    });

    test.each([
      ['menos de 8 caracteres', 'Ab1!abc'],
      ['sin mayúscula', 'segura#123'],
      ['sin minúscula', 'SEGURA#123'],
      ['sin número', 'Segura#abc'],
      ['sin carácter especial', 'Segura1234'],
      ['cadena vacía', ''],
    ])('rechaza contraseña %s', (_desc, pwd) => {
      expect(isStrongPassword(pwd)).toBe(false);
    });

    test.each([null, undefined, 12345678, {}, []])('rechaza valores no string (%p)', (v) => {
      expect(isStrongPassword(v)).toBe(false);
    });
  });

  test('exporta el mensaje de error y 12 rondas de bcrypt', () => {
    expect(PASSWORD_ERROR).toMatch(/8 caracteres/);
    expect(BCRYPT_ROUNDS).toBe(12);
  });

  describe('generateTempPassword', () => {
    test('genera contraseñas de 12 caracteres que cumplen la política', () => {
      for (let i = 0; i < 50; i++) {
        const pwd = generateTempPassword();
        expect(pwd).toHaveLength(12);
        expect(isStrongPassword(pwd)).toBe(true);
      }
    });

    test('genera valores distintos en cada llamada', () => {
      const set = new Set(Array.from({ length: 20 }, generateTempPassword));
      expect(set.size).toBe(20);
    });
  });
});

// Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial';
export const PASSWORD_ERROR = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial';

export function isStrongPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

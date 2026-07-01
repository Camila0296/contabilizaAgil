// Al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
const PASSWORD_ERROR = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial.';
const BCRYPT_ROUNDS = 12;

function isStrongPassword(password) {
  return typeof password === 'string' && PASSWORD_REGEX.test(password);
}

function generateTempPassword() {
  const crypto = require('crypto');
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '!@#$%&*';
  const all = upper + lower + digits + special;
  const pick = (set) => set[crypto.randomInt(set.length)];

  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  for (let i = 0; i < 8; i++) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

module.exports = { isStrongPassword, PASSWORD_ERROR, BCRYPT_ROUNDS, generateTempPassword };

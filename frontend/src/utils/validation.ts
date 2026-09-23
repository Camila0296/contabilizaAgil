/**
 * Validaciones centralizadas para formularios
 */

export const PASSWORD_HINT = 'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial';
export const PASSWORD_ERROR = 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y un carácter especial';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email regex siguiendo estándares RFC 5322
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Teléfono: Solo números, mínimo 10 dígitos
const PHONE_REGEX = /^[0-9]{10,}$/;

// Documento: Solo números
const DOCUMENT_REGEX = /^[0-9]{1,20}$/;

// Solo permite letras, espacios y algunos caracteres especiales comunes
const NAME_REGEX = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s'-]{2,}$/;

// Monto válido: número positivo con máximo 2 decimales
const AMOUNT_REGEX = /^\d+(\.\d{1,2})?$/;

// Validar email
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateEmail(email: string): ValidationError | null {
  if (!email || !email.trim()) {
    return { field: 'email', message: 'El correo electrónico es requerido' };
  }
  if (email.length > 255) {
    return { field: 'email', message: 'El correo no puede exceder 255 caracteres' };
  }
  if (!isValidEmail(email)) {
    return { field: 'email', message: 'El correo electrónico no es válido' };
  }
  return null;
}

// Validar nombres
export function validateName(value: string, fieldName: string = 'nombre'): ValidationError | null {
  if (!value || !value.trim()) {
    return { field: fieldName, message: `El ${fieldName} es requerido` };
  }
  if (value.length < 2) {
    return { field: fieldName, message: `El ${fieldName} debe tener al menos 2 caracteres` };
  }
  if (value.length > 50) {
    return { field: fieldName, message: `El ${fieldName} no puede exceder 50 caracteres` };
  }
  if (!NAME_REGEX.test(value)) {
    return { field: fieldName, message: `El ${fieldName} contiene caracteres no válidos` };
  }
  return null;
}

// Validar nombres específicamente
export function validateNombres(nombres: string): ValidationError | null {
  return validateName(nombres, 'nombres');
}

// Validar apellidos específicamente
export function validateApellidos(apellidos: string): ValidationError | null {
  return validateName(apellidos, 'apellidos');
}

// Validar contraseña fuerte
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export function isStrongPassword(password: string): boolean {
  return PASSWORD_REGEX.test(password);
}

export function validatePassword(password: string): ValidationError | null {
  if (!password) {
    return { field: 'password', message: 'La contraseña es requerida' };
  }
  if (password.length < 8) {
    return { field: 'password', message: 'La contraseña debe tener al menos 8 caracteres' };
  }
  if (!isStrongPassword(password)) {
    return { field: 'password', message: 'La contraseña debe incluir mayúscula, minúscula, número y carácter especial' };
  }
  return null;
}

// Validar confirmación de contraseña
export function validatePasswordMatch(password: string, confirmPassword: string): ValidationError | null {
  if (password !== confirmPassword) {
    return { field: 'confirmPassword', message: 'Las contraseñas no coinciden' };
  }
  return null;
}

// Validar monto
export function validateAmount(amount: number | string, fieldName: string = 'monto'): ValidationError | null {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (amount === '' || amount === null || amount === undefined) {
    return { field: fieldName, message: `El ${fieldName} es requerido` };
  }

  if (isNaN(amountNum) || amountNum < 0) {
    return { field: fieldName, message: `El ${fieldName} debe ser un número positivo` };
  }

  if (amountNum === 0) {
    return { field: fieldName, message: `El ${fieldName} debe ser mayor a 0` };
  }

  if (amountNum > 999999999999.99) {
    return { field: fieldName, message: `El ${fieldName} es demasiado grande` };
  }

  return null;
}

// Validar proveedor
export function validateProveedor(proveedor: string): ValidationError | null {
  if (!proveedor || !proveedor.trim()) {
    return { field: 'proveedor', message: 'El proveedor es requerido' };
  }
  if (proveedor.length < 3) {
    return { field: 'proveedor', message: 'El proveedor debe tener al menos 3 caracteres' };
  }
  if (proveedor.length > 100) {
    return { field: 'proveedor', message: 'El proveedor no puede exceder 100 caracteres' };
  }
  return null;
}

// Validar detalle
export function validateDetalle(detalle: string): ValidationError | null {
  if (!detalle || !detalle.trim()) {
    return { field: 'detalle', message: 'El detalle es requerido' };
  }
  if (detalle.length < 5) {
    return { field: 'detalle', message: 'El detalle debe tener al menos 5 caracteres' };
  }
  if (detalle.length > 500) {
    return { field: 'detalle', message: 'El detalle no puede exceder 500 caracteres' };
  }
  return null;
}

// Validar PUC
export function validatePuc(puc: string): ValidationError | null {
  if (!puc || !puc.trim()) {
    return { field: 'puc', message: 'El PUC es requerido' };
  }
  return null;
}

// Validar fecha
export function validateFecha(fecha: string): ValidationError | null {
  if (!fecha || !fecha.trim()) {
    return { field: 'fecha', message: 'La fecha es requerida' };
  }

  const date = new Date(fecha);
  if (isNaN(date.getTime())) {
    return { field: 'fecha', message: 'La fecha no es válida' };
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (date > today) {
    return { field: 'fecha', message: 'La fecha no puede ser mayor a hoy' };
  }

  return null;
}

// Validar porcentaje
export function validatePercentage(percentage: number | string, fieldName: string = 'porcentaje'): ValidationError | null {
  const pct = typeof percentage === 'string' ? parseFloat(percentage) : percentage;

  if (isNaN(pct)) {
    return { field: fieldName, message: `El ${fieldName} debe ser un número` };
  }

  if (pct < 0 || pct > 100) {
    return { field: fieldName, message: `El ${fieldName} debe estar entre 0 y 100` };
  }

  return null;
}

// Validar rol
export function validateRole(role: string): ValidationError | null {
  if (!role || !role.trim()) {
    return { field: 'role', message: 'El rol es requerido' };
  }
  return null;
}

// Validar teléfono (solo números, mínimo 10 dígitos)
export function validateTelefono(telefono: string): ValidationError | null {
  if (!telefono || !telefono.trim()) {
    return { field: 'telefono', message: 'El teléfono es requerido' };
  }

  // Limpiar espacios y caracteres especiales
  const cleaned = telefono.replace(/[^\d]/g, '');

  if (cleaned.length < 10) {
    return { field: 'telefono', message: 'El teléfono debe tener al menos 10 dígitos' };
  }

  if (!PHONE_REGEX.test(cleaned)) {
    return { field: 'telefono', message: 'El teléfono solo puede contener números' };
  }

  return null;
}

// Validar documento (solo números)
export function validateNumeroDocumento(numero: string): ValidationError | null {
  if (!numero || !numero.trim()) {
    return { field: 'numeroDocumento', message: 'El número de documento es requerido' };
  }

  const cleaned = numero.replace(/[^\d]/g, '');

  if (cleaned.length < 5) {
    return { field: 'numeroDocumento', message: 'El número de documento debe tener al menos 5 dígitos' };
  }

  if (!DOCUMENT_REGEX.test(cleaned)) {
    return { field: 'numeroDocumento', message: 'El número de documento solo puede contener números' };
  }

  return null;
}

// Validar dirección
export function validateDireccion(direccion: string): ValidationError | null {
  if (!direccion || !direccion.trim()) {
    return { field: 'direccion', message: 'La dirección es requerida' };
  }

  if (direccion.length < 5) {
    return { field: 'direccion', message: 'La dirección debe tener al menos 5 caracteres' };
  }

  if (direccion.length > 200) {
    return { field: 'direccion', message: 'La dirección no puede exceder 200 caracteres' };
  }

  return null;
}

// Validar ciudad
export function validateCiudad(ciudad: string): ValidationError | null {
  if (!ciudad || !ciudad.trim()) {
    return { field: 'ciudad', message: 'La ciudad es requerida' };
  }

  if (ciudad.length < 2) {
    return { field: 'ciudad', message: 'La ciudad debe tener al menos 2 caracteres' };
  }

  return null;
}

// Validar formulario completo de registro mejorado
export function validateRegisterFormCompleto(form: any): ValidationResult {
  const errors: ValidationError[] = [];

  const nombresError = validateNombres(form.nombres);
  if (nombresError) errors.push(nombresError);

  const apellidosError = validateApellidos(form.apellidos);
  if (apellidosError) errors.push(apellidosError);

  const emailError = validateEmail(form.email);
  if (emailError) errors.push(emailError);

  const telefonoError = validateTelefono(form.telefono);
  if (telefonoError) errors.push(telefonoError);

  const numeroDocError = validateNumeroDocumento(form.numeroDocumento);
  if (numeroDocError) errors.push(numeroDocError);

  const direccionError = validateDireccion(form.direccion);
  if (direccionError) errors.push(direccionError);

  const ciudadError = validateCiudad(form.ciudad);
  if (ciudadError) errors.push(ciudadError);

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.push(passwordError);

  const matchError = validatePasswordMatch(form.password, form.confirmPassword);
  if (matchError) errors.push(matchError);

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validar número de factura
export function validateNumeroFactura(numero: string): ValidationError | null {
  if (!numero || !numero.trim()) {
    return { field: 'numero', message: 'El número de factura es requerido' };
  }
  if (numero.length > 50) {
    return { field: 'numero', message: 'El número de factura no puede exceder 50 caracteres' };
  }
  return null;
}

// Validar toda una factura
export function validateFactura(factura: any): ValidationResult {
  const errors: ValidationError[] = [];

  const numeroError = validateNumeroFactura(factura.numero);
  if (numeroError) errors.push(numeroError);

  const fechaError = validateFecha(factura.fecha);
  if (fechaError) errors.push(fechaError);

  const proveedorError = validateProveedor(factura.proveedor);
  if (proveedorError) errors.push(proveedorError);

  const montoError = validateAmount(factura.monto);
  if (montoError) errors.push(montoError);

  const pucError = validatePuc(factura.puc);
  if (pucError) errors.push(pucError);

  const detalleError = validateDetalle(factura.detalle);
  if (detalleError) errors.push(detalleError);

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validar registro de usuario
export function validateRegisterForm(form: any): ValidationResult {
  const errors: ValidationError[] = [];

  const nombresError = validateNombres(form.nombres);
  if (nombresError) errors.push(nombresError);

  const apellidosError = validateApellidos(form.apellidos);
  if (apellidosError) errors.push(apellidosError);

  const emailError = validateEmail(form.email);
  if (emailError) errors.push(emailError);

  const passwordError = validatePassword(form.password);
  if (passwordError) errors.push(passwordError);

  const matchError = validatePasswordMatch(form.password, form.confirmPassword);
  if (matchError) errors.push(matchError);

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validar usuario (crear/editar)
export function validateUsuario(usuario: any): ValidationResult {
  const errors: ValidationError[] = [];

  const nombresError = validateNombres(usuario.nombres);
  if (nombresError) errors.push(nombresError);

  const apellidosError = validateApellidos(usuario.apellidos);
  if (apellidosError) errors.push(apellidosError);

  const emailError = validateEmail(usuario.email);
  if (emailError) errors.push(emailError);

  const roleError = validateRole(usuario.role);
  if (roleError) errors.push(roleError);

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Obtener mensaje de error para un campo
export function getFieldError(errors: ValidationError[], fieldName: string): string | null {
  const error = errors.find(e => e.field === fieldName);
  return error ? error.message : null;
}

// Verificar si hay error en un campo
export function hasFieldError(errors: ValidationError[], fieldName: string): boolean {
  return errors.some(e => e.field === fieldName);
}

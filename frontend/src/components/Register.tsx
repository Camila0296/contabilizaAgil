import React, { useState } from 'react';
import { apiFetch } from '../api';
import { showSuccess, showError } from '../utils/alerts';
import DocumentoUploader from './DocumentoUploader';
import {
  validateNombres,
  validateApellidos,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateTelefono,
  validateNumeroDocumento,
  validateDireccion,
  validateCiudad,
  validateRegisterFormCompleto,
  ValidationError,
  hasFieldError,
  getFieldError,
  PASSWORD_HINT
} from '../utils/validation';

interface RegisterProps {
  onRegisterSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    direccion: '',
    ciudad: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'upload-doc'>('form');
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    nombres: false,
    apellidos: false,
    email: false,
    telefono: false,
    numeroDocumento: false,
    direccion: false,
    ciudad: false,
    password: false,
    confirmPassword: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Para teléfono y número de documento, solo permitir números
    if ((name === 'telefono' || name === 'numeroDocumento') && type === 'text') {
      const cleaned = value.replace(/[^\d]/g, '');
      setFormData({
        ...formData,
        [name]: cleaned
      });
      if (touched[name as keyof typeof touched]) {
        validateField(name, cleaned);
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });

    if (touched[name as keyof typeof touched]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name: string, value: string) => {
    const newErrors = errors.filter(e => e.field !== name);

    switch (name) {
      case 'nombres': {
        const error = validateNombres(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'apellidos': {
        const error = validateApellidos(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'email': {
        const error = validateEmail(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'password': {
        const error = validatePassword(value);
        if (error) newErrors.push(error);
        if (formData.confirmPassword && formData.confirmPassword !== value) {
          const matchError = errors.find(e => e.field === 'confirmPassword');
          if (!matchError) {
            newErrors.push({ field: 'confirmPassword', message: 'Las contraseñas no coinciden' });
          }
        }
        break;
      }
      case 'confirmPassword': {
        const matchError = validatePasswordMatch(formData.password, value);
        if (matchError) newErrors.push(matchError);
        break;
      }
      case 'telefono': {
        const error = validateTelefono(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'numeroDocumento': {
        const error = validateNumeroDocumento(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'direccion': {
        const error = validateDireccion(value);
        if (error) newErrors.push(error);
        break;
      }
      case 'ciudad': {
        const error = validateCiudad(value);
        if (error) newErrors.push(error);
        break;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationError[] = [];

    const nombresError = validateNombres(formData.nombres);
    if (nombresError) newErrors.push(nombresError);

    const apellidosError = validateApellidos(formData.apellidos);
    if (apellidosError) newErrors.push(apellidosError);

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.push(emailError);

    const telefonoError = validateTelefono(formData.telefono);
    if (telefonoError) newErrors.push(telefonoError);

    const numeroDocError = validateNumeroDocumento(formData.numeroDocumento);
    if (numeroDocError) newErrors.push(numeroDocError);

    const direccionError = validateDireccion(formData.direccion);
    if (direccionError) newErrors.push(direccionError);

    const ciudadError = validateCiudad(formData.ciudad);
    if (ciudadError) newErrors.push(ciudadError);

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.push(passwordError);

    const matchError = validatePasswordMatch(formData.password, formData.confirmPassword);
    if (matchError) newErrors.push(matchError);

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          email: formData.email,
          telefono: formData.telefono,
          tipoDocumento: formData.tipoDocumento,
          numeroDocumento: formData.numeroDocumento,
          direccion: formData.direccion,
          ciudad: formData.ciudad,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess('Registro exitoso. Tu cuenta está pendiente de aprobación.');
        setRegisteredToken(data.token);
        setStep('upload-doc');
      } else {
        showError(data.error || 'Error en el registro');
      }
    } catch (error) {
      showError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDocumento = async (datos: string, tipo: string) => {
    try {
      const res = await apiFetch('/users/me/documento', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${registeredToken}`
        },
        body: JSON.stringify({ tipo, datos })
      });

      if (res.ok) {
        showSuccess('Documento cargado. Un administrador revisará tu cuenta.');
        onRegisterSuccess();
      } else {
        const data = await res.json();
        showError(data.error || 'No se pudo cargar el documento');
      }
    } catch {
      showError('Error de conexión al cargar el documento');
    }
  };

  if (step === 'upload-doc') {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu identidad</h2>
          <p className="text-gray-600">
            Para agilizar la aprobación de tu cuenta, carga tu cédula o documento de identidad (opcional por ahora).
          </p>
        </div>

        <DocumentoUploader onSubmit={handleUploadDocumento} submitLabel="Cargar documento" />

        <button
          type="button"
          className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2"
          onClick={onRegisterSuccess}
        >
          Omitir por ahora
        </button>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Puedes cargarlo más tarde desde la pantalla de inicio de sesión, en "¿Te registraste pero no cargaste tu documento?".
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear cuenta</h2>
        <p className="text-gray-600">Completa tus datos para registrarte</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombres" className="form-label">
              Nombres
            </label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`form-input ${hasFieldError(errors, 'nombres') ? 'border-red-500' : ''}`}
              placeholder="Juan"
              aria-invalid={hasFieldError(errors, 'nombres')}
            />
            {hasFieldError(errors, 'nombres') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'nombres')}</p>
            )}
          </div>

          <div>
            <label htmlFor="apellidos" className="form-label">
              Apellidos
            </label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`form-input ${hasFieldError(errors, 'apellidos') ? 'border-red-500' : ''}`}
              placeholder="Pérez"
              aria-invalid={hasFieldError(errors, 'apellidos')}
            />
            {hasFieldError(errors, 'apellidos') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'apellidos')}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`form-input ${hasFieldError(errors, 'email') ? 'border-red-500' : ''}`}
            placeholder="juan.perez@email.com"
            aria-invalid={hasFieldError(errors, 'email')}
          />
          {hasFieldError(errors, 'email') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'email')}</p>
          )}
        </div>

        {/* Información de Contacto */}
        <div>
          <label htmlFor="telefono" className="form-label">
            Teléfono (solo números)
          </label>
          <input
            type="text"
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`form-input ${hasFieldError(errors, 'telefono') ? 'border-red-500' : ''}`}
            placeholder="3001234567"
            aria-invalid={hasFieldError(errors, 'telefono')}
            inputMode="numeric"
          />
          {hasFieldError(errors, 'telefono') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'telefono')}</p>
          )}
        </div>

        {/* Información de Identificación */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tipoDocumento" className="form-label">
              Tipo de Documento
            </label>
            <select
              id="tipoDocumento"
              name="tipoDocumento"
              value={formData.tipoDocumento}
              onChange={handleChange}
              className="form-select"
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="NIT">NIT</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PASAPORTE">Pasaporte</option>
            </select>
          </div>

          <div>
            <label htmlFor="numeroDocumento" className="form-label">
              Número de Documento
            </label>
            <input
              type="text"
              id="numeroDocumento"
              name="numeroDocumento"
              value={formData.numeroDocumento}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={`form-input ${hasFieldError(errors, 'numeroDocumento') ? 'border-red-500' : ''}`}
              placeholder="1234567890"
              aria-invalid={hasFieldError(errors, 'numeroDocumento')}
              inputMode="numeric"
            />
            {hasFieldError(errors, 'numeroDocumento') && (
              <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'numeroDocumento')}</p>
            )}
          </div>
        </div>

        {/* Dirección y Ciudad */}
        <div>
          <label htmlFor="direccion" className="form-label">
            Dirección
          </label>
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`form-input ${hasFieldError(errors, 'direccion') ? 'border-red-500' : ''}`}
            placeholder="Calle Principal #123"
            aria-invalid={hasFieldError(errors, 'direccion')}
          />
          {hasFieldError(errors, 'direccion') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'direccion')}</p>
          )}
        </div>

        <div>
          <label htmlFor="ciudad" className="form-label">
            Ciudad
          </label>
          <input
            type="text"
            id="ciudad"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`form-input ${hasFieldError(errors, 'ciudad') ? 'border-red-500' : ''}`}
            placeholder="Bogotá"
            aria-invalid={hasFieldError(errors, 'ciudad')}
          />
          {hasFieldError(errors, 'ciudad') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'ciudad')}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="form-label">
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`form-input ${hasFieldError(errors, 'password') ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            minLength={8}
            autoComplete="new-password"
            aria-invalid={hasFieldError(errors, 'password')}
          />
          <p className="text-xs text-gray-500 mt-1">{PASSWORD_HINT}</p>
          {hasFieldError(errors, 'password') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'password')}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="form-label">
            Confirmar contraseña
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className={`form-input ${hasFieldError(errors, 'confirmPassword') ? 'border-red-500' : ''}`}
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={hasFieldError(errors, 'confirmPassword')}
          />
          {hasFieldError(errors, 'confirmPassword') && (
            <p className="text-red-500 text-sm mt-1">{getFieldError(errors, 'confirmPassword')}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn btn-primary py-3 text-base font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creando cuenta...
            </div>
          ) : (
            'Crear cuenta'
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              Tu cuenta será revisada por un administrador antes de poder acceder al sistema.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
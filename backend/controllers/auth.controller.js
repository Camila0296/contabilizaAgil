const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { isStrongPassword, PASSWORD_ERROR, BCRYPT_ROUNDS } = require('../utils/passwordPolicy');

const authCtrl = {};

// Validar formato de email
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validar teléfono (solo números, mínimo 10 dígitos)
function isValidTelefono(telefono) {
  if (!telefono || typeof telefono !== 'string') return false;
  const cleaned = telefono.replace(/[^\d]/g, '');
  return cleaned.length >= 10;
}

// Validar número de documento
function isValidNumeroDocumento(numero) {
  if (!numero || typeof numero !== 'string') return false;
  const cleaned = numero.replace(/[^\d]/g, '');
  return cleaned.length >= 5 && cleaned.length <= 20;
}

const TIPOS_DOCUMENTO_PERMITIDOS = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_DOCUMENTO_BYTES = 5 * 1024 * 1024; // 5MB

// Valida { tipo, datos } de un documento de identidad cargado en base64.
function validateDocumentoIdentidad(tipo, datos) {
  if (!tipo || !TIPOS_DOCUMENTO_PERMITIDOS.includes(tipo)) {
    return 'tipo: debe ser image/jpeg, image/png o application/pdf';
  }
  if (!datos || typeof datos !== 'string') {
    return 'datos: requerido';
  }
  const base64Payload = datos.includes(',') ? datos.split(',')[1] : datos;
  if (!base64Payload) {
    return 'datos: formato inválido';
  }
  let sizeBytes;
  try {
    sizeBytes = Buffer.from(base64Payload, 'base64').length;
  } catch {
    return 'datos: no es un base64 válido';
  }
  if (sizeBytes === 0) {
    return 'datos: archivo vacío';
  }
  if (sizeBytes > MAX_DOCUMENTO_BYTES) {
    return 'datos: el archivo supera el tamaño máximo permitido (5MB)';
  }
  return null;
}

// Registro de usuario con campos de seguridad
authCtrl.register = async (req, res) => {
  const {
    nombres,
    apellidos,
    email,
    password,
    telefono,
    tipoDocumento = 'CC',
    numeroDocumento,
    direccion,
    ciudad
  } = req.body;

  // Validar campos requeridos
  if (!nombres || !apellidos || !email || !password || !telefono || !numeroDocumento || !direccion || !ciudad) {
    return res.status(400).json({ error: 'Faltan campos requeridos (nombres, apellidos, email, teléfono, documento, dirección, ciudad)' });
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
  }

  // Validar teléfono
  if (!isValidTelefono(telefono)) {
    return res.status(400).json({ error: 'Teléfono inválido (debe tener al menos 10 dígitos numéricos)' });
  }

  // Validar número de documento
  if (!isValidNumeroDocumento(numeroDocumento)) {
    return res.status(400).json({ error: 'Número de documento inválido' });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({ error: PASSWORD_ERROR });
  }

  // Normalizar email a lowercase
  const emailLower = email.toLowerCase();

  // Verificar si email ya existe
  const existing = await User.findOne({ email: emailLower });
  if (existing) {
    return res.status(400).json({ error: 'Email ya registrado' });
  }

  // Verificar si número de documento ya existe
  const existingDoc = await User.findOne({ numeroDocumento: numeroDocumento.replace(/[^\d]/g, '') });
  if (existingDoc) {
    return res.status(400).json({ error: 'Número de documento ya registrado' });
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const userRole = await Role.findOne({ name: "auxiliar" }) || await Role.findOne({ nivel: 4 }); // Asigna rol auxiliar por defecto
  if (!userRole) {
    return res.status(500).json({ error: 'No hay roles definidos en la base de datos' });
  }

  const user = new User({
    nombres: nombres.trim(),
    apellidos: apellidos.trim(),
    email: emailLower,
    password: hashedPassword,
    telefono: telefono.replace(/[^\d]/g, ''), // Guardar solo números
    tipoDocumento,
    numeroDocumento: numeroDocumento.replace(/[^\d]/g, ''), // Guardar solo números
    direccion: direccion.trim(),
    ciudad: ciudad.trim(),
    role: userRole._id,
    approved: false
  });

  await user.save();
  await user.populate('role');

  const token = jwt.sign({ id: user._id, role: user.role.name }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: '8h'
  });

  res.status(201).json({
    status: 'Registro exitoso',
    message: 'Tu cuenta está pendiente de aprobación por un administrador',
    token,
    user: {
      _id: user._id,
      id: user._id,
      nombres: user.nombres,
      apellidos: user.apellidos,
      email: user.email,
      telefono: user.telefono,
      role: user.role.name
    }
  });
};

// Login de usuario
authCtrl.login = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email: email.toLowerCase() }).populate('role');
  if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });
  // Generar token JWT
  if (!user.approved) return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });

  // Si el rol es nulo, asignar el rol según el email
  if (!user.role) {
    const defaultRole = email === 'admin@admin.com'
      ? await Role.findOne({ name: 'administrador' })
      : await Role.findOne({ name: 'auxiliar' });

    if (!defaultRole) {
      return res.status(500).json({ error: 'No hay roles definidos en la base de datos' });
    }

    user = await User.findByIdAndUpdate(user._id, { role: defaultRole._id }, { new: true }).populate('role');
  }

  const token = jwt.sign({ id: user._id, role: user.role.name }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: '8h'
  });
  res.json({ status: 'Login exitoso', token, user: { id: user._id, nombres: user.nombres, apellidos: user.apellidos, email: user.email, role: user.role.name } });
};

// Verificar token válido
authCtrl.verify = async (req, res) => {
  res.json({ status: 'Token válido' });
};

// Completar el cargue del documento de identidad de una cuenta pendiente,
// sin necesidad de sesión (identifica al usuario por email + número de documento)
authCtrl.recuperarDocumento = async (req, res) => {
  try {
    const { email, numeroDocumento, tipo, datos } = req.body;

    if (!isValidEmail(email) || !isValidNumeroDocumento(numeroDocumento)) {
      return res.status(400).json({ error: 'Datos no coinciden o la cuenta no existe' });
    }

    const validationError = validateDocumentoIdentidad(tipo, datos);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const numeroLimpio = numeroDocumento.replace(/[^\d]/g, '');
    const user = await User.findOne({ email: email.toLowerCase(), numeroDocumento: numeroLimpio });

    // Mensaje genérico: no confirmar si la cuenta existe o no, ni por qué falló
    const genericError = { error: 'Datos no coinciden o la cuenta no existe' };

    if (!user || user.approved || (user.documentoIdentidad && user.documentoIdentidad.verificado)) {
      return res.status(400).json(genericError);
    }

    user.documentoIdentidad = {
      tipo,
      datos,
      fechaCargue: new Date(),
      verificado: false
    };
    await user.save();

    res.json({ status: 'Documento de identidad cargado. Tu cuenta sigue pendiente de aprobación por un administrador.' });
  } catch (error) {
    console.error('Error al cargar documento pendiente:', error);
    res.status(500).json({ error: 'Error al cargar documento de identidad' });
  }
};

module.exports = authCtrl;
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

// Registro de usuario
authCtrl.register = async (req, res) => {
  const { nombres, apellidos, email, password } = req.body;

  // Validar campos requeridos
  if (!nombres || !apellidos || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // Validar formato de email
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Formato de email inválido' });
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
    role: userRole._id,
    approved: false
  });
  await user.save();
  await user.populate('role');
  const token = jwt.sign({ id: user._id, role: user.role.name }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: '8h'
  });
  res.status(201).json({
    status: 'Usuario registrado',
    token,
    user: { _id: user._id, id: user._id, nombres: user.nombres, apellidos: user.apellidos, email: user.email, role: user.role.name }
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

module.exports = authCtrl;
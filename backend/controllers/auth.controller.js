const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authCtrl = {};

// Registro de usuario
authCtrl.register = async (req, res) => {
  const { nombres, apellidos, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const userRole = await Role.findOne({ name: "user" }) || await Role.findOne(); // Asigna el primer rol si no se envía
  if (!userRole) {
    return res.status(500).json({ error: 'No hay roles definidos en la base de datos' });
  }
  const user = new User({
    nombres,
    apellidos,
    email,
    password: hashedPassword,
    role: userRole._id,
    approved: false
  });
  await user.save();
  res.json({ status: 'Usuario registrado' });
};

// Login de usuario
authCtrl.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).populate('role');
  if (!user) return res.status(400).json({ error: 'Usuario no encontrado' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: 'Contraseña incorrecta' });
  // Generar token JWT
  if (!user.approved) return res.status(403).json({ error: 'Cuenta pendiente de aprobación' });
  const token = jwt.sign({ id: user._id, role: user.role.name }, process.env.JWT_SECRET || 'changeme', {
    expiresIn: '8h'
  });
  res.json({ status: 'Login exitoso', token, user: { id: user._id, nombres: user.nombres, apellidos: user.apellidos, email: user.email, role: user.role.name } });
};

module.exports = authCtrl;
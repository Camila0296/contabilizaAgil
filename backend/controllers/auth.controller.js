const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcryptjs');

const authCtrl = {};

// Registro de usuario
authCtrl.register = async (req, res) => {
  const { nombres, apellidos, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const useperorRole = await Role.findOne({ name: "user" }) || await Role.findOne(); // Asigna el primer rol si no se envía
    if (!userRole) {
    return res.status(500).json({ error: 'No hay roles definidos en la base de datos' });
  }
  const user = new User({
    nombres,
    apellidos,
    email,
    password: hashedPassword,
    role: userRole._id
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
  // Aquí puedes generar un token si usas JWT
  res.json({ status: 'Login exitoso', user });
};

module.exports = authCtrl;
const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcryptjs');

const userCtrl = {};

// Crear nuevo usuario (solo admin)
userCtrl.createUser = async (req, res) => {
  try {
    const { nombres, apellidos, email, role } = req.body;
    const crypto = require('crypto');
    const randomPass = crypto.randomBytes(4).toString('hex'); // 8 chars
    if (!nombres || !apellidos || !email) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email ya registrado' });
    const hashed = await bcrypt.hash(randomPass, 10);
    const roleDoc = await Role.findOne({ name: (role || 'user').toLowerCase() });
    if (!roleDoc) return res.status(400).json({ error: 'Rol no válido' });
    const user = new User({ nombres, apellidos, email, password: hashed, role: roleDoc._id });
    await user.save();
    // Enviar correo con contraseña
    try {
      const nodemailer = require('nodemailer');
      var transporter = nodemailer.createTransport({
        host: "pro.turbo-smtp.com",
        port: 587,
        auth: {
          user: "kamilapava10@gmail.com",
          pass: "0mxQrJmn"
        }
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: 'Credenciales de acceso',
        text: `Hola ${nombres},\n\nTu cuenta ha sido creada. Puedes iniciar sesión con:\nEmail: ${email}\nContraseña: ${randomPass}\n\nPor favor cambia la contraseña después de iniciar sesión.`
      });
    } catch (mailErr) {
      console.error('Error enviando correo:', mailErr);
    }

    res.json({ status: 'Usuario creado', id: user._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

userCtrl.getUsers = async (req, res) => {
  const filter = {};
  if (req.query.activo === 'true') {
    filter.$or = [ { activo: true }, { activo: { $exists: false } } ];
  } else if (req.query.activo === 'false') {
    filter.activo = false;
  }
  if (req.query.approved === 'false') filter.approved = false;
  else if (req.query.approved === 'true') filter.approved = true;

  if (req.query.search) {
    const term = req.query.search.trim();
    const regex = new RegExp(term, 'i');
    filter.$and = filter.$and || [];
    filter.$and.push({ $or: [ { nombres: regex }, { apellidos: regex }, { email: regex } ] });
  }
  const users = await User.find(filter).populate('role');
  res.json(users);
};

userCtrl.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate('role');
  res.json(user);
};

userCtrl.updateUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ status: 'Usuario actualizado' });
};

userCtrl.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('role', 'name');
  res.json(user);
};

userCtrl.updateMe = async (req, res) => {
  const { nombres, apellidos, password } = req.body;
  const update = { nombres, apellidos };
  if (password) {
    const bcrypt = require('bcryptjs');
    update.password = await bcrypt.hash(password, 10);
  }
  await User.findByIdAndUpdate(req.user.id, update, { new: true });
  res.json({ status: 'Perfil actualizado' });
};

userCtrl.approveUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { approved: true, activo: true });
  res.json({ status: 'Usuario aprobado' });
};

userCtrl.rejectUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { approved: false, activo: false });
  res.json({ status: 'Usuario rechazado' });
};

userCtrl.deleteUser = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { activo: false });
  res.json({ status: 'Usuario deshabilitado' });
};

module.exports = userCtrl;
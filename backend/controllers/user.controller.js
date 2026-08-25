const User = require('../models/user');
const Role = require('../models/role');
const bcrypt = require('bcryptjs');
const { isStrongPassword, PASSWORD_ERROR, BCRYPT_ROUNDS, generateTempPassword } = require('../utils/passwordPolicy');

const userCtrl = {};

// Validar formato de email
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Crear nuevo usuario (solo admin)
userCtrl.createUser = async (req, res) => {
  try {
    const { nombres, apellidos, email, role } = req.body;

    // Validaciones
    const errors = [];
    if (!nombres || typeof nombres !== 'string' || nombres.trim() === '') errors.push('nombres: requerido');
    if (!apellidos || typeof apellidos !== 'string' || apellidos.trim() === '') errors.push('apellidos: requerido');
    if (!isValidEmail(email)) errors.push('email: formato inválido o faltante');

    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: errors
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ error: 'Email ya registrado' });
    }

    const roleDoc = await Role.findOne({ name: (role || 'user').toLowerCase() });
    if (!roleDoc) {
      return res.status(400).json({ error: 'Rol no válido' });
    }

    const randomPass = generateTempPassword();
    const hashed = await bcrypt.hash(randomPass, BCRYPT_ROUNDS);
    const user = new User({
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      email: email.toLowerCase(),
      password: hashed,
      role: roleDoc._id
    });
    await user.save();
    // Enviar correo con contraseña
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
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
    }

    res.json({ status: 'Usuario creado', id: user._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

userCtrl.getUsers = async (req, res) => {
  try {
    const filter = {};

    // Filtros de estado
    if (req.query.activo === 'true') {
      filter.$or = [{ activo: true }, { activo: { $exists: false } }];
    } else if (req.query.activo === 'false') {
      filter.activo = false;
    }

    if (req.query.approved === 'false') {
      filter.approved = false;
    } else if (req.query.approved === 'true') {
      filter.approved = true;
    }

    // Búsqueda por nombre o email
    if (req.query.search) {
      const term = req.query.search.trim();
      if (term.length > 0) {
        const regex = new RegExp(term, 'i');
        filter.$or = filter.$or || [];
        filter.$or = [
          { nombres: regex },
          { apellidos: regex },
          { email: regex }
        ];
      }
    }

    // Paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Contar total
    const total = await User.countDocuments(filter);

    const users = await User
      .find(filter)
      .populate('role', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

userCtrl.getUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate('role');
  res.json(user);
};

userCtrl.updateUser = async (req, res) => {
  try {
    const update = { ...req.body };

    // Validar email si se proporciona
    if (update.email && !isValidEmail(update.email)) {
      return res.status(400).json({ error: 'Email: formato inválido' });
    }

    if (update.email) {
      const existing = await User.findOne({
        email: update.email.toLowerCase(),
        _id: { $ne: req.params.id }
      });
      if (existing) {
        return res.status(400).json({ error: 'Email ya registrado' });
      }
      update.email = update.email.toLowerCase();
    }

    if (update.password) {
      if (!isStrongPassword(update.password)) {
        return res.status(400).json({ error: PASSWORD_ERROR });
      }
      update.password = await bcrypt.hash(update.password, BCRYPT_ROUNDS);
    }

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).populate('role');
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ status: 'Usuario actualizado', user });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

userCtrl.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate('role', 'name');
  res.json(user);
};

userCtrl.updateMe = async (req, res) => {
  try {
    const { nombres, apellidos, email, password, currentPassword } = req.body;
    const update = {};

    if (nombres && typeof nombres === 'string') {
      update.nombres = nombres.trim();
    }
    if (apellidos && typeof apellidos === 'string') {
      update.apellidos = apellidos.trim();
    }

    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Email: formato inválido' });
      }
      const existing = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.user.id }
      });
      if (existing) {
        return res.status(400).json({ error: 'Email ya registrado' });
      }
      update.email = email.toLowerCase();
    }

    if (password) {
      if (!isStrongPassword(password)) {
        return res.status(400).json({ error: PASSWORD_ERROR });
      }
      if (!currentPassword) {
        return res.status(400).json({ error: 'Debes proporcionar tu contraseña actual' });
      }

      const user = await User.findById(req.user.id);
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: 'Contraseña actual incorrecta' });
      }

      update.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
    }

    const updated = await User.findByIdAndUpdate(req.user.id, update, { new: true }).populate('role');
    res.json({ status: 'Perfil actualizado', user: updated });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
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
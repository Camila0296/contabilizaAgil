const Role = require('../models/role');

const roleCtrl = {};

roleCtrl.createRole = async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
  try {
    const role = new Role({ name });
    await role.save();
    res.json({ status: 'Rol creado', role });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el rol', details: err.message });
  }
};

roleCtrl.getRoles = async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
};

module.exports = roleCtrl;
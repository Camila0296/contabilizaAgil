const Role = require('../models/role');

const roleCtrl = {};

roleCtrl.createRole = async (req, res) => {
  const { name, nivel, descripcion } = req.body;
  if (!name || !nivel || !descripcion) {
    return res.status(400).json({ error: 'Nombre, nivel y descripción son requeridos' });
  }
  try {
    const role = new Role({ name, nivel, descripcion });
    await role.save();
    res.json({ status: 'Rol creado', role });
  } catch (err) {
    // Mongoose retorna ValidationError si el enum no es válido
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Error de validación: ' + err.message });
    }
    res.status(500).json({ error: 'Error al crear el rol', details: err.message });
  }
};

roleCtrl.getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los roles' });
  }
};

module.exports = roleCtrl;
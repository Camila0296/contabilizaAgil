const mongoose = require('mongoose');
const User = require('../models/user');
const { escapeRegex } = require('../utils/regex');

// Campos que nunca se devuelven al cliente
const PRIVATE_FIELDS = '-password -documentoIdentidad.datos';

const aprobacionesCtrl = {};

// Obtener usuarios pendientes de aprobación
aprobacionesCtrl.getPendientes = async (req, res) => {
  try {
    // Paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Filtro: usuarios no aprobados
    const filter = { approved: false };

    // Búsqueda opcional
    if (req.query.search) {
      const term = req.query.search.trim();
      if (term.length > 0) {
        const regex = new RegExp(escapeRegex(term), 'i');
        filter.$or = [
          { nombres: regex },
          { apellidos: regex },
          { email: regex }
        ];
      }
    }

    // Contar total
    const total = await User.countDocuments(filter);

    // Obtener usuarios pendientes
    const usuarios = await User
      .find(filter)
      .select(PRIVATE_FIELDS)
      .populate('role', 'name')
      .sort({ createdAt: 1 }) // Primero los más antiguos
      .skip(skip)
      .limit(limit);

    res.json({
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener usuarios pendientes:', error);
    res.status(500).json({ error: 'Error al obtener usuarios pendientes' });
  }
};

// Obtener historial de aprobaciones
aprobacionesCtrl.getHistorial = async (req, res) => {
  try {
    // Paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Usuarios aprobados (que tienen approved = true)
    const filter = { approved: true };

    const total = await User.countDocuments(filter);

    const usuarios = await User
      .find(filter)
      .select(PRIVATE_FIELDS)
      .populate('role', 'name')
      .sort({ updatedAt: -1 }) // Más recientes primero
      .skip(skip)
      .limit(limit);

    res.json({
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener historial de aprobaciones:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
};

// Aprobar un usuario
aprobacionesCtrl.aprobarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.approved) {
      return res.status(400).json({ error: 'Usuario ya está aprobado' });
    }

    const actualizado = await User.findByIdAndUpdate(
      id,
      {
        approved: true,
        activo: true
      },
      { new: true }
    ).select(PRIVATE_FIELDS)
      .populate('role', 'name');

    res.json({
      status: 'Usuario aprobado',
      usuario: actualizado
    });
  } catch (error) {
    console.error('Error al aprobar usuario:', error);
    res.status(500).json({ error: 'Error al aprobar usuario' });
  }
};

// Rechazar un usuario (desactivarlo)
aprobacionesCtrl.rechazarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await User.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (usuario.approved) {
      return res.status(400).json({ error: 'No puedes rechazar un usuario ya aprobado' });
    }

    const actualizado = await User.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    ).select(PRIVATE_FIELDS)
      .populate('role', 'name');

    res.json({
      status: 'Usuario rechazado',
      usuario: actualizado
    });
  } catch (error) {
    console.error('Error al rechazar usuario:', error);
    res.status(500).json({ error: 'Error al rechazar usuario' });
  }
};

// Aprobar múltiples usuarios
aprobacionesCtrl.aprobarMultiples = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'ids: debe ser un array no vacío' });
    }

    if (ids.length > 100) {
      return res.status(400).json({ error: 'No se pueden aprobar más de 100 usuarios a la vez' });
    }

    if (!ids.every(id => mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ error: 'ids: todos deben ser ObjectId válidos' });
    }

    const result = await User.updateMany(
      { _id: { $in: ids }, approved: false },
      { approved: true, activo: true }
    );

    res.json({
      status: 'Usuarios aprobados',
      modified: result.modifiedCount,
      matched: result.matchedCount
    });
  } catch (error) {
    console.error('Error al aprobar múltiples usuarios:', error);
    res.status(500).json({ error: 'Error al aprobar usuarios' });
  }
};

// Estadísticas de aprobaciones
aprobacionesCtrl.getEstadisticas = async (req, res) => {
  try {
    const totalPendientes = await User.countDocuments({ approved: false });
    const totalAprobados = await User.countDocuments({ approved: true });
    const totalRechazados = await User.countDocuments({ approved: false, activo: false });

    res.json({
      pendientes: totalPendientes,
      aprobados: totalAprobados,
      rechazados: totalRechazados,
      total: totalPendientes + totalAprobados
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

module.exports = aprobacionesCtrl;

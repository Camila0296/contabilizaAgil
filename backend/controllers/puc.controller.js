const Puc = require('../models/puc');

const pucCtrl = {};

// Validar datos de PUC
function validatePucData(data) {
  const errors = [];

  if (!data.codigo || typeof data.codigo !== 'string' || data.codigo.trim() === '') {
    errors.push('codigo: requerido y debe ser string');
  }

  if (!data.nombre || typeof data.nombre !== 'string' || data.nombre.trim() === '') {
    errors.push('nombre: requerido y debe ser string');
  }

  if (!data.naturaleza || !['credito', 'debito'].includes(data.naturaleza.toLowerCase())) {
    errors.push('naturaleza: debe ser "credito" o "debito"');
  }

  if (data.activo !== undefined && typeof data.activo !== 'boolean') {
    errors.push('activo: debe ser boolean');
  }

  if (data.descripcion !== undefined && data.descripcion !== null && typeof data.descripcion !== 'string') {
    errors.push('descripcion: debe ser string');
  }

  return errors;
}

pucCtrl.getPucs = async (req, res) => {
  try {
    const filter = {};

    // Filtro de estado
    if (req.query.activo === 'true') {
      filter.activo = true;
    } else if (req.query.activo === 'false') {
      filter.activo = false;
    }

    // Filtro de naturaleza
    if (req.query.naturaleza && ['credito', 'debito'].includes(req.query.naturaleza.toLowerCase())) {
      filter.naturaleza = req.query.naturaleza.toLowerCase();
    }

    // Búsqueda por texto
    if (req.query.search) {
      const term = req.query.search.trim();
      if (term.length > 0) {
        const regex = new RegExp(term, 'i');
        filter.$or = [
          { codigo: regex },
          { nombre: regex },
          { descripcion: regex }
        ];
      }
    }

    // Paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Contar total
    const total = await Puc.countDocuments(filter);

    const pucs = await Puc
      .find(filter)
      .sort({ codigo: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: pucs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener PUCs:', error);
    res.status(500).json({ error: 'Error al obtener las cuentas PUC' });
  }
};

pucCtrl.getPuc = async (req, res) => {
  try {
    const puc = await Puc.findById(req.params.id);
    if (!puc) {
      return res.status(404).json({ error: 'Cuenta PUC no encontrada' });
    }
    res.json(puc);
  } catch (error) {
    console.error('Error al obtener PUC:', error);
    res.status(500).json({ error: 'Error al obtener la cuenta PUC' });
  }
};

pucCtrl.createPuc = async (req, res) => {
  try {
    const validationErrors = validatePucData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validationErrors
      });
    }

    const exists = await Puc.findOne({ codigo: req.body.codigo.toUpperCase() });
    if (exists) {
      return res.status(400).json({ error: 'Ya existe una cuenta PUC con ese código' });
    }

    const pucData = {
      codigo: req.body.codigo.toUpperCase().trim(),
      nombre: req.body.nombre.trim(),
      naturaleza: req.body.naturaleza.toLowerCase(),
      descripcion: req.body.descripcion ? req.body.descripcion.trim() : undefined,
      activo: true
    };

    const puc = await Puc.create(pucData);
    res.status(201).json({ status: 'Cuenta PUC creada', id: puc._id, puc });
  } catch (error) {
    console.error('Error al crear PUC:', error);
    res.status(500).json({ error: 'Error al crear la cuenta PUC' });
  }
};

pucCtrl.updatePuc = async (req, res) => {
  try {
    const validationErrors = validatePucData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validationErrors
      });
    }

    const puc = await Puc.findById(req.params.id);
    if (!puc) {
      return res.status(404).json({ error: 'Cuenta PUC no encontrada' });
    }

    // Verificar código único solo si cambió
    if (req.body.codigo && req.body.codigo.toUpperCase() !== puc.codigo) {
      const exists = await Puc.findOne({
        codigo: req.body.codigo.toUpperCase(),
        _id: { $ne: req.params.id }
      });
      if (exists) {
        return res.status(400).json({ error: 'Ya existe una cuenta PUC con ese código' });
      }
    }

    const updateData = { ...req.body };
    if (updateData.codigo) updateData.codigo = updateData.codigo.toUpperCase();
    if (updateData.naturaleza) updateData.naturaleza = updateData.naturaleza.toLowerCase();
    if (updateData.nombre) updateData.nombre = updateData.nombre.trim();

    const updated = await Puc.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ status: 'Cuenta PUC actualizada', puc: updated });
  } catch (error) {
    console.error('Error al actualizar PUC:', error);
    res.status(500).json({ error: 'Error al actualizar la cuenta PUC' });
  }
};

pucCtrl.deletePuc = async (req, res) => {
  try {
    const puc = await Puc.findById(req.params.id);
    if (!puc) {
      return res.status(404).json({ error: 'Cuenta PUC no encontrada' });
    }

    await Puc.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ status: 'Cuenta PUC deshabilitada' });
  } catch (error) {
    console.error('Error al deshabilitar PUC:', error);
    res.status(500).json({ error: 'Error al deshabilitar la cuenta PUC' });
  }
};

module.exports = pucCtrl;

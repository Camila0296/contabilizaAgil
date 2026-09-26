const Tercero = require('../models/tercero');
const { escapeRegex } = require('../utils/regex');

const terceroCtrl = {};

// Validar formato de email
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return true; // Email es opcional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validar datos de tercero
function validateTerceroData(data) {
  const errors = [];

  if (!data.tipo || typeof data.tipo !== 'string' || data.tipo.trim() === '') {
    errors.push('tipo: requerido (proveedor, cliente, etc.)');
  }

  if (!data.razonSocial || typeof data.razonSocial !== 'string' || data.razonSocial.trim() === '') {
    errors.push('razonSocial: requerido y debe ser string');
  }

  if (!data.tipoDocumento || typeof data.tipoDocumento !== 'string' || data.tipoDocumento.trim() === '') {
    errors.push('tipoDocumento: requerido (CC, NIT, etc.)');
  }

  if (!data.numeroDocumento || typeof data.numeroDocumento !== 'string' || data.numeroDocumento.trim() === '') {
    errors.push('numeroDocumento: requerido');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('email: formato inválido');
  }

  if (data.telefono && typeof data.telefono !== 'string') {
    errors.push('telefono: debe ser string');
  }

  if (data.activo !== undefined && typeof data.activo !== 'boolean') {
    errors.push('activo: debe ser boolean');
  }

  return errors;
}

terceroCtrl.getTerceros = async (req, res) => {
  try {
    const filter = {};

    // Filtros básicos
    if (req.query.tipo) {
      // Un tercero "ambos" es cliente y proveedor a la vez
      filter.tipo = ['cliente', 'proveedor'].includes(req.query.tipo)
        ? { $in: [req.query.tipo, 'ambos'] }
        : req.query.tipo;
    }

    if (req.query.activo === 'true') {
      filter.activo = true;
    } else if (req.query.activo === 'false') {
      filter.activo = false;
    }

    // Búsqueda por texto
    if (req.query.search) {
      const term = req.query.search.trim();
      if (term.length > 0) {
        const regex = new RegExp(escapeRegex(term), 'i');
        filter.$or = [
          { razonSocial: regex },
          { numeroDocumento: regex },
          { email: regex }
        ];
      }
    }

    // Paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Contar total
    const total = await Tercero.countDocuments(filter);

    const terceros = await Tercero
      .find(filter)
      .sort({ razonSocial: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: terceros,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener terceros:', error);
    res.status(500).json({ error: 'Error al obtener los terceros' });
  }
};

terceroCtrl.getTercero = async (req, res) => {
  try {
    const tercero = await Tercero.findById(req.params.id);
    if (!tercero) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }
    res.json(tercero);
  } catch (error) {
    console.error('Error al obtener tercero:', error);
    res.status(500).json({ error: 'Error al obtener el tercero' });
  }
};

terceroCtrl.createTercero = async (req, res) => {
  try {
    const validationErrors = validateTerceroData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validationErrors
      });
    }

    const exists = await Tercero.findOne({ numeroDocumento: req.body.numeroDocumento });
    if (exists) {
      return res.status(400).json({ error: 'Ya existe un tercero con ese número de documento' });
    }

    const terceroData = {
      tipo: req.body.tipo.trim(),
      razonSocial: req.body.razonSocial.trim(),
      tipoDocumento: req.body.tipoDocumento.trim(),
      numeroDocumento: req.body.numeroDocumento.trim(),
      email: req.body.email ? req.body.email.toLowerCase() : undefined,
      telefono: req.body.telefono ? req.body.telefono.trim() : undefined,
      direccion: req.body.direccion ? req.body.direccion.trim() : undefined,
      ciudad: req.body.ciudad ? req.body.ciudad.trim() : undefined,
      contacto: req.body.contacto ? req.body.contacto.trim() : undefined,
      activo: true
    };

    const tercero = await Tercero.create(terceroData);
    res.status(201).json({ status: 'Tercero creado', id: tercero._id, tercero });
  } catch (error) {
    console.error('Error al crear tercero:', error);
    res.status(500).json({ error: 'Error al crear el tercero' });
  }
};

terceroCtrl.updateTercero = async (req, res) => {
  try {
    const validationErrors = validateTerceroData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validationErrors
      });
    }

    const tercero = await Tercero.findById(req.params.id);
    if (!tercero) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }

    // Verificar número de documento único solo si cambió
    if (req.body.numeroDocumento && req.body.numeroDocumento !== tercero.numeroDocumento) {
      const exists = await Tercero.findOne({
        numeroDocumento: req.body.numeroDocumento,
        _id: { $ne: req.params.id }
      });
      if (exists) {
        return res.status(400).json({ error: 'Ya existe un tercero con ese número de documento' });
      }
    }

    const updateData = { ...req.body };
    if (updateData.email) updateData.email = updateData.email.toLowerCase();
    if (updateData.razonSocial) updateData.razonSocial = updateData.razonSocial.trim();

    const updated = await Tercero.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({ status: 'Tercero actualizado', tercero: updated });
  } catch (error) {
    console.error('Error al actualizar tercero:', error);
    res.status(500).json({ error: 'Error al actualizar el tercero' });
  }
};

terceroCtrl.deleteTercero = async (req, res) => {
  try {
    const tercero = await Tercero.findById(req.params.id);
    if (!tercero) {
      return res.status(404).json({ error: 'Tercero no encontrado' });
    }

    await Tercero.findByIdAndUpdate(req.params.id, { activo: false });
    res.json({ status: 'Tercero deshabilitado' });
  } catch (error) {
    console.error('Error al desabilitar tercero:', error);
    res.status(500).json({ error: 'Error al desabilitar el tercero' });
  }
};

module.exports = terceroCtrl;

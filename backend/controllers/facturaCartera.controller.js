const FacturaCartera = require('../models/facturaCartera');
const Sequence = require('../models/sequence');
const Tercero = require('../models/tercero');
const Puc = require('../models/puc');

const facturaCarteraCtrl = {};

// Validar datos de factura cartera
function validateFacturaCarteraData(data) {
  const errors = [];

  if (!data.fecha) {
    errors.push('fecha: es obligatoria');
  } else {
    const fecha = new Date(data.fecha);
    if (isNaN(fecha.getTime())) {
      errors.push('fecha: debe ser una fecha válida (ISO 8601)');
    }
  }

  if (!data.tercero || typeof data.tercero !== 'string' || data.tercero.trim() === '') {
    errors.push('tercero: debe ser un ObjectId válido');
  } else if (!data.tercero.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push('tercero: debe ser un ObjectId válido (24 caracteres hexadecimales)');
  }

  if (!data.monto || typeof data.monto !== 'number' || data.monto <= 0) {
    errors.push('monto: debe ser un número positivo');
  }

  if (!data.puc || typeof data.puc !== 'string' || data.puc.trim() === '') {
    errors.push('puc: debe ser un ObjectId válido');
  } else if (!data.puc.match(/^[0-9a-fA-F]{24}$/)) {
    errors.push('puc: debe ser un ObjectId válido (24 caracteres hexadecimales)');
  }

  if (!data.detalle || typeof data.detalle !== 'string' || data.detalle.trim() === '') {
    errors.push('detalle: debe ser un string no vacío');
  }

  if (!data.naturaleza || !['credito', 'debito'].includes(data.naturaleza.toLowerCase())) {
    errors.push('naturaleza: debe ser "credito" o "debito"');
  }

  if (data.retefuentePct !== undefined && (typeof data.retefuentePct !== 'number' || data.retefuentePct < 0 || data.retefuentePct > 100)) {
    errors.push('retefuentePct: debe estar entre 0 y 100');
  }

  if (data.icaPct !== undefined && (typeof data.icaPct !== 'number' || data.icaPct < 0 || data.icaPct > 100)) {
    errors.push('icaPct: debe estar entre 0 y 100');
  }

  return errors;
}

const getNextConsecutivo = async (tipo) => {
  const typeMap = { factura: 'FAC', creditNote: 'NC', debitNote: 'ND' };
  const prefix = typeMap[tipo] || 'FAC';
  const seqName = `factura_cartera_${prefix}`;

  const seq = await Sequence.findOneAndUpdate(
    { name: seqName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const numeroDocumento = `${prefix}-${String(seq.seq).padStart(3, '0')}`;
  return { consecutivo: seq.seq, numeroDocumento };
};

facturaCarteraCtrl.getFacturasCartera = async (req, res) => {
  try {
    let query = {};
    if (!req.user.roles.includes('administrador') && !req.user.roles.includes('contador')) {
      query.usuario = req.user.id;
    }

    // Paginación
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Filtros opcionales
    if (req.query.tipo && ['factura', 'creditNote', 'debitNote'].includes(req.query.tipo)) {
      query.tipo = req.query.tipo;
    }
    if (req.query.naturaleza && ['credito', 'debito'].includes(req.query.naturaleza.toLowerCase())) {
      query.naturaleza = req.query.naturaleza.toLowerCase();
    }

    // Contar total de registros
    const total = await FacturaCartera.countDocuments(query);

    // Buscar facturas con paginación
    const facturas = await FacturaCartera
      .find(query)
      .populate('tercero')
      .populate('puc')
      .populate('usuario', 'nombres apellidos')
      .sort({ fecha: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      data: facturas,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error al obtener facturas cartera:', error);
    res.status(500).json({ error: 'Error al obtener las facturas' });
  }
};

facturaCarteraCtrl.getFacturaCartera = async (req, res) => {
  try {
    const factura = await FacturaCartera.findById(req.params.id).populate('tercero').populate('puc').populate('usuario', 'nombres apellidos');
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    if ((!req.user.roles.includes('administrador') && !req.user.roles.includes('contador')) && factura.usuario._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta factura' });
    }
    res.json(factura);
  } catch (error) {
    console.error('Error al obtener factura cartera:', error);
    res.status(500).json({ error: 'Error al obtener la factura' });
  }
};

facturaCarteraCtrl.createFacturaCartera = async (req, res) => {
  try {
    const validationErrors = validateFacturaCarteraData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validationErrors
      });
    }

    // Validar que tercero y puc existan
    const terceroExists = await Tercero.findById(req.body.tercero);
    if (!terceroExists) {
      return res.status(400).json({ error: 'El cliente/tercero no existe' });
    }

    const pucExists = await Puc.findById(req.body.puc);
    if (!pucExists) {
      return res.status(400).json({ error: 'La cuenta PUC no existe' });
    }

    const docType = req.body.tipo || 'factura';
    if (!['factura', 'creditNote', 'debitNote'].includes(docType)) {
      return res.status(400).json({ error: 'Tipo de documento inválido' });
    }

    const { consecutivo, numeroDocumento } = await getNextConsecutivo(docType);
    const facturaData = {
      tipo: docType,
      consecutivo,
      numeroDocumento,
      fecha: req.body.fecha,
      tercero: req.body.tercero,
      monto: req.body.monto,
      puc: req.body.puc,
      detalle: req.body.detalle,
      naturaleza: req.body.naturaleza,
      retefuentePct: req.body.retefuentePct || 0,
      icaPct: req.body.icaPct || 0,
      usuario: req.user.id
    };

    const factura = new FacturaCartera(facturaData);
    await factura.save();
    res.status(201).json({ status: 'Factura guardada', id: factura._id, factura });
  } catch (error) {
    console.error('Error al crear factura cartera:', error);
    const errorMsg = error.message || 'Error al crear la factura';
    res.status(500).json({ error: errorMsg, details: error.message });
  }
};

facturaCarteraCtrl.updateFacturaCartera = async (req, res) => {
  try {
    const validationErrors = validateFacturaCarteraData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validación fallida',
        details: validationErrors
      });
    }

    const factura = await FacturaCartera.findById(req.params.id);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    if ((!req.user.roles.includes('administrador') && !req.user.roles.includes('contador')) && factura.usuario._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta factura' });
    }

    const updateData = { ...req.body };
    delete updateData.numeroDocumento;
    delete updateData.consecutivo;
    delete updateData.tipo;

    const updated = await FacturaCartera.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('tercero').populate('puc').populate('usuario', 'nombres apellidos');

    res.json({ status: 'Factura actualizada', factura: updated });
  } catch (error) {
    console.error('Error al actualizar factura cartera:', error);
    res.status(500).json({ error: 'Error al actualizar la factura' });
  }
};

facturaCarteraCtrl.registrarPago = async (req, res) => {
  try {
    const { monto, referencia, cuenta } = req.body;

    if (!monto || monto <= 0) {
      return res.status(400).json({ error: 'Monto debe ser mayor a 0' });
    }

    const factura = await FacturaCartera.findById(req.params.id);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Validar que el usuario sea propietario o admin
    if (factura.usuario.toString() !== req.user.id && !req.user.roles.includes('administrador') && !req.user.roles.includes('contador')) {
      return res.status(403).json({ error: 'No tienes permiso para registrar pagos en esta factura' });
    }

    // Validar que el monto no exceda el saldo pendiente
    const saldoPendiente = factura.monto - (factura.totalPagado || 0);
    if (monto > saldoPendiente) {
      return res.status(400).json({ error: `El monto excede el saldo pendiente (${saldoPendiente})` });
    }

    // Agregar pago al array
    if (!factura.pagos) factura.pagos = [];
    factura.pagos.push({
      fechaPago: new Date(),
      monto,
      referencia,
      cuenta
    });

    // Actualizar total pagado
    factura.totalPagado = (factura.totalPagado || 0) + monto;

    // Guardar factura
    await factura.save();

    res.json({
      message: 'Pago registrado correctamente',
      factura,
      estadoPago: factura.estadoPago,
      saldoPendiente: factura.saldoPendiente
    });
  } catch (error) {
    console.error('Error al registrar pago:', error);
    res.status(500).json({ error: 'Error al registrar el pago' });
  }
};

facturaCarteraCtrl.deleteFacturaCartera = async (req, res) => {
  try {
    console.log('[DELETE] Buscando factura con id:', req.params.id);
    const factura = await FacturaCartera.findById(req.params.id);
    console.log('[DELETE] Factura encontrada:', !!factura, { usuario: factura?.usuario, usuarioType: typeof factura?.usuario });
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    console.log('[DELETE] Validando permisos. isAdmin:', req.user.roles.includes('administrador'), 'isContador:', req.user.roles.includes('contador'));
    if ((!req.user.roles.includes('administrador') && !req.user.roles.includes('contador')) && factura.usuario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta factura' });
    }

    console.log('[DELETE] Permisos validados. Actualizando estado...');
    const result = await FacturaCartera.findByIdAndUpdate(req.params.id, { estado: 'anulada' });
    console.log('[DELETE] Actualización completada:', !!result);
    res.json({ message: 'Factura anulada correctamente' });
  } catch (error) {
    console.error('Error al anular factura cartera:', error.message);
    res.status(500).json({ error: 'Error al anular la factura' });
  }
};

module.exports = facturaCarteraCtrl;

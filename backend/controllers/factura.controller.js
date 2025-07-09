const Factura = require('../models/factura');

const facturaCtrl = {};

facturaCtrl.getFacturas = async (req, res) => {
  const facturas = await Factura.find().populate('usuario');
  res.json(facturas);
};

facturaCtrl.getFactura = async (req, res) => {
  const factura = await Factura.findById(req.params.id).populate('usuario');
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json(factura);
};

facturaCtrl.createFactura = async (req, res) => {
  const { numero, fecha, proveedor, monto, puc, detalle, naturaleza } = req.body;
  if (!numero || !fecha || !proveedor || !monto || !puc || !detalle || !naturaleza) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const exists = await Factura.findOne({ numero });
  if (exists) return res.status(400).json({ error: 'Ya existe una factura con ese número' });
  const factura = new Factura(req.body);
  await factura.save();
  res.json({ status: 'Factura guardada' });
};

facturaCtrl.updateFactura = async (req, res) => {
  const { numero, fecha, proveedor, monto, puc, detalle, naturaleza } = req.body;
  if (!numero || !fecha || !proveedor || !monto || !puc || !detalle || !naturaleza) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const exists = await Factura.findOne({ numero, _id: { $ne: req.params.id } });
  if (exists) return res.status(400).json({ error: 'Ya existe una factura con ese número' });
  const factura = await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json({ status: 'Factura actualizada' });
};

facturaCtrl.deleteFactura = async (req, res) => {
  const factura = await Factura.findByIdAndDelete(req.params.id);
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json({ status: 'Factura eliminada' });
};

facturaCtrl.getReportes = async (req, res) => {
  try {
    // Obtener estadísticas generales
    const totalFacturas = await Factura.countDocuments();
    const totalMonto = await Factura.aggregate([
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    
    // Calcular totales de impuestos
    const totalesImpuestos = await Factura.aggregate([
      { $group: { 
        _id: null, 
        totalIva: { $sum: '$impuestos.iva' },
        totalReteFuente: { $sum: '$impuestos.retefuente' },
        totalIca: { $sum: '$impuestos.ica' }
      }}
    ]);
    
    // Estadísticas por naturaleza
    const porNaturaleza = await Factura.aggregate([
      { $group: { _id: '$naturaleza', count: { $sum: 1 }, total: { $sum: '$monto' } } }
    ]);
    
    // Top 5 proveedores
    const topProveedores = await Factura.aggregate([
      { $group: { _id: '$proveedor', count: { $sum: 1 }, total: { $sum: '$monto' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    // Facturas por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    const porMes = await Factura.aggregate([
      { $match: { fecha: { $gte: seisMesesAtras.toISOString().split('T')[0] } } },
      { $group: { 
        _id: { $substr: ['$fecha', 0, 7] }, 
        count: { $sum: 1 }, 
        total: { $sum: '$monto' } 
      }},
      { $sort: { _id: 1 } }
    ]);
    
    // Top 5 cuentas PUC
    const topPUC = await Factura.aggregate([
      { $group: { _id: '$puc', count: { $sum: 1 }, total: { $sum: '$monto' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);
    
    // Facturas recientes (últimas 10)
    const facturasRecientes = await Factura.find()
      .sort({ fecha: -1 })
      .limit(10)
      .populate('usuario');
    
    // Transformar datos para el frontend
    const facturasPorMes = porMes.map(item => ({
      mes: item._id,
      cantidad: item.count,
      monto: item.total
    }));
    
    const topProveedoresFormateado = topProveedores.map(item => ({
      proveedor: item._id,
      cantidad: item.count,
      monto: item.total
    }));
    
    res.json({
      totalFacturas,
      totalMonto: totalMonto[0]?.total || 0,
      totalIva: totalesImpuestos[0]?.totalIva || 0,
      totalReteFuente: totalesImpuestos[0]?.totalReteFuente || 0,
      totalIca: totalesImpuestos[0]?.totalIca || 0,
      facturasPorMes,
      topProveedores: topProveedoresFormateado,
      facturasRecientes
    });
  } catch (error) {
    console.error('Error generando reportes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = facturaCtrl;
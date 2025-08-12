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
  
  // Agregar el usuario que crea la factura
  const facturaData = {
    ...req.body,
    usuario: req.user.id
  };
  
  const factura = new Factura(facturaData);
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

facturaCtrl.getDashboardStats = async (req, res) => {
  try {
    // Obtener estadísticas generales
    const totalFacturas = await Factura.countDocuments();
    const totalMonto = await Factura.aggregate([
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    
    // Calcular ingresos del mes actual
    const mesActual = new Date();
    const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    
    const ingresosMes = await Factura.aggregate([
      { 
        $match: { 
          fecha: { 
            $gte: primerDiaMes.toISOString().split('T')[0],
            $lte: ultimoDiaMes.toISOString().split('T')[0]
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    
    // Calcular cambio porcentual vs mes anterior
    const mesAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth(), 0);
    
    const ingresosMesAnterior = await Factura.aggregate([
      { 
        $match: { 
          fecha: { 
            $gte: mesAnterior.toISOString().split('T')[0],
            $lte: ultimoDiaMesAnterior.toISOString().split('T')[0]
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    
    const cambioPorcentual = ingresosMesAnterior[0]?.total 
      ? ((ingresosMes[0]?.total || 0) - ingresosMesAnterior[0].total) / ingresosMesAnterior[0].total * 100
      : 0;
    
    // Obtener usuarios activos
    const User = require('../models/user');
    const usuariosActivos = await User.countDocuments({ activo: true });
    
    // Obtener usuarios pendientes de aprobación
    const usuariosPendientes = await User.countDocuments({ approved: false });
    
    // Facturas recientes (últimas 5)
    const facturasRecientes = await Factura.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('usuario', 'nombres apellidos');
    
    res.json({
      totalFacturas,
      totalMonto: totalMonto[0]?.total || 0,
      ingresosMes: ingresosMes[0]?.total || 0,
      cambioPorcentual: Math.round(cambioPorcentual * 100) / 100,
      usuariosActivos,
      usuariosPendientes,
      facturasRecientes: facturasRecientes.map(f => ({
        id: f._id,
        numero: f.numero,
        proveedor: f.proveedor,
        monto: f.monto,
        fecha: f.fecha,
        usuario: f.usuario ? `${f.usuario.nombres} ${f.usuario.apellidos}` : 'Usuario no disponible'
      }))
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas del dashboard:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
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
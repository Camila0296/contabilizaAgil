const Factura = require('../models/factura');

const facturaCtrl = {};

facturaCtrl.getFacturas = async (req, res) => {
  try {
    let query = {};
    // Si el usuario no es administrador, solo puede ver sus propias facturas
    if (!req.user.roles.includes('admin')) {
      query.usuario = req.user.id;
    }
    
    // Buscar facturas con el filtro aplicado
    const facturas = await Factura.find(query).populate('usuario', 'nombre email');
    
    res.json(facturas);
  } catch (error) {
    console.error('Error al obtener facturas:', error);
    res.status(500).json({ error: 'Error al obtener las facturas' });
  }
};

facturaCtrl.getFactura = async (req, res) => {
  try {
    const factura = await Factura.findById(req.params.id).populate('usuario', 'nombres apellidos');
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    // Verificar permisos: el usuario es admin o es el dueño de la factura
    if (!req.user.roles.includes('admin') && factura.usuario._id.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta factura' });
    }
    
    res.json(factura);
  } catch (error) {
    console.error('Error al obtener factura:', error);
    res.status(500).json({ error: 'Error al obtener la factura' });
  }
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
  try {
    const { numero, fecha, proveedor, monto, puc, detalle, naturaleza } = req.body;
    if (!numero || !fecha || !proveedor || !monto || !puc || !detalle || !naturaleza) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Primero obtener la factura para verificar permisos
    const facturaExistente = await Factura.findById(req.params.id);
    if (!facturaExistente) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Verificar permisos: el usuario es admin o es el dueño de la factura
    if (!req.user.roles.includes('admin') && facturaExistente.usuario.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar esta factura' });
    }

    // Verificar si ya existe otra factura con el mismo número
    const existeConMismoNumero = await Factura.findOne({ 
      numero, 
      _id: { $ne: req.params.id } 
    });
    
    if (existeConMismoNumero) {
      return res.status(400).json({ error: 'Ya existe una factura con ese número' });
    }

    // Actualizar la factura
    const facturaActualizada = await Factura.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true }
    ).populate('usuario', 'nombres apellidos');
    
    res.json({ status: 'Factura actualizada', factura: facturaActualizada });
  } catch (error) {
    console.error('Error al actualizar factura:', error);
    res.status(500).json({ error: 'Error al actualizar la factura' });
  }
};

facturaCtrl.deleteFactura = async (req, res) => {
  try {
    // Eliminar una factura
    // Primero obtener la factura para verificar permisos
    const factura = await Factura.findById(req.params.id);
    
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    
    // Verificar permisos: admin puede eliminar todas, usuario solo las suyas
    const isAdmin = req.user.roles && req.user.roles.includes('admin');
    const isOwner = factura.usuario && factura.usuario.toString() === req.user.id;
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ 
        error: 'No tienes permiso para eliminar esta factura' 
      });
    }
    
    // Eliminar la factura
    await Factura.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Factura eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar factura:', error);
    res.status(500).json({ error: 'Error al eliminar la factura' });
  }
};

facturaCtrl.getDashboardStats = async (req, res) => {
  try {
    // Crear filtro basado en el rol del usuario
    let matchFilter = {};
    if (!req.user.roles.includes('admin')) {
      matchFilter.usuario = req.user.id;
    }

    // Obtener estadísticas generales
    const totalFacturas = await Factura.countDocuments(matchFilter);
    const totalMonto = await Factura.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    
    // Calcular ingresos del mes actual
    const mesActual = new Date();
    const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    const ultimoDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    
    const matchMesActual = {
      fecha: { 
        $gte: primerDiaMes.toISOString().split('T')[0],
        $lte: ultimoDiaMes.toISOString().split('T')[0]
      }
    };
    
    // Aplicar filtro de usuario si no es admin
    if (!req.user.roles.includes('admin')) {
      matchMesActual.usuario = new mongoose.Types.ObjectId(req.user.id);
    }
    
    const ingresosMes = await Factura.aggregate([
      { $match: matchMesActual },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ]);
    
    // Calcular cambio porcentual vs mes anterior
    const mesAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1);
    const ultimoDiaMesAnterior = new Date(mesActual.getFullYear(), mesActual.getMonth(), 0);
    
    const matchMesAnterior = {
      fecha: { 
        $gte: mesAnterior.toISOString().split('T')[0],
        $lte: ultimoDiaMesAnterior.toISOString().split('T')[0]
      }
    };
    
    // Aplicar filtro de usuario si no es admin
    if (!req.user.roles.includes('admin')) {
      matchMesAnterior.usuario = new mongoose.Types.ObjectId(req.user.id);
    }
    
    const ingresosMesAnterior = await Factura.aggregate([
      { $match: matchMesAnterior },
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
    const facturasRecientes = await Factura.find(matchFilter)
      .sort({ fecha: -1 })
      .limit(5)
      .populate('usuario', 'nombre email');
    
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
    console.log('=== INICIO DE GENERACIÓN DE REPORTES ===');
    console.log('Generando reporte con todas las facturas del sistema');
    
    // No hay filtro por usuario, se muestran todas las facturas
    const baseMatch = {};
    console.log('Mostrando todas las facturas del sistema');

    // Verificar si hay facturas que coincidan con el filtro
    const facturasCount = await Factura.countDocuments(baseMatch);
    console.log(`Total de facturas encontradas: ${facturasCount}`);
    
    if (facturasCount === 0) {
      console.log('No se encontraron facturas con el filtro:', baseMatch);
    }

    // Obtener estadísticas generales
    const totalFacturas = facturasCount;
    
    const totalMontoAgg = [
      { $match: baseMatch },
      { $group: { _id: null, total: { $sum: '$monto' } } }
    ];
    const totalMonto = await Factura.aggregate(totalMontoAgg);
    
    // Calcular totales de impuestos
    const totalesImpuestosAgg = [
      { $match: baseMatch },
      { $group: { 
        _id: null, 
        totalIva: { $sum: '$impuestos.iva' },
        totalReteFuente: { $sum: '$impuestos.retefuente' },
        totalIca: { $sum: '$impuestos.ica' }
      }}
    ];
    const totalesImpuestos = await Factura.aggregate(totalesImpuestosAgg);
    
    // Estadísticas por naturaleza
    const porNaturalezaAgg = [
      { $match: baseMatch },
      { $group: { _id: '$naturaleza', count: { $sum: 1 }, total: { $sum: '$monto' } } }
    ];
    const porNaturaleza = await Factura.aggregate(porNaturalezaAgg);
    
    // Top 5 proveedores
    const topProveedoresAgg = [
      { $match: baseMatch },
      { $group: { _id: '$proveedor', count: { $sum: 1 }, total: { $sum: '$monto' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ];
    const topProveedores = await Factura.aggregate(topProveedoresAgg);
    
    // Facturas por mes (últimos 6 meses)
    const seisMesesAtras = new Date();
    seisMesesAtras.setMonth(seisMesesAtras.getMonth() - 6);
    
    const porMesAgg = [
      { 
        $match: { 
          ...baseMatch,
          fecha: { $gte: seisMesesAtras.toISOString().split('T')[0] } 
        } 
      },
      { $group: { 
        _id: { $substr: ['$fecha', 0, 7] }, 
        count: { $sum: 1 }, 
        total: { $sum: '$monto' } 
      }},
      { $sort: { _id: 1 } }
    ];
    const porMes = await Factura.aggregate(porMesAgg);
    
    // Top 5 cuentas PUC
    const topPUCAgg = [
      { $match: baseMatch },
      { $group: { _id: '$puc', count: { $sum: 1 }, total: { $sum: '$monto' } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ];
    const topPUC = await Factura.aggregate(topPUCAgg);
    
    // Facturas recientes (últimas 10)
    const facturasRecientes = await Factura.find(baseMatch)
      .sort({ fecha: -1 })
      .limit(10)
      .populate('usuario', 'nombre email');
    
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
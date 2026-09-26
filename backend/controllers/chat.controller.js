const mongoose = require('mongoose');
const User = require('../models/user');
const Factura = require('../models/factura');
const FacturaCartera = require('../models/facturaCartera');
const { aiService, responder } = require('../services/ai.service');

// Contexto del usuario para el chat: estadísticas sobre TODAS sus facturas, no solo las recientes
async function construirContexto(userId) {
  const usuario = new mongoose.Types.ObjectId(userId);
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

  const [user, totales, delMes, recientes, cartera] = await Promise.all([
    User.findById(userId).populate('role').select('nombres apellidos role'),
    Factura.aggregate([
      { $match: { usuario } },
      { $group: { _id: null, cantidad: { $sum: 1 }, monto: { $sum: '$monto' }, iva: { $sum: '$impuestos.iva' } } }
    ]),
    Factura.aggregate([
      { $match: { usuario, fecha: { $gte: inicioMes } } },
      { $group: { _id: null, cantidad: { $sum: 1 }, monto: { $sum: '$monto' } } }
    ]),
    Factura.find({ usuario }).sort({ fecha: -1, _id: -1 }).limit(5).select('numero fecha proveedor monto'),
    FacturaCartera.aggregate([
      { $match: { usuario, estado: { $ne: 'anulada' }, estadoPago: { $ne: 'Pagada' } } },
      {
        $group: {
          _id: null,
          pendientes: { $sum: 1 },
          saldo: { $sum: { $ifNull: ['$saldoPendiente', '$monto'] } },
          vencidas: { $sum: { $cond: [{ $lt: ['$fechaVencimiento', ahora] }, 1, 0] } }
        }
      }
    ])
  ]);

  return {
    user: {
      nombres: user ? user.nombres : '',
      role: user && user.role ? user.role.name : ''
    },
    stats: {
      totalFacturas: totales[0]?.cantidad || 0,
      totalMonto: totales[0]?.monto || 0,
      totalIva: totales[0]?.iva || 0,
      facturasMes: delMes[0]?.cantidad || 0,
      montoMes: delMes[0]?.monto || 0
    },
    cartera: {
      facturasPendientes: cartera[0]?.pendientes || 0,
      saldoPendiente: cartera[0]?.saldo || 0,
      facturasVencidas: cartera[0]?.vencidas || 0
    },
    facturas: recientes.map(f => ({ numero: f.numero, fecha: f.fecha, proveedor: f.proveedor, monto: f.monto }))
  };
}

async function sendMessage(req, res) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere el historial de mensajes' });
    }

    // Solo mensajes con texto y como máximo los últimos 10
    const historial = messages
      .filter(m => m && typeof m.content === 'string' && m.content.trim())
      .slice(-10);
    if (historial.length === 0) {
      return res.status(400).json({ error: 'El mensaje está vacío' });
    }

    const contexto = await construirContexto(req.user.id);
    const { source, ...result } = await responder(historial, contexto);
    res.json(result);
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje' });
  }
}

function healthCheck(req, res) {
  res.json({ provider: aiService.name, status: 'ok' });
}

module.exports = { sendMessage, healthCheck, construirContexto };

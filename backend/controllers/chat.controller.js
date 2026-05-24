const User = require('../models/user');
const Factura = require('../models/factura');
const { aiService } = require('../services/ai.service');

async function sendMessage(req, res) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Se requiere el historial de mensajes' });
    }

    const [user, facturas] = await Promise.all([
      User.findById(req.user.id).populate('role').select('-password'),
      Factura.find({ usuario: req.user.id })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('numero fecha proveedor monto naturaleza impuestos puc')
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const facturasMes = facturas.filter(f => new Date(f.fecha) >= startOfMonth).length;
    const totalMonto = facturas.reduce((sum, f) => sum + (f.monto || 0), 0);
    const totalIva = facturas.reduce((sum, f) => sum + ((f.impuestos && f.impuestos.iva) || 0), 0);

    const userContext = {
      user: {
        nombres: user ? user.nombres : '',
        apellidos: user ? user.apellidos : '',
        email: user ? user.email : '',
        role: user && user.role ? user.role.name : ''
      },
      stats: {
        totalFacturas: facturas.length,
        totalMonto,
        totalIva,
        facturasMes
      },
      facturas: facturas.map(f => ({
        numero: f.numero,
        fecha: f.fecha,
        proveedor: f.proveedor,
        monto: f.monto,
        naturaleza: f.naturaleza
      }))
    };

    const result = await aiService.chat(messages, userContext);
    res.json(result);
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({ error: 'Error al procesar el mensaje' });
  }
}

function healthCheck(req, res) {
  res.json({ provider: aiService.name, status: 'ok' });
}

module.exports = { sendMessage, healthCheck };

const mongoose = require('mongoose');

const FacturaSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  fecha: { type: Date, required: true },
  proveedor: { type: String, required: true },
  monto: { type: Number, required: true },
  puc: { type: String, required: true }, // Plan Único de Cuentas
  detalle: { type: String, required: true },
  naturaleza: { type: String, enum: ['credito', 'debito'], required: true },
  impuestos: {
    iva: { type: Number, default: 0 },
    retefuente: { type: Number, default: 0 },
    ica: { type: Number, default: 0 },
    reteiva: { type: Number, default: 0 }
  },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Factura', FacturaSchema);
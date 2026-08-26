const mongoose = require('mongoose');
const { calcularImpuestos } = require('../utils/impuestosCalculator');

const FacturaSchema = new mongoose.Schema({
  numero: { type: String, required: true, unique: true },
  fecha: { type: Date, required: true },
  proveedor: { type: String, required: true },
  monto: { type: Number, required: true },
  puc: { type: String, required: true }, // Plan Único de Cuentas
  detalle: { type: String, required: true },
  naturaleza: { type: String, enum: ['credito', 'debito'], required: true },
  retefuentePct: { type: Number, default: 0 },
  icaPct: { type: Number, default: 0 },
  impuestos: {
    iva: { type: Number, default: 0 },
    retefuente: { type: Number, default: 0 },
    ica: { type: Number, default: 0 }
  },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Calcular IVA automáticamente al 19% antes de guardar o actualizar
FacturaSchema.pre('save', function(next) {
  if (this.monto != null) {
    this.impuestos = calcularImpuestos(this.monto, this.retefuentePct, this.icaPct);
  }
  next();
});

FacturaSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update?.monto != null) {
    update.impuestos = calcularImpuestos(update.monto, update.retefuentePct || this.retefuentePct, update.icaPct || this.icaPct);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('Factura', FacturaSchema);
const mongoose = require('mongoose');
const { calcularImpuestos } = require('../utils/impuestosCalculator');

const FacturaCarteraSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['factura', 'creditNote', 'debitNote'], default: 'factura' },
  consecutivo: { type: Number, required: true },
  numeroDocumento: { type: String, required: true, unique: true },
  fecha: { type: Date, required: true },
  tercero: { type: mongoose.Schema.Types.ObjectId, ref: 'Tercero', required: true },
  monto: { type: Number, required: true },
  puc: { type: mongoose.Schema.Types.ObjectId, ref: 'Puc', required: true },
  detalle: { type: String, required: true },
  naturaleza: { type: String, enum: ['credito', 'debito'], required: true },
  retefuentePct: { type: Number, default: 0 },
  icaPct: { type: Number, default: 0 },
  impuestos: {
    iva: { type: Number, default: 0 },
    retefuente: { type: Number, default: 0 },
    ica: { type: Number, default: 0 }
  },
  estado: { type: String, enum: ['activa', 'anulada'], default: 'activa' },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

FacturaCarteraSchema.pre('save', function(next) {
  if (this.monto != null) {
    this.impuestos = calcularImpuestos(this.monto, this.retefuentePct, this.icaPct);
  }
  next();
});

FacturaCarteraSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update?.monto != null) {
    update.impuestos = calcularImpuestos(update.monto, update.retefuentePct || this.retefuentePct, update.icaPct || this.icaPct);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('FacturaCartera', FacturaCarteraSchema);

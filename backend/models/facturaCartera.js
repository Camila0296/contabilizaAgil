const mongoose = require('mongoose');

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
    this.impuestos = this.impuestos || {};
    this.impuestos.iva = +(this.monto * 0.19).toFixed(2);
    this.impuestos.retefuente = +(this.monto * (this.retefuentePct || 0) / 100).toFixed(2);
    this.impuestos.ica = +(this.monto * (this.icaPct || 0) / 100).toFixed(2);
  }
  next();
});

FacturaCarteraSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update?.monto != null) {
    update.impuestos = update.impuestos || {};
    update.impuestos.iva = +(update.monto * 0.19).toFixed(2);
    update.impuestos.retefuente = +(update.monto * (update.retefuentePct || 0) / 100).toFixed(2);
    update.impuestos.ica = +(update.monto * (update.icaPct || 0) / 100).toFixed(2);
    this.setUpdate(update);
  }
  next();
});

module.exports = mongoose.model('FacturaCartera', FacturaCarteraSchema);

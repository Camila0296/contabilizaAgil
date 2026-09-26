const mongoose = require('mongoose');
const { calcularImpuestos } = require('../utils/impuestosCalculator');

const FacturaCarteraSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['factura', 'creditNote', 'debitNote'], default: 'factura' },
  consecutivo: { type: Number, required: true },
  numeroDocumento: { type: String, required: true, unique: true, sparse: true },
  fecha: { type: Date, required: true },
  fechaVencimiento: { type: Date },
  plazo: { type: Number, default: 30 }, // plazo en días
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
    ica: { type: Number, default: 0 },
    totalAPagar: { type: Number, default: 0 }
  },
  estadoPago: { type: String, enum: ['Pendiente', 'Pagada', 'Parcialmente Pagada'], default: 'Pendiente' },
  saldoPendiente: { type: Number },
  totalPagado: { type: Number, default: 0 },
  pagos: [{
    fechaPago: { type: Date },
    monto: { type: Number },
    referencia: { type: String }, // referencia de pago (cheque, transferencia, etc)
    cuenta: { type: String } // cuenta donde se registró el pago (1110, 1105)
  }],
  estado: { type: String, enum: ['activa', 'anulada'], default: 'activa' },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

FacturaCarteraSchema.pre('save', function(next) {
  if (this.monto != null) {
    this.impuestos = calcularImpuestos(this.monto, this.retefuentePct, this.icaPct);
  }

  // Calcular fecha de vencimiento si no existe
  if (this.fecha && !this.fechaVencimiento) {
    const vencimiento = new Date(this.fecha);
    vencimiento.setDate(vencimiento.getDate() + (this.plazo || 30));
    this.fechaVencimiento = vencimiento;
  }

  // Calcular saldo pendiente
  if (this.monto != null) {
    const totalPagado = this.totalPagado || 0;
    this.saldoPendiente = this.monto - totalPagado;

    // Actualizar estado de pago
    if (this.saldoPendiente <= 0) {
      this.estadoPago = 'Pagada';
    } else if (totalPagado > 0) {
      this.estadoPago = 'Parcialmente Pagada';
    } else {
      this.estadoPago = 'Pendiente';
    }
  }

  next();
});

FacturaCarteraSchema.pre('findOneAndUpdate', async function() {
  const update = this.getUpdate();
  if (update?.monto != null) {
    // Los % no vienen en la actualización: tomarlos del documento guardado
    let { retefuentePct, icaPct } = update;
    if (retefuentePct == null || icaPct == null) {
      const actual = await this.model.findOne(this.getQuery()).select('retefuentePct icaPct').lean();
      retefuentePct = retefuentePct ?? actual?.retefuentePct;
      icaPct = icaPct ?? actual?.icaPct;
    }
    update.impuestos = calcularImpuestos(update.monto, retefuentePct, icaPct);
    this.setUpdate(update);
  }
});

module.exports = mongoose.model('FacturaCartera', FacturaCarteraSchema);

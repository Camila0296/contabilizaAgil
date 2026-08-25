const mongoose = require('mongoose');

const TerceroSchema = new mongoose.Schema({
  tipo: { type: String, enum: ['cliente', 'proveedor', 'ambos'], required: true },
  razonSocial: { type: String, required: true },
  tipoDocumento: { type: String, enum: ['CC', 'NIT', 'CE', 'PASAPORTE'], required: true },
  numeroDocumento: { type: String, required: true, unique: true },
  email: { type: String },
  telefono: { type: String },
  direccion: { type: String },
  ciudad: { type: String },
  contacto: { type: String },
  activo: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Tercero', TerceroSchema);

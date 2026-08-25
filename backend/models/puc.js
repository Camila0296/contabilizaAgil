const mongoose = require('mongoose');

const PucSchema = new mongoose.Schema({
  codigo: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  naturaleza: { type: String, enum: ['debito', 'credito'], required: true },
  activo: { type: Boolean, default: true }
});

module.exports = mongoose.model('Puc', PucSchema);

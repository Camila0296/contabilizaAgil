const mongoose = require('mongoose');

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['administrador', 'contador', 'analista', 'auxiliar'],
    lowercase: true
  },
  nivel: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    description: '1=admin, 2=contador, 3=analista, 4=auxiliar'
  },
  descripcion: {
    type: String,
    required: true
  },
  permisos: [{
    type: String,
    default: []
  }]
}, { timestamps: true });

module.exports = mongoose.model('Role', RoleSchema);
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Información básica
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Información de contacto (requerida)
  telefono: { type: String, required: true, match: /^[0-9]{10,}$/ },
  direccion: { type: String },
  ciudad: { type: String },

  // Información de identificación
  tipoDocumento: { type: String, enum: ['CC', 'NIT', 'CE', 'PASAPORTE', 'CÉDULA'], default: 'CC' },
  numeroDocumento: { type: String, required: true, unique: true },

  // Documento de identidad (base64 simulado)
  documentoIdentidad: {
    tipo: String, // 'image/jpeg', 'image/png', etc
    datos: String, // base64 del archivo
    fechaCargue: Date,
    verificado: { type: Boolean, default: false }
  },

  // Información de seguridad
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  activo: { type: Boolean, default: true },
  approved: { type: Boolean, default: false },

  // Auditoría
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: Date,
  rejectionReason: String,

  // Registro de cambios
  auditLog: [{
    accion: String,
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fecha: { type: Date, default: Date.now },
    detalles: String
  }]
});

module.exports = mongoose.model('User', UserSchema);
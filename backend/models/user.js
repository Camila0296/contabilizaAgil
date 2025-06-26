const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  nombres: { type: String, required: true },
  apellidos: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  activo: { type: Boolean, default: true },
  approved: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
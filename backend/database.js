const mongoose = require('mongoose');

async function connectDB() {
  let uri = 'mongodb://localhost:27017/CABD';

  // Usa base en memoria si está en Codespaces o NODE_ENV=development
  if (process.env.CODESPACES || process.env.USE_MEM_MONGO === 'true' || process.env.NODE_ENV === 'development') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log('Usando MongoDB en memoria');
  }

  await mongoose.connect(uri);
  console.log('DB is connected');

  // --- Agregar rol y usuario admin si no existen ---
  const Role = require('./models/role');
  const User = require('./models/user');
  const bcrypt = require('bcryptjs');

  // Crea el rol admin si no existe
  let adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'admin' });
    console.log('Rol admin creado');
  }

  // Crea el usuario admin si no existe
  let adminUser = await User.findOne({ email: 'admin@admin.com' });
  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    adminUser = await User.create({
      nombres: 'Admin',
      apellidos: 'Principal',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: adminRole._id
    });
    console.log('Usuario admin creado en la base temporal');
  }
}

connectDB().catch(err => console.error(err));

module.exports = mongoose;
const mongoose = require('mongoose');
const seedInitialData = require('./utils/seedInitialData');
let mongod = null; // Guardar referencia global

async function connectDB() {
  // En tests, setup.js va a configurar MongoDB. No hacer nada aquí
  if (process.env.NODE_ENV === 'test') {
    // setup.js ejecutará beforeAll y conectará. Solo retornar.
    return;
  }

  let uri = 'mongodb://localhost:27017/CABD';

  // Usa base en memoria si está en Codespaces o NODE_ENV=development
  if (process.env.CODESPACES || process.env.USE_MEM_MONGO === 'true' || process.env.NODE_ENV === 'development') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log('Usando MongoDB en memoria');
  }

  await mongoose.connect(uri);
  console.log('DB is connected');

  // En tests, NO crear roles/usuarios admin (los tests crean los suyos)
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  // Roles, usuario admin y catálogo PUC iniciales (solo en producción/dev)
  await seedInitialData();
}

connectDB().catch(err => console.error(err));

module.exports = mongoose;
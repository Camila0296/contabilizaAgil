const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Configurar variables de entorno ANTES de importar app
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Configurar MongoDB en memoria antes de todas las pruebas
beforeAll(async () => {
  // Desconectar de cualquier conexión anterior
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);
});

// Limpiar la base de datos después de cada prueba
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Cerrar conexión después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
}); 
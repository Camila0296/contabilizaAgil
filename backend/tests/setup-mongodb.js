// Setup para tests con MongoDB en memoria
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Configurar variables de entorno
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = 'mock-key-for-testing';

// Conectar a MongoDB en memoria antes de los tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Crear roles estándar
  const Role = require('../models/role');
  const roles = [
    { name: 'administrador', nivel: 1, descripcion: 'Administrador' },
    { name: 'contador', nivel: 2, descripcion: 'Contador' },
    { name: 'analista', nivel: 3, descripcion: 'Analista' },
    { name: 'auxiliar', nivel: 4, descripcion: 'Auxiliar' }
  ];

  for (const roleData of roles) {
    const existing = await Role.findOne({ name: roleData.name });
    if (!existing) {
      await Role.create(roleData);
    }
  }
});

// Limpiar datos después de cada test
afterEach(async () => {
  if (mongoose.connection.db) {
    const collections = mongoose.connection.db.collections;
    for (let collection of Object.values(collections)) {
      // No limpiar roles - mantenerlos para todos los tests
      if (collection.collectionName !== 'roles') {
        await collection.deleteMany({});
      }
    }
  }
});

// Desconectar después de todos los tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

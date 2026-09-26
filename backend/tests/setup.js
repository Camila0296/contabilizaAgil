const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;

// Configurar variables de entorno ANTES de importar app
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';

// Aislar los tests de servicios externos aunque backend/.env tenga credenciales reales:
// dotenv no sobrescribe variables ya definidas, así que estas prevalecen.
process.env.AI_PROVIDER = 'mock';
['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'].forEach(k => { process.env[k] = ''; });

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

// Limpiar datos de prueba después de cada test (pero NO usuarios/roles de beforeAll)
afterEach(async () => {
  const collections = mongoose.connection.collections;
  // Solo limpiar colecciones de datos, NO usuarios ni roles que fueron creados en beforeAll
  const collectionsToClear = ['facturas', 'pucs', 'terceros', 'facturacarteras'];

  for (const collName of collectionsToClear) {
    if (collections[collName]) {
      await collections[collName].deleteMany();
    }
  }
});

// Cerrar conexión después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
  await mongod.stop();
}); 
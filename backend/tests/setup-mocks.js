// Setup GLOBAL para tests con mocks — se ejecuta UNA SOLA VEZ
const { resetStores } = require('./mocks/db');
const { cleanupMocks } = require('./helpers/mockFactory');

// Configurar variables de entorno
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = 'mock-key-for-testing';

// Mock los 7 modelos de mongoose (GLOBALMENTE, no por test)
jest.mock('../models/user', () => require('./mocks/models').MockUser);
jest.mock('../models/role', () => require('./mocks/models').MockRole);
jest.mock('../models/factura', () => require('./mocks/models').MockFactura);
jest.mock('../models/tercero', () => require('./mocks/models').MockTercero);
jest.mock('../models/puc', () => require('./mocks/models').MockPuc);
jest.mock('../models/facturaCartera', () => require('./mocks/models').MockFacturaCartera);
jest.mock('../models/sequence', () => require('./mocks/models').MockSequence);
jest.mock('groq-sdk', () => require('./mocks/groq'));

// Setup global — crear roles estándar UNA SOLA VEZ
const Role = require('../models/role');

async function ensureRolesExist() {
  const roleNames = [
    { name: 'administrador', nivel: 1 },
    { name: 'contador', nivel: 2 },
    { name: 'analista', nivel: 3 },
    { name: 'auxiliar', nivel: 4 }
  ];

  for (const roleData of roleNames) {
    const existing = await Role.findOne({ name: roleData.name });
    if (!existing) {
      await Role.create({
        ...roleData,
        descripcion: `${roleData.name} role`
      });
    }
  }
}

beforeAll(async () => {
  // Resetear todas las stores al inicio EXCEPTO roles
  resetStores(true);
  // Crear roles estándar
  await ensureRolesExist();
});

// Limpiar mocks después de cada test (mantener Roles)
afterEach(async () => {
  cleanupMocks();
  // Asegurar que roles existan para próximo test
  await ensureRolesExist();
});

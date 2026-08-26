// Setup para tests con mocks (sin BD real ni APIs externas)
const { cleanupMocks } = require('./helpers/mockFactory');

// Configurar variables de entorno
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
process.env.GROQ_API_KEY = 'mock-key-for-testing';

// Mock los modelos de mongoose
jest.mock('../models/user', () => require('./mocks/models').MockUser);
jest.mock('../models/role', () => require('./mocks/models').MockRole);
jest.mock('../models/factura', () => require('./mocks/models').MockFactura);
jest.mock('../models/tercero', () => require('./mocks/models').MockTercero);
jest.mock('../models/puc', () => require('./mocks/models').MockPuc);

// Mock Groq SDK
jest.mock('groq-sdk', () => require('./mocks/groq'));

// Limpiar mocks después de cada test
afterEach(() => {
  cleanupMocks();
});

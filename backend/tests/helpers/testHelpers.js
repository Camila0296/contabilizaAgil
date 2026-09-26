const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Role = require('../../models/role');

// Crear un rol de prueba (o traer uno existente)
const createTestRole = async (name = 'auxiliar') => {
  const roleMap = {
    'administrador': { name: 'administrador', nivel: 1, descripcion: 'Control total del sistema' },
    'contador': { name: 'contador', nivel: 2, descripcion: 'Gestión contable y financiera completa' },
    'analista': { name: 'analista', nivel: 3, descripcion: 'Análisis y gestión sin creación de usuarios' },
    'auxiliar': { name: 'auxiliar', nivel: 4, descripcion: 'Entrada de datos y consulta de información' },
    'admin': { name: 'administrador', nivel: 1, descripcion: 'Control total del sistema' },
    'user': { name: 'auxiliar', nivel: 4, descripcion: 'Entrada de datos y consulta de información' }
  };

  // Siempre usar un rol válido, por defecto 'auxiliar'
  const roleData = roleMap[name] || roleMap['auxiliar'];

  // Evitar duplicate key: buscar primero, crear si no existe
  let role = await Role.findOne({ name: roleData.name });
  if (!role) {
    role = await Role.create(roleData);
  }
  return role;
};

// Crear un usuario de prueba
const createTestUser = async (userData = {}) => {
  // numeroDocumento es único en el schema: generar uno distinto en cada llamada
  const uniqueSuffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`.slice(-10);

  const defaultData = {
    nombres: 'Test',
    apellidos: 'User',
    email: 'test@example.com',
    password: 'password123',
    telefono: '3000000000',
    tipoDocumento: 'CC',
    numeroDocumento: uniqueSuffix,
    direccion: 'Calle de Prueba #1-23',
    ciudad: 'Bogota',
    approved: true,
    activo: true
  };

  let roleId = userData.role;
  if (!roleId) {
    // Crear un rol único solo si no se pasa uno
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const role = await createTestRole(`test-role-${timestamp}`);
    roleId = role._id;
  }
  const hashedPassword = await bcrypt.hash(userData.password || defaultData.password, 10);

  const userDataToSave = {
    ...defaultData,
    ...userData,
    password: hashedPassword,
    role: roleId
  };

  return await User.create(userDataToSave);
};

// Crear un token JWT para un usuario
const createTestToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role.name },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: '1h' }
  );
};

// Crear un usuario admin de prueba
const createTestAdmin = async () => {
  const adminRole = await createTestRole('administrador');
  return await createTestUser({
    email: 'admin@example.com',
    role: adminRole._id
  });
};

// Crear un usuario aprobado con el rol indicado y devolver { user, token }
let userCounter = 0;
const createUserWithToken = async (roleName = 'auxiliar', overrides = {}) => {
  const role = await createTestRole(roleName);
  const n = `${Date.now()}${userCounter++}`;
  const user = await createTestUser({
    email: `${roleName}-${n}@test.com`,
    numeroDocumento: n.slice(-10),
    role: role._id,
    ...overrides
  });
  const token = jwt.sign({ id: user._id, role: role.name }, process.env.JWT_SECRET || 'test-secret-key', { expiresIn: '1h' });
  return { user, token, role };
};

// Mock de respuesta HTTP
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock de petición HTTP
const mockRequest = (data = {}) => {
  return {
    body: data.body || {},
    params: data.params || {},
    query: data.query || {},
    headers: data.headers || {},
    user: data.user || null
  };
};

// Importar funciones mock (se usan cuando se ejecuta con jest.config.mocks.js)
let createMockRole, createMockUser, createMockAdmin, cleanupMocks;
try {
  const mockFactory = require('./mockFactory');
  createMockRole = mockFactory.createMockRole;
  createMockUser = mockFactory.createMockUser;
  createMockAdmin = mockFactory.createMockAdmin;
  cleanupMocks = mockFactory.cleanupMocks;
} catch (e) {
  // mockFactory no disponible, se usarán las funciones de BD real
}

module.exports = {
  createTestRole,
  createTestUser,
  createTestToken,
  createTestAdmin,
  createUserWithToken,
  mockResponse,
  mockRequest,
  // Funciones mock (cuando se ejecuta con jest.config.mocks.js)
  createMockRole,
  createMockUser,
  createMockAdmin,
  cleanupMocks
}; 
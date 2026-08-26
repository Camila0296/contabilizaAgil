// Factory functions para crear datos de prueba con mocks
const { MockUser, MockRole, mockModels } = require('../mocks/models');
const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 12;

/**
 * Crea un rol mock
 */
async function createMockRole(data = {}) {
  const roleData = {
    name: data.name || 'auxiliar',
    nivel: data.nivel || 4,
    descripcion: data.descripcion || 'Test role'
  };

  // Verificar si ya existe
  const existing = await MockUser.constructor.findOne({ name: roleData.name });
  if (existing) return existing;

  const { MockRole } = require('../mocks/models');
  return new MockRole(roleData).save();
}

/**
 * Crea un usuario mock con rol
 */
async function createMockUser(data = {}) {
  const userData = {
    nombres: data.nombres || 'Test',
    apellidos: data.apellidos || 'User',
    email: data.email || `test-${Date.now()}@test.com`,
    password: data.password || 'TestPass123!',
    role: data.role,
    approved: data.approved !== undefined ? data.approved : false,
    activo: data.activo !== undefined ? data.activo : true
  };

  // Hashear contraseña
  if (userData.password) {
    userData.password = await bcrypt.hash(userData.password, BCRYPT_ROUNDS);
  }

  const user = new MockUser(userData);
  await user.save();
  return user;
}

/**
 * Crea un usuario admin mock
 */
async function createMockAdmin(data = {}) {
  const { MockRole } = require('../mocks/models');

  // Crear rol admin si no existe
  let adminRole = mockModels.roles.find(r => r.name === 'administrador');
  if (!adminRole) {
    adminRole = await new MockRole({
      name: 'administrador',
      nivel: 1,
      descripcion: 'Admin role'
    }).save();
  }

  return createMockUser({
    nombres: data.nombres || 'Admin',
    apellidos: data.apellidos || 'User',
    email: data.email || `admin-${Date.now()}@test.com`,
    password: data.password || 'TestPass123!',
    role: adminRole._id,
    approved: true,
    ...data
  });
}

/**
 * Obtiene usuario mock por email
 */
async function getMockUserByEmail(email) {
  return MockUser.findOne({ email });
}

/**
 * Limpia todos los datos de prueba
 */
function cleanupMocks() {
  const { resetMocks } = require('../mocks/models');
  resetMocks();
}

module.exports = {
  createMockRole,
  createMockUser,
  createMockAdmin,
  getMockUserByEmail,
  cleanupMocks
};

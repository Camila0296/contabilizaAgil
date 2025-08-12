const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const Role = require('../../models/role');

// Crear un rol de prueba
const createTestRole = async (name = 'test-role') => {
  return await Role.create({ name });
};

// Crear un usuario de prueba
const createTestUser = async (userData = {}) => {
  const defaultData = {
    nombres: 'Test',
    apellidos: 'User',
    email: 'test@example.com',
    password: 'password123',
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
  const hashedPassword = await bcrypt.hash(defaultData.password, 10);
  
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
  const adminRole = await createTestRole('admin');
  return await createTestUser({
    email: 'admin@example.com',
    role: adminRole._id
  });
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

module.exports = {
  createTestRole,
  createTestUser,
  createTestToken,
  createTestAdmin,
  mockResponse,
  mockRequest
}; 
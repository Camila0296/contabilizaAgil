const userCtrl = require('../../controllers/user.controller');
const { createTestUser, createTestRole, createTestAdmin, mockRequest, mockResponse } = require('../helpers/testHelpers');

const Role = require('../../models/role');

describe('User Controller', () => {
  let adminUser;
  let regularUser;
  let adminRole;
  let userRole;

  beforeEach(async () => {
    // Limpiar la colección de roles antes de cada test
    await Role.deleteMany({});
    // Crear roles necesarios con nombres únicos usando timestamp
    const timestamp = Date.now();
    adminRole = await createTestRole(`admin-user-test-${timestamp}`);
    userRole = await createTestRole(`user-user-test-${timestamp}`);
    // Crear usuarios de prueba
    adminUser = await createTestUser({
      email: 'admin@test.com',
      role: adminRole._id,
      approved: true
    });
    regularUser = await createTestUser({
      email: 'user@test.com',
      role: userRole._id,
      approved: true
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const req = mockRequest({
        body: {
          nombres: 'Nuevo',
          apellidos: 'Usuario',
          email: 'nuevo@test.com',
          role: userRole.name // Usar el nombre real del rol creado
        },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.createUser(req, res);

      const jsonArg = res.json.mock.calls[0][0];
      expect(jsonArg.status).toBe('Usuario creado');
      expect(typeof jsonArg.id).toBe('string');
    });

    it('should return error if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          nombres: 'Nuevo',
          email: 'nuevo@test.com'
          // apellidos missing
        },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Campos obligatorios faltantes' });
    });

    it('should return error if email already exists', async () => {
      const req = mockRequest({
        body: {
          nombres: 'Nuevo',
          apellidos: 'Usuario',
          email: 'user@test.com', // Email que ya existe
          role: 'user'
        },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email ya registrado' });
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const req = mockRequest({
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'admin@test.com'
          }),
          expect.objectContaining({
            email: 'user@test.com'
          })
        ])
      );
    });

    it('should filter users by active status', async () => {
      const req = mockRequest({
        query: { activo: 'true' },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            activo: true
          })
        ])
      );
    });

    it('should search users by name or email', async () => {
      const req = mockRequest({
        query: { search: 'admin' },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.getUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            email: 'admin@test.com'
          })
        ])
      );
    });
  });

  describe('approveUser', () => {
    it('should approve a user successfully', async () => {
      const unapprovedUser = await createTestUser({
        email: 'unapproved@test.com',
        approved: false,
        activo: false
      });

      const req = mockRequest({
        params: { id: unapprovedUser._id },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.approveUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Usuario aprobado' });
    });
  });

  describe('rejectUser', () => {
    it('should reject a user successfully', async () => {
      const req = mockRequest({
        params: { id: regularUser._id },
        user: { id: adminUser._id, role: 'admin' }
      });
      const res = mockResponse();

      await userCtrl.rejectUser(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Usuario rechazado' });
    });
  });

  describe('getMe', () => {
    it('should return current user profile', async () => {
      const req = mockRequest({
        user: { id: regularUser._id }
      });
      const res = mockResponse();

      await userCtrl.getMe(req, res);

      const meArg = res.json.mock.calls[0][0];
      expect(meArg._id.toString()).toEqual(regularUser._id.toString());
      expect(meArg.email).toBe('user@test.com');
      expect(meArg.nombres).toBe('Test');
      expect(meArg.apellidos).toBe('User');
      expect(meArg.activo).toBe(true);
      expect(meArg.approved).toBe(true);
      expect(typeof meArg.role.name).toBe('string');
      expect(meArg.role._id.toString()).toBe(regularUser.role.toString());
    });
  });

  describe('updateMe', () => {
    it('should update current user profile', async () => {
      const req = mockRequest({
        body: {
          nombres: 'Actualizado',
          apellidos: 'Usuario'
        },
        user: { id: regularUser._id }
      });
      const res = mockResponse();

      await userCtrl.updateMe(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Perfil actualizado' });
    });

    it('should update password if provided', async () => {
      const req = mockRequest({
        body: {
          nombres: 'Test',
          apellidos: 'User',
          password: 'newpassword123'
        },
        user: { id: regularUser._id }
      });
      const res = mockResponse();

      await userCtrl.updateMe(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Perfil actualizado' });
    });
  });
}); 
const authCtrl = require('../../controllers/auth.controller');
const { createMockRole, createMockUser, mockRequest, mockResponse } = require('../helpers/testHelpers');

describe('Auth Controller - Con Mocks', () => {
  beforeEach(async () => {
    // Crear rol auxiliar para todos los tests
    await createMockRole({ name: 'auxiliar', nivel: 4 });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        body: {
          nombres: 'John',
          apellidos: 'Doe',
          email: 'john@example.com',
          password: 'Password123!'
        }
      });
      const res = mockResponse();

      await authCtrl.register(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Usuario registrado',
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'john@example.com'
          })
        })
      );
    });

    it('should return error if password is not strong enough', async () => {
      const req = mockRequest({
        body: {
          nombres: 'John',
          apellidos: 'Doe',
          email: 'john@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse();

      await authCtrl.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: expect.stringContaining('La contraseña debe tener al menos 8 caracteres')
      });
    });

    it('should return error if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          nombres: 'John',
          email: 'john@example.com'
          // password missing
        }
      });
      const res = mockResponse();

      await authCtrl.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos requeridos' });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const plainPassword = 'Password123!';
      const user = await createMockUser({
        email: 'test@example.com',
        password: plainPassword,
        approved: true
      });

      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: plainPassword
        }
      });
      const res = mockResponse();

      await authCtrl.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Login exitoso',
          token: expect.any(String),
          user: expect.objectContaining({
            email: 'test@example.com'
          })
        })
      );
    });

    it('should return error for invalid email', async () => {
      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse();

      await authCtrl.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });

    it('should return error for invalid password', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'correctpassword'
      });

      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      });
      const res = mockResponse();

      await authCtrl.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Contraseña incorrecta' });
    });

    it('should return error for unapproved user', async () => {
      await createTestUser({
        email: 'test@example.com',
        password: 'password123',
        approved: false
      });

      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123'
        }
      });
      const res = mockResponse();

      await authCtrl.login(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Cuenta pendiente de aprobación' });
    });
  });
}); 
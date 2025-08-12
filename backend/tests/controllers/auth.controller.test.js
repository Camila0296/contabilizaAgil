const authCtrl = require('../../controllers/auth.controller');
const { createTestUser, createTestRole, mockRequest, mockResponse } = require('../helpers/testHelpers');

describe('Auth Controller', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Crear un rol antes de registrar el usuario
      await createTestRole('user');
      
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

      expect(res.json).toHaveBeenCalledWith({ status: 'Usuario registrado' });
    });

    it('should return error if required fields are missing', async () => {
      // Crear un rol para que no falle por falta de roles
      await createTestRole('user');
      
      const req = mockRequest({
        body: {
          nombres: 'John',
          email: 'john@example.com'
          // password missing
        }
      });
      const res = mockResponse();

      await authCtrl.register(req, res);

      // Ahora el controlador valida campos requeridos
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos requeridos' });
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        password: 'password123'
      });

      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123'
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
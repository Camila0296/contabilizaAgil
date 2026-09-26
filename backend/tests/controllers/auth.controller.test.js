const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Role = require('../../models/role');
const app = require('../../index');
const { createTestRole } = require('../helpers/testHelpers');

describe('Auth Controller - Con Mocks', () => {
  let auxiliarRole;

  beforeAll(async () => {
    // El registro asigna el rol "auxiliar" por defecto: debe existir en esta BD aislada
    auxiliarRole = await createTestRole('auxiliar');
  });

  // Genera un número de documento único por llamada (campo unique en el schema)
  let docCounter = 0;
  const uniqueDocumento = () => `30${Date.now()}${docCounter++}`.slice(-10);

  const validRegisterPayload = (overrides = {}) => ({
    nombres: 'John',
    apellidos: 'Doe',
    email: `john-${Date.now()}-${Math.random()}@example.com`,
    password: 'Password123!',
    telefono: '3001234567',
    tipoDocumento: 'CC',
    numeroDocumento: uniqueDocumento(),
    direccion: 'Calle Principal #123',
    ciudad: 'Bogota',
    ...overrides
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload());

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('Registro exitoso');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBeDefined();
    });

    it('should return error if password is not strong enough', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload({ password: 'password123' }));

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('contraseña');
    });

    it('should return error if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'John',
          email: `john-${Date.now()}@example.com`
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Faltan campos requeridos');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const plainPassword = 'Password123!';
      const email = `test-${Date.now()}@example.com`;

      await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload({ nombres: 'Test', apellidos: 'User', email, password: plainPassword }));

      const user = await User.findOne({ email });
      await User.findByIdAndUpdate(user._id, { approved: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: plainPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Login exitoso');
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(email.toLowerCase());
    });

    it('should return error for invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('should return error for invalid password', async () => {
      const plainPassword = 'TestPass123!';
      const email = `test-${Date.now()}@example.com`;

      await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload({ nombres: 'Test', apellidos: 'User', email, password: plainPassword }));

      const user = await User.findOne({ email: email.toLowerCase() });
      await User.findByIdAndUpdate(user._id, { approved: true });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'wrongpassword'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('should return error for unapproved user', async () => {
      const plainPassword = 'password123';
      const email = `test-${Date.now()}@example.com`;

      await request(app)
        .post('/api/auth/register')
        .send(validRegisterPayload({ nombres: 'Test', apellidos: 'User', email, password: 'Password123!' }));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'Password123!'
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Cuenta pendiente de aprobación');
    });
  });
}); 
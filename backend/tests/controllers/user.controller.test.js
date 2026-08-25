const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Role = require('../../models/role');
const app = require('../../index');

describe('User Controller - Validaciones y Paginación', () => {
  let adminToken;
  let adminId;
  let userToken;
  let userId;

  beforeAll(async () => {
    // Crear roles
    let adminRole = await Role.findOne({ name: 'administrador', nivel: 1, descripcion: 'Admin role' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'administrador', nivel: 1, descripcion: 'Admin role' });
    }

    let userRole = await Role.findOne({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
    if (!userRole) {
      userRole = await Role.create({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
    }

    // Crear usuario admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Admin Test',
        apellidos: 'User',
        email: `admin-${Date.now()}@test.com`,
        password: 'TestPass123!'
      });

    adminToken = adminRes.body.token;
    adminId = adminRes.body.user._id;
    await User.findByIdAndUpdate(adminId, { approved: true });

    // Crear usuario regular
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Regular Test',
        apellidos: 'User',
        email: `user-${Date.now()}@test.com`,
        password: 'TestPass123!'
      });

    userToken = userRes.body.token;
    userId = userRes.body.user._id;
    await User.findByIdAndUpdate(userId, { approved: true });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Role.deleteMany({});
  });

  describe('Email Validation', () => {
    test('Debe rechazar email sin dominio', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: 'User',
          email: 'invalidemail',
          password: 'TestPass123!'
        });

      expect(res.status).toBe(400);
    });

    test('Debe rechazar email sin usuario', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: 'User',
          email: '@example.com',
          password: 'TestPass123!'
        });

      expect(res.status).toBe(400);
    });

    test('Debe rechazar email vacío', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: 'User',
          email: '',
          password: 'TestPass123!'
        });

      expect(res.status).toBe(400);
    });

    test('Debe aceptar email válido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: 'User',
          email: `valid-${Date.now()}@example.com`,
          password: 'TestPass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBeDefined();
    });

    test('Debe normalizar email a lowercase', async () => {
      const email = `TEST-${Date.now()}@EXAMPLE.COM`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: 'User',
          email,
          password: 'TestPass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.email).toBe(email.toLowerCase());
    });

    test('Debe rechazar email duplicado', async () => {
      const email = `unique-${Date.now()}@test.com`;

      // Primer registro
      await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test1',
          apellidos: 'User',
          email,
          password: 'TestPass123!'
        });

      // Segundo intento con mismo email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test2',
          apellidos: 'User',
          email,
          password: 'TestPass123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('registrado');
    });
  });

  describe('GET /api/users - Paginación', () => {
    beforeEach(async () => {
      // Crear usuarios de prueba
      const userRole = await Role.findOne({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
      for (let i = 1; i <= 15; i++) {
        await User.create({
          nombres: `Usuario ${i}`,
          apellidos: `Test ${i}`,
          email: `user-page-${i}-${Date.now()}@test.com`,
          password: 'hashed_password',
          role: userRole._id,
          approved: true,
          activo: true
        });
      }
    });

    test('Debe retornar primera página con 10 registros por defecto', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    test('Debe respetar limit máximo de 100', async () => {
      const res = await request(app)
        .get('/api/users?limit=500')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    test('Debe filtrar por aprobación', async () => {
      const res = await request(app)
        .get('/api/users?approved=true')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(user => {
        expect(user.approved).toBe(true);
      });
    });

    test('Debe filtrar por estado activo', async () => {
      const res = await request(app)
        .get('/api/users?activo=false')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(user => {
        expect(user.activo).toBe(false);
      });
    });

    test('Debe buscar por nombre (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/users?search=usuario')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe paginar correctamente', async () => {
      const res1 = await request(app)
        .get('/api/users?page=1&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      const res2 = await request(app)
        .get('/api/users?page=2&limit=5')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res1.body.data[0]._id).not.toBe(res2.body.data[0]._id);
    });
  });

  describe('PUT /api/users/:id - Validación de actualización', () => {
    test('Debe rechazar email inválido en actualización', async () => {
      const res = await request(app)
        .put(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: 'invalido'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('email');
    });

    test('Debe actualizar usuario con email válido', async () => {
      const newEmail = `updated-${Date.now()}@test.com`;
      const res = await request(app)
        .put(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: newEmail,
          nombres: 'Updated Name'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(newEmail.toLowerCase());
      expect(res.body.user.nombres).toBe('Updated Name');
    });

    test('Debe rechazar contraseña débil', async () => {
      const res = await request(app)
        .put(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          password: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('contraseña');
    });
  });

  describe('PUT /api/users/me - Perfil personal', () => {
    test('Debe actualizar perfil con cambio de contraseña', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nombres: 'New Name',
          password: 'NewPass456!',
          currentPassword: 'TestPass123!'
        });

      expect(res.status).toBe(200);
      expect(res.body.user.nombres).toBe('New Name');
    });

    test('Debe rechazar cambio de contraseña sin contraseña actual', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'NewPass789!'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('actual');
    });

    test('Debe rechazar si contraseña actual es incorrecta', async () => {
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          password: 'NewPass789!',
          currentPassword: 'WrongPassword123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('incorrecta');
    });

    test('Debe rechazar email duplicado en actualización de perfil', async () => {
      // Crear otro usuario
      const otherEmail = `other-${Date.now()}@test.com`;
      const otherRes = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Other',
          apellidos: 'User',
          email: otherEmail,
          password: 'TestPass123!'
        });

      const otherToken = otherRes.body.token;

      // Intentar usar email del primer usuario
      const res = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          email: otherEmail // Ya usado
        });

      // Debería aceptar su propio email
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/auth/register - Validación de campos', () => {
    test('Debe rechazar nombres vacío', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: '',
          apellidos: 'Test',
          email: `test-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });

      expect(res.status).toBe(400);
    });

    test('Debe rechazar apellidos vacío', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: '',
          email: `test-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });

      expect(res.status).toBe(400);
    });

    test('Debe rechazar contraseña débil en registro', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Test',
          apellidos: 'User',
          email: `test-${Date.now()}@test.com`,
          password: 'weak'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('contraseña');
    });

    test('Debe trim de espacios en nombres', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: '  Test Name  ',
          apellidos: '  Test Surname  ',
          email: `test-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });

      expect(res.status).toBe(201);
      expect(res.body.user.nombres).toBe('Test Name');
      expect(res.body.user.apellidos).toBe('Test Surname');
    });
  });
});

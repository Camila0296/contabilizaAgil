const request = require('supertest');
const mongoose = require('mongoose');
const Tercero = require('../../models/tercero');
const User = require('../../models/user');
const Role = require('../../models/role');
const app = require('../../index');

describe('Tercero Controller - Validaciones y Paginación', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Crear rol
    let userRole = await Role.findOne({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
    if (!userRole) {
      userRole = await Role.create({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
    }

    // Crear usuario
    const email = `tercero-user-${Date.now()}@test.com`;
    const password = 'TestPass123!';
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Test',
        apellidos: 'User',
        email,
        password
      });

    userId = res.body.user._id;
    await User.findByIdAndUpdate(userId, { approved: true });

    // Login para obtener token válido
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email, password });
    authToken = loginRes.body.token;
  });

  afterAll(async () => {
    await Tercero.deleteMany({});
    await User.deleteMany({});
    await Role.deleteMany({});
  });

  describe('POST /api/terceros - Validación de creación', () => {
    test('Debe rechazar sin tipo', async () => {
      const res = await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          razonSocial: 'Test SA',
          tipoDocumento: 'NIT',
          numeroDocumento: '123456789',
          email: 'test@example.com'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('tipo'))).toBe(true);
    });

    test('Debe rechazar sin razón social', async () => {
      const res = await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          tipoDocumento: 'NIT',
          numeroDocumento: '123456789'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('razonSocial'))).toBe(true);
    });

    test('Debe rechazar email inválido', async () => {
      const res = await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          razonSocial: 'Test SA',
          tipoDocumento: 'NIT',
          numeroDocumento: '123456789',
          email: 'email-invalido'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('email'))).toBe(true);
    });

    test('Debe crear tercero válido con status 201', async () => {
      const res = await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          razonSocial: 'Proveedor Test SA',
          tipoDocumento: 'NIT',
          numeroDocumento: `NIT-${Date.now()}`,
          email: `tercero-${Date.now()}@example.com`,
          telefono: '3001234567',
          direccion: 'Calle Test 123',
          ciudad: 'Bogotá'
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.tercero.razonSocial).toBe('Proveedor Test SA');
      expect(res.body.tercero.activo).toBe(true);
    });

    test('Debe rechazar número de documento duplicado', async () => {
      const numeroDoc = `UNIQUE-${Date.now()}`;

      // Primera creación
      await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          razonSocial: 'Proveedor 1',
          tipoDocumento: 'NIT',
          numeroDocumento: numeroDoc
        });

      // Segunda creación con mismo número
      const res = await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'cliente',
          razonSocial: 'Cliente 1',
          tipoDocumento: 'NIT',
          numeroDocumento: numeroDoc
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('número de documento');
    });

    test('Debe normalizar email a lowercase', async () => {
      const email = `TEST-${Date.now()}@EXAMPLE.COM`;
      const res = await request(app)
        .post('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          razonSocial: 'Test SA',
          tipoDocumento: 'NIT',
          numeroDocumento: `NIT-${Date.now()}`,
          email
        });

      expect(res.status).toBe(201);
      expect(res.body.tercero.email).toBe(email.toLowerCase());
    });
  });

  describe('GET /api/terceros - Paginación y filtros', () => {
    beforeEach(async () => {
      // Crear terceros de prueba
      for (let i = 1; i <= 12; i++) {
        await Tercero.create({
          tipo: i % 2 === 0 ? 'proveedor' : 'cliente',
          razonSocial: `Empresa ${i}`,
          tipoDocumento: 'NIT',
          numeroDocumento: `NIT-PAGINATION-${i}`,
          email: `empresa${i}@test.com`,
          activo: i > 2
        });
      }
    });

    test('Debe retornar primera página con 10 registros por defecto', async () => {
      const res = await request(app)
        .get('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    test('Debe respetar limit máximo de 100', async () => {
      const res = await request(app)
        .get('/api/terceros?limit=300')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    test('Debe filtrar por tipo', async () => {
      const res = await request(app)
        .get('/api/terceros?tipo=proveedor')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(tercero => {
        expect(tercero.tipo).toBe('proveedor');
      });
    });

    test('Debe filtrar por estado activo', async () => {
      const res = await request(app)
        .get('/api/terceros?activo=false')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(tercero => {
        expect(tercero.activo).toBe(false);
      });
    });

    test('Debe buscar por razón social (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/terceros?search=empresa')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe buscar por número de documento', async () => {
      const res = await request(app)
        .get('/api/terceros?search=NIT-PAGINATION')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe ordena alfabéticamente por razón social', async () => {
      const res = await request(app)
        .get('/api/terceros')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      for (let i = 0; i < res.body.data.length - 1; i++) {
        expect(
          res.body.data[i].razonSocial.localeCompare(res.body.data[i + 1].razonSocial)
        ).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('PUT /api/terceros/:id - Validación de actualización', () => {
    let terceroId;

    beforeEach(async () => {
      const tercero = await Tercero.create({
        tipo: 'proveedor',
        razonSocial: 'Proveedor Original',
        tipoDocumento: 'NIT',
        numeroDocumento: `NIT-UPDATE-${Date.now()}`,
        email: `update-${Date.now()}@test.com`
      });
      terceroId = tercero._id;
    });

    test('Debe actualizar tercero válido', async () => {
      const newEmail = `updated-${Date.now()}@test.com`;
      const res = await request(app)
        .put(`/api/terceros/${terceroId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'cliente',
          razonSocial: 'Proveedor Actualizado',
          tipoDocumento: 'NIT',
          numeroDocumento: `NIT-UPDATE-${Date.now()}`,
          email: newEmail
        });

      expect(res.status).toBe(200);
      expect(res.body.tercero.razonSocial).toBe('Proveedor Actualizado');
      expect(res.body.tercero.email).toBe(newEmail.toLowerCase());
    });

    test('Debe rechazar actualización con email inválido', async () => {
      const res = await request(app)
        .put(`/api/terceros/${terceroId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          razonSocial: 'Test',
          tipoDocumento: 'NIT',
          numeroDocumento: `NIT-${Date.now()}`,
          email: 'email-invalido'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('email'))).toBe(true);
    });

    test('Debe rechazar número duplicado en actualización', async () => {
      // Crear otro tercero
      const otro = await Tercero.create({
        tipo: 'cliente',
        razonSocial: 'Cliente Test',
        tipoDocumento: 'NIT',
        numeroDocumento: `NIT-UNIQUE-${Date.now()}`
      });

      // Intentar cambiar al número del otro
      const res = await request(app)
        .put(`/api/terceros/${terceroId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          tipo: 'proveedor',
          razonSocial: 'Test Updated',
          tipoDocumento: 'NIT',
          numeroDocumento: otro.numeroDocumento
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('número de documento');
    });
  });

  describe('DELETE /api/terceros/:id - Soft delete', () => {
    let terceroId;

    beforeEach(async () => {
      const tercero = await Tercero.create({
        tipo: 'proveedor',
        razonSocial: 'Tercero Eliminar',
        tipoDocumento: 'NIT',
        numeroDocumento: `NIT-DELETE-${Date.now()}`,
        activo: true
      });
      terceroId = tercero._id;
    });

    test('Debe desactivar tercero en lugar de eliminar', async () => {
      const res = await request(app)
        .delete(`/api/terceros/${terceroId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toContain('deshabilitado');

      // Verificar que está desactivado
      const tercero = await Tercero.findById(terceroId);
      expect(tercero.activo).toBe(false);
    });

    test('Debe rechazar si tercero no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/terceros/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });
});

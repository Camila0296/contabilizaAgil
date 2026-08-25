const request = require('supertest');
const mongoose = require('mongoose');
const Puc = require('../../models/puc');
const User = require('../../models/user');
const Role = require('../../models/role');
const app = require('../../index');

describe('PUC Controller - Validaciones y Paginación', () => {
  let authToken;

  beforeAll(async () => {
    // Crear rol
    let userRole = await Role.findOne({ name: 'user' });
    if (!userRole) {
      userRole = await Role.create({ name: 'user' });
    }

    // Crear usuario
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Test',
        apellidos: 'User',
        email: `puc-user-${Date.now()}@test.com`,
        password: 'TestPass123!'
      });

    authToken = res.body.token;
  });

  afterAll(async () => {
    await Puc.deleteMany({});
    await User.deleteMany({});
    await Role.deleteMany({});
  });

  describe('POST /api/puc - Validación de creación', () => {
    test('Debe rechazar sin código', async () => {
      const res = await request(app)
        .post('/api/puc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Cuenta Test',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('codigo'))).toBe(true);
    });

    test('Debe rechazar naturaleza inválida', async () => {
      const res = await request(app)
        .post('/api/puc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo: '1234',
          nombre: 'Cuenta Test',
          naturaleza: 'invalido'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('naturaleza'))).toBe(true);
    });

    test('Debe crear PUC válido con status 201', async () => {
      const res = await request(app)
        .post('/api/puc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo: `TEST-${Date.now()}`,
          nombre: 'Cuenta Test',
          naturaleza: 'debito',
          descripcion: 'Descripción de prueba'
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.puc.codigo).toBe(`TEST-${Date.now()}`.toUpperCase());
      expect(res.body.puc.activo).toBe(true);
    });

    test('Debe normalizar código a UPPERCASE', async () => {
      const codigo = `test-lower-${Date.now()}`;
      const res = await request(app)
        .post('/api/puc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo,
          nombre: 'Test Uppercase',
          naturaleza: 'credito'
        });

      expect(res.status).toBe(201);
      expect(res.body.puc.codigo).toBe(codigo.toUpperCase());
    });

    test('Debe rechazar código duplicado', async () => {
      const codigo = `UNIQUE-${Date.now()}`;

      // Primera creación
      await request(app)
        .post('/api/puc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo,
          nombre: 'Primera Cuenta',
          naturaleza: 'debito'
        });

      // Segunda creación con mismo código
      const res = await request(app)
        .post('/api/puc')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo,
          nombre: 'Segunda Cuenta',
          naturaleza: 'credito'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('código');
    });
  });

  describe('GET /api/puc - Paginación y filtros', () => {
    beforeEach(async () => {
      // Crear PUCs de prueba
      for (let i = 1; i <= 12; i++) {
        await Puc.create({
          codigo: `PUC-PAGE-${i}`,
          nombre: `Cuenta ${i}`,
          naturaleza: i % 2 === 0 ? 'credito' : 'debito',
          descripcion: `Descripción cuenta ${i}`,
          activo: i > 2
        });
      }
    });

    test('Debe retornar primera página con 10 registros por defecto', async () => {
      const res = await request(app)
        .get('/api/puc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    test('Debe respetar limit máximo de 100', async () => {
      const res = await request(app)
        .get('/api/puc?limit=500')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    test('Debe filtrar por naturaleza', async () => {
      const res = await request(app)
        .get('/api/puc?naturaleza=debito')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(puc => {
        expect(puc.naturaleza.toLowerCase()).toBe('debito');
      });
    });

    test('Debe filtrar por estado activo', async () => {
      const res = await request(app)
        .get('/api/puc?activo=false')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(puc => {
        expect(puc.activo).toBe(false);
      });
    });

    test('Debe buscar por código', async () => {
      const res = await request(app)
        .get('/api/puc?search=PUC-PAGE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe buscar por nombre (case-insensitive)', async () => {
      const res = await request(app)
        .get('/api/puc?search=cuenta')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe ordenar por código', async () => {
      const res = await request(app)
        .get('/api/puc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      for (let i = 0; i < res.body.data.length - 1; i++) {
        expect(
          res.body.data[i].codigo.localeCompare(res.body.data[i + 1].codigo)
        ).toBeLessThanOrEqual(0);
      }
    });
  });

  describe('PUT /api/puc/:id - Validación de actualización', () => {
    let pucId;

    beforeEach(async () => {
      const puc = await Puc.create({
        codigo: `UPDATE-${Date.now()}`,
        nombre: 'Cuenta Original',
        naturaleza: 'debito'
      });
      pucId = puc._id;
    });

    test('Debe actualizar PUC válido', async () => {
      const res = await request(app)
        .put(`/api/puc/${pucId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo: `UPDATED-${Date.now()}`,
          nombre: 'Cuenta Actualizada',
          naturaleza: 'credito'
        });

      expect(res.status).toBe(200);
      expect(res.body.puc.nombre).toBe('Cuenta Actualizada');
      expect(res.body.puc.naturaleza.toLowerCase()).toBe('credito');
    });

    test('Debe rechazar actualización con código duplicado', async () => {
      const otro = await Puc.create({
        codigo: `UNIQUE-${Date.now()}`,
        nombre: 'Otra Cuenta',
        naturaleza: 'credito'
      });

      const res = await request(app)
        .put(`/api/puc/${pucId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo: otro.codigo,
          nombre: 'Intento',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('código');
    });

    test('Debe rechazar si PUC no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/puc/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo: 'FAKE',
          nombre: 'Fake',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(404);
    });
  });
});

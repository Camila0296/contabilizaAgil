const request = require('supertest');
const mongoose = require('mongoose');
const Factura = require('../../models/factura');
const User = require('../../models/user');
const Role = require('../../models/role');
const app = require('../../index');

describe('Factura Controller - Validaciones y Paginación', () => {
  let authToken;
  let userId;
  let adminToken;
  let adminId;

  beforeAll(async () => {
    // Crear rol si no existe
    let adminRole = await Role.findOne({ name: 'administrador' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'administrador',
        nivel: 1,
        descripcion: 'Admin role for testing'
      });
    }

    let userRole = await Role.findOne({ name: 'auxiliar' });
    if (!userRole) {
      userRole = await Role.create({
        name: 'auxiliar',
        nivel: 4,
        descripcion: 'User role for testing'
      });
    }

    // Crear usuario admin para login
    const adminEmail = `admin-${Date.now()}@test.com`;
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Admin Test',
        apellidos: 'User',
        email: adminEmail,
        password: 'TestPass123!'
      });

    adminToken = adminRes.body.token;
    adminId = adminRes.body.user._id;

    // Crear usuario regular
    const userEmail = `user-${Date.now()}@test.com`;
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Regular Test',
        apellidos: 'User',
        email: userEmail,
        password: 'TestPass123!'
      });

    authToken = userRes.body.token;
    userId = userRes.body.user._id;
  });

  afterAll(async () => {
    await Factura.deleteMany({});
    await User.deleteMany({});
    await Role.deleteMany({});
  });

  describe('POST /api/facturas - Validación de creación', () => {
    test('Debe rechazar monto negativo', async () => {
      const res = await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: 'F001',
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: -1000,
          puc: '1234',
          detalle: 'Test',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validación fallida');
      expect(res.body.details.some(d => d.includes('monto'))).toBe(true);
    });

    test('Debe rechazar monto cero', async () => {
      const res = await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-${Date.now()}`,
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: 0,
          puc: '1234',
          detalle: 'Test',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('monto'))).toBe(true);
    });

    test('Debe rechazar naturaleza inválida', async () => {
      const res = await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-${Date.now()}`,
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: 1000,
          puc: '1234',
          detalle: 'Test',
          naturaleza: 'invalido'
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('naturaleza'))).toBe(true);
    });

    test('Debe rechazar porcentaje fuera de rango', async () => {
      const res = await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-${Date.now()}`,
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: 1000,
          puc: '1234',
          detalle: 'Test',
          naturaleza: 'debito',
          retefuentePct: 150
        });

      expect(res.status).toBe(400);
      expect(res.body.details.some(d => d.includes('retefuentePct'))).toBe(true);
    });

    test('Debe crear factura válida con status 201', async () => {
      const res = await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-${Date.now()}`,
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: 50000,
          puc: '1234',
          detalle: 'Factura de prueba',
          naturaleza: 'debito',
          retefuentePct: 10,
          icaPct: 3
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.status).toBe('Factura guardada');
    });

    test('Debe rechazar número de factura duplicado', async () => {
      const numero = `F-UNICA-${Date.now()}`;

      // Primera creación
      await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero,
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: 50000,
          puc: '1234',
          detalle: 'Factura 1',
          naturaleza: 'debito'
        });

      // Segunda creación con mismo número
      const res = await request(app)
        .post('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero,
          fecha: '2026-08-25',
          proveedor: 'Proveedor Test',
          monto: 60000,
          puc: '1234',
          detalle: 'Factura 2',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Ya existe');
    });
  });

  describe('GET /api/facturas - Paginación y filtros', () => {
    beforeEach(async () => {
      // Crear facturas de prueba
      for (let i = 1; i <= 15; i++) {
        await Factura.create({
          numero: `F-PAGE-${i}`,
          fecha: new Date('2026-08-25'),
          proveedor: `Proveedor ${i}`,
          monto: 50000 + (i * 1000),
          puc: '1234',
          detalle: `Factura ${i}`,
          naturaleza: i % 2 === 0 ? 'credito' : 'debito',
          usuario: userId
        });
      }
    });

    test('Debe retornar primera página con 10 registros por defecto', async () => {
      const res = await request(app)
        .get('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeLessThanOrEqual(10);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
      expect(res.body.pagination.total).toBeGreaterThan(0);
    });

    test('Debe respetar parámetro limit máximo de 100', async () => {
      const res = await request(app)
        .get('/api/facturas?limit=200')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    test('Debe filtrar por naturaleza', async () => {
      const res = await request(app)
        .get('/api/facturas?naturaleza=credito')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach(factura => {
        expect(factura.naturaleza.toLowerCase()).toBe('credito');
      });
    });

    test('Debe filtrar por proveedor con búsqueda case-insensitive', async () => {
      const res = await request(app)
        .get('/api/facturas?proveedor=proveedor')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test('Debe ordenar por fecha descendente', async () => {
      const res = await request(app)
        .get('/api/facturas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      for (let i = 0; i < res.body.data.length - 1; i++) {
        const fecha1 = new Date(res.body.data[i].fecha);
        const fecha2 = new Date(res.body.data[i + 1].fecha);
        expect(fecha1.getTime()).toBeGreaterThanOrEqual(fecha2.getTime());
      }
    });

    test('Debe paginar correctamente', async () => {
      const res1 = await request(app)
        .get('/api/facturas?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      const res2 = await request(app)
        .get('/api/facturas?page=2&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res1.body.data[0]._id).not.toBe(res2.body.data[0]._id);
      expect(res1.body.pagination.pages).toBeGreaterThanOrEqual(2);
    });
  });

  describe('PUT /api/facturas/:id - Validación de actualización', () => {
    let facturaId;

    beforeEach(async () => {
      const factura = await Factura.create({
        numero: `F-UPDATE-${Date.now()}`,
        fecha: new Date('2026-08-25'),
        proveedor: 'Proveedor Original',
        monto: 50000,
        puc: '1234',
        detalle: 'Factura original',
        naturaleza: 'debito',
        usuario: userId
      });
      facturaId = factura._id;
    });

    test('Debe actualizar factura con validación', async () => {
      const res = await request(app)
        .put(`/api/facturas/${facturaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-UPDATE-NEW-${Date.now()}`,
          fecha: '2026-08-26',
          proveedor: 'Proveedor Actualizado',
          monto: 60000,
          puc: '5678',
          detalle: 'Factura actualizada',
          naturaleza: 'credito'
        });

      expect(res.status).toBe(200);
      expect(res.body.factura.proveedor).toBe('Proveedor Actualizado');
      expect(res.body.factura.monto).toBe(60000);
    });

    test('Debe rechazar actualización con monto inválido', async () => {
      const res = await request(app)
        .put(`/api/facturas/${facturaId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-UPDATE-${Date.now()}`,
          fecha: '2026-08-26',
          proveedor: 'Test',
          monto: -100,
          puc: '1234',
          detalle: 'Test',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validación fallida');
    });

    test('Debe rechazar si factura no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/facturas/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          numero: `F-UPDATE-${Date.now()}`,
          fecha: '2026-08-26',
          proveedor: 'Test',
          monto: 50000,
          puc: '1234',
          detalle: 'Test',
          naturaleza: 'debito'
        });

      expect(res.status).toBe(404);
    });
  });
});

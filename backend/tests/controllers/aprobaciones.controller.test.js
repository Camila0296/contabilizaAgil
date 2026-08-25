const request = require('supertest');
const mongoose = require('mongoose');
const User = require('../../models/user');
const Role = require('../../models/role');
const app = require('../../index');

describe('Aprobaciones Controller', () => {
  let approverToken;
  let approverId;
  let pendingUserId;
  let approvedUserId;
  let userRole;
  let adminRole;

  beforeAll(async () => {
    // Crear roles
    adminRole = await Role.findOne({ name: 'administrador', nivel: 1, descripcion: 'Admin role' });
    if (!adminRole) {
      adminRole = await Role.create({ name: 'administrador', nivel: 1, descripcion: 'Admin role' });
    }

    userRole = await Role.findOne({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
    if (!userRole) {
      userRole = await Role.create({ name: 'auxiliar', nivel: 4, descripcion: 'Test role' });
    }

    const approverRole = await Role.findOne({ name: 'contador', nivel: 2, descripcion: 'Counter role' });
    if (!approverRole) {
      await Role.create({ name: 'contador', nivel: 2, descripcion: 'Counter role' });
    }

    // Crear usuario approver
    const approverRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Approver',
        apellidos: 'User',
        email: `approver-${Date.now()}@test.com`,
        password: 'TestPass123!'
      });

    approverToken = approverRes.body.token;
    approverId = approverRes.body.user._id;

    // Asignar rol contador
    await User.findByIdAndUpdate(approverId, {
      role: (await Role.findOne({ name: 'contador' }))._id
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Role.deleteMany({});
  });

  beforeEach(async () => {
    // Crear usuario pendiente de aprobación
    const pendingRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Pending',
        apellidos: 'User',
        email: `pending-${Date.now()}@test.com`,
        password: 'TestPass123!'
      });

    pendingUserId = pendingRes.body.user._id;

    // Crear usuario ya aprobado
    const approvedRes = await request(app)
      .post('/api/auth/register')
      .send({
        nombres: 'Approved',
        apellidos: 'User',
        email: `approved-${Date.now()}@test.com`,
        password: 'TestPass123!'
      });

    approvedUserId = approvedRes.body.user._id;
    await User.findByIdAndUpdate(approvedUserId, { approved: true, activo: true });
  });

  describe('GET /api/aprobaciones/pendientes', () => {
    test('Debe obtener usuarios pendientes de aprobación', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/pendientes')
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.data.some(u => !u.approved)).toBe(true);
    });

    test('Debe paginar usuarios pendientes', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/pendientes?page=1&limit=5')
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
      expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    test('Debe buscar en usuarios pendientes', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/pendientes?search=pending')
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        res.body.data.forEach(u => {
          const lowerUser = `${u.nombres} ${u.apellidos} ${u.email}`.toLowerCase();
          expect(lowerUser).toContain('pending');
        });
      }
    });

    test('Debe requerir autenticación', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/pendientes');

      expect(res.status).toBe(401);
    });

    test('Debe requerir rol approver o admin', async () => {
      // Crear usuario sin rol de approver
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Regular',
          apellidos: 'User',
          email: `regular-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });

      const res = await request(app)
        .get('/api/aprobaciones/pendientes')
        .set('Authorization', `Bearer ${userRes.body.token}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/aprobaciones/historial', () => {
    test('Debe obtener usuarios aprobados', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/historial')
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.pagination).toBeDefined();
    });

    test('Debe paginar historial', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/historial?page=1&limit=5')
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/aprobaciones/estadisticas', () => {
    test('Debe retornar estadísticas de aprobación', async () => {
      const res = await request(app)
        .get('/api/aprobaciones/estadisticas')
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pendientes).toBeGreaterThanOrEqual(0);
      expect(res.body.aprobados).toBeGreaterThanOrEqual(0);
      expect(res.body.rechazados).toBeGreaterThanOrEqual(0);
      expect(res.body.total).toBeDefined();
    });
  });

  describe('PUT /api/aprobaciones/:id/aprobar', () => {
    test('Debe aprobar usuario pendiente', async () => {
      const res = await request(app)
        .put(`/api/aprobaciones/${pendingUserId}/aprobar`)
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.usuario.approved).toBe(true);
      expect(res.body.usuario.activo).toBe(true);
    });

    test('Debe rechazar si usuario ya está aprobado', async () => {
      const res = await request(app)
        .put(`/api/aprobaciones/${approvedUserId}/aprobar`)
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('aprobado');
    });

    test('Debe rechazar si usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/aprobaciones/${fakeId}/aprobar`)
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/aprobaciones/:id/rechazar', () => {
    let pendingToReject;

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'ToReject',
          apellidos: 'User',
          email: `reject-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });
      pendingToReject = res.body.user._id;
    });

    test('Debe rechazar usuario pendiente', async () => {
      const res = await request(app)
        .put(`/api/aprobaciones/${pendingToReject}/rechazar`)
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(200);
      expect(res.body.usuario.activo).toBe(false);
    });

    test('Debe rechazar si usuario ya está aprobado', async () => {
      const res = await request(app)
        .put(`/api/aprobaciones/${approvedUserId}/rechazar`)
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('aprobado');
    });

    test('Debe rechazar si usuario no existe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/aprobaciones/${fakeId}/rechazar`)
        .set('Authorization', `Bearer ${approverToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/aprobaciones/batch/aprobar', () => {
    let batchUser1, batchUser2, batchUser3;

    beforeEach(async () => {
      const res1 = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Batch1',
          apellidos: 'User',
          email: `batch1-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });
      batchUser1 = res1.body.user._id;

      const res2 = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Batch2',
          apellidos: 'User',
          email: `batch2-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });
      batchUser2 = res2.body.user._id;

      const res3 = await request(app)
        .post('/api/auth/register')
        .send({
          nombres: 'Batch3',
          apellidos: 'User',
          email: `batch3-${Date.now()}@test.com`,
          password: 'TestPass123!'
        });
      batchUser3 = res3.body.user._id;
    });

    test('Debe aprobar múltiples usuarios', async () => {
      const res = await request(app)
        .post('/api/aprobaciones/batch/aprobar')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({
          ids: [batchUser1, batchUser2, batchUser3]
        });

      expect(res.status).toBe(200);
      expect(res.body.modified).toBeGreaterThan(0);
      expect(res.body.matched).toBeGreaterThanOrEqual(res.body.modified);
    });

    test('Debe rechazar array vacío', async () => {
      const res = await request(app)
        .post('/api/aprobaciones/batch/aprobar')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({
          ids: []
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('array no vacío');
    });

    test('Debe rechazar más de 100 usuarios', async () => {
      const ids = Array(101).fill(new mongoose.Types.ObjectId());
      const res = await request(app)
        .post('/api/aprobaciones/batch/aprobar')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({ ids });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('100');
    });

    test('Debe rechazar si no es array', async () => {
      const res = await request(app)
        .post('/api/aprobaciones/batch/aprobar')
        .set('Authorization', `Bearer ${approverToken}`)
        .send({
          ids: 'not-an-array'
        });

      expect(res.status).toBe(400);
    });
  });
});

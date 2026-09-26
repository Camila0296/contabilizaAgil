// Escenarios de auth.controller y user.controller que no cubren las suites de controllers/
const mockSendMail = jest.fn().mockResolvedValue({});
jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({ sendMail: mockSendMail })) }));

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const User = require('../../models/user');
const { createUserWithToken, createTestRole } = require('../helpers/testHelpers');

const PNG_BASE64 = 'data:image/png;base64,' + Buffer.from('fake-png-bytes').toString('base64');

let seq = 0;
const unique = () => `${Date.now()}${seq++}`;
const newUserPayload = (overrides = {}) => ({
  nombres: 'Nuevo', apellidos: 'Usuario', email: `nuevo-${unique()}@test.com`,
  telefono: '3001234567', numeroDocumento: unique().slice(-10),
  direccion: 'Calle 1 # 2-3', ciudad: 'Bogotá', role: 'contador', ...overrides
});

describe('Auth y Usuarios - escenarios adicionales', () => {
  let admin, adminToken;

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await Promise.all(['administrador', 'contador', 'analista', 'auxiliar'].map(createTestRole));
    ({ user: admin, token: adminToken } = await createUserWithToken('administrador'));
  });
  afterAll(() => jest.restoreAllMocks());

  const asAdmin = (req) => req.set('Authorization', `Bearer ${adminToken}`);

  describe('POST /api/auth/login', () => {
    test.each([
      [{}],
      [{ email: 'a@b.com' }],
      [{ password: 'x' }],
      [{ email: 123, password: 'x' }],
    ])('400 si faltan credenciales o no son texto (%p)', async (body) => {
      const res = await request(app).post('/api/auth/login').send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/requeridos/);
    });

    test('correo inexistente y contraseña incorrecta dan la misma respuesta (no revela cuentas)', async () => {
      const { user } = await createUserWithToken('contador', { password: 'Clave#123' });
      const noExiste = await request(app).post('/api/auth/login').send({ email: 'nadie@test.com', password: 'Clave#123' });
      const malaClave = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Otra#1234' });
      expect(noExiste.status).toBe(400);
      expect(malaClave.status).toBe(400);
      expect(noExiste.body).toEqual({ error: 'Credenciales inválidas' });
      expect(malaClave.body).toEqual(noExiste.body);
    });

    test('403 si la cuenta está deshabilitada', async () => {
      const { user } = await createUserWithToken('contador', { activo: false, password: 'Clave#123' });
      const res = await request(app).post('/api/auth/login').send({ email: user.email, password: 'Clave#123' });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Cuenta deshabilitada');
    });

    test('el email no distingue mayúsculas y el token incluye el rol', async () => {
      const { user } = await createUserWithToken('analista', { password: 'Clave#123' });
      const res = await request(app).post('/api/auth/login').send({ email: user.email.toUpperCase(), password: 'Clave#123' });
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('analista');
      expect(res.body.token).toEqual(expect.any(String));
    });
  });

  describe('GET /api/auth/verify', () => {
    test('200 con token válido', async () => {
      const res = await asAdmin(request(app).get('/api/auth/verify'));
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Token válido');
    });

    test('401 sin token', async () => {
      expect((await request(app).get('/api/auth/verify')).status).toBe(401);
    });
  });

  describe('POST /api/auth/documento-pendiente', () => {
    let pending;
    beforeEach(async () => {
      ({ user: pending } = await createUserWithToken('auxiliar', { approved: false }));
    });

    test('carga el documento de una cuenta pendiente', async () => {
      const res = await request(app).post('/api/auth/documento-pendiente')
        .send({ email: pending.email, numeroDocumento: pending.numeroDocumento, tipo: 'image/png', datos: PNG_BASE64 });
      expect(res.status).toBe(200);
      const saved = await User.findById(pending._id);
      expect(saved.documentoIdentidad.tipo).toBe('image/png');
      expect(saved.documentoIdentidad.verificado).toBe(false);
    });

    test('mensaje genérico si email y documento no coinciden (no revela si existe la cuenta)', async () => {
      const res = await request(app).post('/api/auth/documento-pendiente')
        .send({ email: pending.email, numeroDocumento: '1234567', tipo: 'image/png', datos: PNG_BASE64 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos no coinciden o la cuenta no existe');
    });

    test('rechaza cuentas ya aprobadas con el mismo mensaje genérico', async () => {
      const { user } = await createUserWithToken('auxiliar');
      const res = await request(app).post('/api/auth/documento-pendiente')
        .send({ email: user.email, numeroDocumento: user.numeroDocumento, tipo: 'image/png', datos: PNG_BASE64 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos no coinciden o la cuenta no existe');
    });

    test('valida el tipo de archivo', async () => {
      const res = await request(app).post('/api/auth/documento-pendiente')
        .send({ email: pending.email, numeroDocumento: pending.numeroDocumento, tipo: 'text/plain', datos: PNG_BASE64 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/^tipo/);
    });
  });

  describe('No se exponen datos sensibles', () => {
    test.each([
      ['GET /api/users/me', (t) => request(app).get('/api/users/me').set('Authorization', `Bearer ${t}`)],
      ['PUT /api/users/me', (t) => request(app).put('/api/users/me').set('Authorization', `Bearer ${t}`).send({ nombres: 'Otro' })],
    ])('%s no devuelve el hash de la contraseña', async (_name, call) => {
      const { token } = await createUserWithToken('auxiliar');
      const res = await call(token);
      expect(res.status).toBe(200);
      expect(JSON.stringify(res.body)).not.toMatch(/"password"/);
    });

    test('GET /api/users, GET /api/users/:id y PUT /api/users/:id no devuelven password ni el documento', async () => {
      const { user } = await createUserWithToken('auxiliar', { documentoIdentidad: { tipo: 'image/png', datos: PNG_BASE64 } });
      const list = await asAdmin(request(app).get('/api/users?limit=100'));
      const one = await asAdmin(request(app).get(`/api/users/${user._id}`));
      const upd = await asAdmin(request(app).put(`/api/users/${user._id}`).send({ nombres: 'Editado' }));
      for (const res of [list, one, upd]) {
        expect(res.status).toBe(200);
        const body = JSON.stringify(res.body);
        expect(body).not.toMatch(/"password"/);
        expect(body).not.toContain(PNG_BASE64);
      }
    });

    test('las listas de aprobaciones no devuelven password ni documento', async () => {
      await createUserWithToken('auxiliar', { approved: false, documentoIdentidad: { tipo: 'image/png', datos: PNG_BASE64 } });
      for (const url of ['/api/aprobaciones/pendientes', '/api/aprobaciones/historial']) {
        const res = await asAdmin(request(app).get(url));
        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body)).not.toMatch(/"password"/);
        expect(JSON.stringify(res.body)).not.toContain(PNG_BASE64);
      }
    });
  });

  describe('Búsquedas con caracteres especiales', () => {
    test.each(['/api/users?search=(', '/api/aprobaciones/pendientes?search=[a', '/api/terceros?search=*', '/api/puc?search=+'])(
      '%s no provoca error 500', async (url) => {
        const res = await asAdmin(request(app).get(url));
        expect(res.status).toBe(200);
      });

    test('el término se busca de forma literal', async () => {
      await createUserWithToken('auxiliar', { nombres: 'Ana (QA)' });
      const res = await asAdmin(request(app).get(`/api/users?search=${encodeURIComponent('Ana (QA)')}`));
      expect(res.body.data.map(u => u.nombres)).toContain('Ana (QA)');
    });
  });

  describe('POST /api/users (crear usuario como admin)', () => {
    test('crea un usuario aprobado buscando el rol por nombre', async () => {
      const payload = newUserPayload();
      const res = await asAdmin(request(app).post('/api/users').send(payload));
      expect(res.status).toBe(200);
      const saved = await User.findById(res.body.id).populate('role');
      expect(saved.approved).toBe(true);
      expect(saved.role.name).toBe('contador');
      expect(saved.password).not.toBe('');
    });

    test('sin SMTP configurado no intenta enviar correo', async () => {
      mockSendMail.mockClear();
      await asAdmin(request(app).post('/api/users').send(newUserPayload()));
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    test('con SMTP configurado envía las credenciales temporales al nuevo usuario', async () => {
      Object.assign(process.env, { SMTP_HOST: 'smtp.example.test', SMTP_USER: 'u', SMTP_PASS: 'p' });
      mockSendMail.mockClear();
      try {
        const payload = newUserPayload();
        const res = await asAdmin(request(app).post('/api/users').send(payload));
        expect(res.status).toBe(200);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ to: payload.email }));
        const { text } = mockSendMail.mock.calls[0][0];
        const tempPass = text.match(/Contraseña: (\S+)/)[1];
        const login = await request(app).post('/api/auth/login').send({ email: payload.email, password: tempPass });
        expect(login.status).toBe(200);
      } finally {
        Object.assign(process.env, { SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' });
      }
    });

    test('un fallo del SMTP no impide crear el usuario', async () => {
      Object.assign(process.env, { SMTP_HOST: 'smtp.example.test', SMTP_USER: 'u', SMTP_PASS: 'p' });
      mockSendMail.mockRejectedValueOnce(new Error('SMTP caído'));
      try {
        const res = await asAdmin(request(app).post('/api/users').send(newUserPayload()));
        expect(res.status).toBe(200);
      } finally {
        Object.assign(process.env, { SMTP_HOST: '', SMTP_USER: '', SMTP_PASS: '' });
      }
    });

    test('acepta el rol por ObjectId', async () => {
      const role = await createTestRole('analista');
      const res = await asAdmin(request(app).post('/api/users').send(newUserPayload({ role: role._id.toString() })));
      expect(res.status).toBe(200);
    });

    test('400 si el rol no existe', async () => {
      const res = await asAdmin(request(app).post('/api/users').send(newUserPayload({ role: 'superusuario' })));
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Rol no válido/);
    });

    test('400 con el detalle de cada campo inválido', async () => {
      const res = await asAdmin(request(app).post('/api/users').send({ email: 'x' }));
      expect(res.status).toBe(400);
      expect(res.body.details).toEqual(expect.arrayContaining([
        expect.stringMatching(/^nombres/), expect.stringMatching(/^email/), expect.stringMatching(/^telefono/),
        expect.stringMatching(/^numeroDocumento/), expect.stringMatching(/^direccion/), expect.stringMatching(/^ciudad/),
        expect.stringMatching(/^role/)
      ]));
    });

    test('400 si el email o el documento ya existen', async () => {
      const payload = newUserPayload();
      await asAdmin(request(app).post('/api/users').send(payload));
      const dupEmail = await asAdmin(request(app).post('/api/users').send({ ...payload, numeroDocumento: '5555555555' }));
      expect(dupEmail.body.error).toBe('Email ya registrado');
      const dupDoc = await asAdmin(request(app).post('/api/users').send({ ...payload, email: `otro-${unique()}@test.com` }));
      expect(dupDoc.body.error).toBe('Número de documento ya registrado');
    });
  });

  describe('Aprobar, rechazar y deshabilitar usuarios', () => {
    const fakeId = () => new mongoose.Types.ObjectId().toString();

    test('PUT /api/users/:id/approve aprueba y activa la cuenta', async () => {
      const { user } = await createUserWithToken('auxiliar', { approved: false });
      const res = await asAdmin(request(app).put(`/api/users/${user._id}/approve`));
      expect(res.status).toBe(200);
      expect((await User.findById(user._id)).approved).toBe(true);
    });

    test.each([
      ['PUT', 'approve'], ['DELETE', 'reject'],
    ])('%s /api/users/:id/%s → 404 si no existe', async (method, action) => {
      const res = await asAdmin(request(app)[method.toLowerCase()](`/api/users/${fakeId()}/${action}`));
      expect(res.status).toBe(404);
    });

    test('DELETE /api/users/:id/reject elimina una cuenta pendiente', async () => {
      const { user } = await createUserWithToken('auxiliar', { approved: false });
      const res = await asAdmin(request(app).delete(`/api/users/${user._id}/reject`));
      expect(res.status).toBe(200);
      expect(await User.findById(user._id)).toBeNull();
    });

    test('DELETE /api/users/:id/reject no permite rechazar cuentas aprobadas', async () => {
      const { user } = await createUserWithToken('auxiliar');
      const res = await asAdmin(request(app).delete(`/api/users/${user._id}/reject`));
      expect(res.status).toBe(400);
    });

    test('DELETE /api/users/:id deshabilita y el usuario ya no puede entrar', async () => {
      const { user, token } = await createUserWithToken('contador', { password: 'Clave#123' });
      const res = await asAdmin(request(app).delete(`/api/users/${user._id}`));
      expect(res.status).toBe(200);
      expect((await User.findById(user._id)).activo).toBe(false);
      expect((await request(app).get('/api/users/me').set('Authorization', `Bearer ${token}`)).status).toBe(401);
      expect((await request(app).post('/api/auth/login').send({ email: user.email, password: 'Clave#123' })).status).toBe(403);
    });

    test('un admin no puede deshabilitar su propia cuenta', async () => {
      const res = await asAdmin(request(app).delete(`/api/users/${admin._id}`));
      expect(res.status).toBe(400);
    });

    test.each(['get', 'put', 'delete'])('%s /api/users/:id con id inexistente o inválido no deja la petición colgada', async (method) => {
      const r404 = await asAdmin(request(app)[method](`/api/users/${fakeId()}`).send({ nombres: 'x' }));
      expect(r404.status).toBe(404);
      const r400 = await asAdmin(request(app)[method](`/api/users/no-es-un-id`).send({ nombres: 'x' }));
      expect([400, 500]).toContain(r400.status);
    });
  });

  describe('Documento de identidad', () => {
    test('PUT /api/users/me/documento carga el documento y el admin puede consultarlo', async () => {
      const { user, token } = await createUserWithToken('auxiliar');
      const up = await request(app).put('/api/users/me/documento').set('Authorization', `Bearer ${token}`)
        .send({ tipo: 'image/png', datos: PNG_BASE64 });
      expect(up.status).toBe(200);
      expect(up.body.documentoIdentidad).toEqual(expect.objectContaining({ tipo: 'image/png', verificado: false }));
      expect(JSON.stringify(up.body)).not.toContain(PNG_BASE64);

      const doc = await asAdmin(request(app).get(`/api/users/${user._id}/documento`));
      expect(doc.status).toBe(200);
      expect(doc.body.documentoIdentidad.datos).toBe(PNG_BASE64);
    });

    test('GET /api/users/:id/documento → 404 si no hay documento', async () => {
      const { user } = await createUserWithToken('auxiliar');
      expect((await asAdmin(request(app).get(`/api/users/${user._id}/documento`))).status).toBe(404);
    });

    test.each([
      [{ tipo: 'image/gif', datos: PNG_BASE64 }, /^tipo/],
      [{ tipo: 'image/png' }, /^datos: requerido/],
      [{ tipo: 'image/png', datos: 'data:image/png;base64,' }, /^datos/],
      [{ tipo: 'application/pdf', datos: Buffer.alloc(5 * 1024 * 1024 + 1).toString('base64') }, /5MB/],
    ])('rechaza documentos inválidos (%#)', async (body, expected) => {
      const { token } = await createUserWithToken('auxiliar');
      const res = await request(app).put('/api/users/me/documento').set('Authorization', `Bearer ${token}`).send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(expected);
    });
  });

  describe('Aprobaciones', () => {
    test('rechazarUsuario desactiva la cuenta y cuenta en estadísticas de rechazados', async () => {
      const { user } = await createUserWithToken('auxiliar', { approved: false });
      const before = (await asAdmin(request(app).get('/api/aprobaciones/estadisticas'))).body.rechazados;
      const res = await asAdmin(request(app).put(`/api/aprobaciones/${user._id}/rechazar`));
      expect(res.status).toBe(200);
      const after = (await asAdmin(request(app).get('/api/aprobaciones/estadisticas'))).body.rechazados;
      expect(after).toBe(before + 1);
    });

    test('aprobarMultiples con ids inválidos → 400', async () => {
      const res = await asAdmin(request(app).post('/api/aprobaciones/batch/aprobar').send({ ids: ['no-es-id'] }));
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/ObjectId/);
    });

    test('aprobarMultiples rechaza más de 100 ids', async () => {
      const ids = Array.from({ length: 101 }, () => new mongoose.Types.ObjectId().toString());
      const res = await asAdmin(request(app).post('/api/aprobaciones/batch/aprobar').send({ ids }));
      expect(res.status).toBe(400);
    });
  });
});

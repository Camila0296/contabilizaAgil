// Matriz de permisos por rol aplicada en el backend (ver tabla RBAC en CLAUDE.md).
// "Permitido" = el middleware deja pasar (el controlador puede responder 400/404 por los datos de prueba);
// "Denegado" = 403 del middleware de roles.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const { createUserWithToken } = require('../helpers/testHelpers');

const ALL = ['administrador', 'contador', 'analista', 'auxiliar'];
const GESTION = ['administrador', 'contador', 'analista'];
const ADMIN_CONTADOR = ['administrador', 'contador'];
const ADMIN = ['administrador'];

const id = new mongoose.Types.ObjectId().toString();

const MATRIX = [
  ['GET', '/api/facturas', ALL],
  ['POST', '/api/facturas', ALL],
  ['GET', `/api/facturas/${id}`, ALL],
  ['PUT', `/api/facturas/${id}`, GESTION],
  ['DELETE', `/api/facturas/${id}`, GESTION],
  ['GET', '/api/facturas/reportes', ALL],
  ['GET', '/api/facturas/dashboard/stats', ADMIN_CONTADOR],
  ['GET', '/api/facturas-cartera', ALL],
  ['POST', '/api/facturas-cartera', ALL],
  ['POST', `/api/facturas-cartera/${id}/pagos`, ALL],
  ['PUT', `/api/facturas-cartera/${id}`, GESTION],
  ['DELETE', `/api/facturas-cartera/${id}`, GESTION],
  ['GET', '/api/terceros', ALL],
  ['POST', '/api/terceros', ALL],
  ['PUT', `/api/terceros/${id}`, ADMIN_CONTADOR],
  ['DELETE', `/api/terceros/${id}`, ADMIN_CONTADOR],
  ['GET', '/api/puc', ALL],
  ['POST', '/api/puc', ADMIN_CONTADOR],
  ['PUT', `/api/puc/${id}`, ADMIN_CONTADOR],
  ['DELETE', `/api/puc/${id}`, ADMIN_CONTADOR],
  ['GET', '/api/users/me', ALL],
  ['GET', '/api/users', ADMIN],
  ['POST', '/api/users', ADMIN],
  ['GET', `/api/users/${id}`, ADMIN],
  ['PUT', `/api/users/${id}/approve`, ADMIN],
  ['GET', '/api/aprobaciones/pendientes', ADMIN],
  ['GET', '/api/aprobaciones/estadisticas', ADMIN],
  ['GET', '/api/roles', ALL],
  ['POST', '/api/roles', ADMIN],
];

const send = (method, url, token) =>
  request(app)[method.toLowerCase()](url).set('Authorization', `Bearer ${token}`).send({});

describe('RBAC - matriz de permisos por rol', () => {
  const tokens = {};

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    for (const r of ALL) {
      tokens[r] = (await createUserWithToken(r)).token;
    }
  });
  afterAll(() => jest.restoreAllMocks());

  const cases = MATRIX.flatMap(([method, url, allowed]) =>
    ALL.map(r => [method, url, r, allowed.includes(r)]));

  test.each(cases)('%s %s como %s → permitido=%s', async (method, url, r, allowed) => {
    const res = await send(method, url, tokens[r]);
    if (allowed) {
      expect([401, 403]).not.toContain(res.status);
    } else {
      expect(res.status).toBe(403);
    }
  });

  test.each([
    ['GET', '/api/facturas'],
    ['GET', '/api/users/me'],
    ['GET', '/api/roles'],
  ])('%s %s sin token → 401', async (method, url) => {
    const res = await request(app)[method.toLowerCase()](url);
    expect(res.status).toBe(401);
  });
});

describe('Auth - cuentas pendientes y deshabilitadas', () => {
  let pendingToken, disabledToken;

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    pendingToken = (await createUserWithToken('auxiliar', { approved: false })).token;
    disabledToken = (await createUserWithToken('contador', { activo: false })).token;
  });
  afterAll(() => jest.restoreAllMocks());

  test('cuenta pendiente puede consultar su perfil', async () => {
    const res = await send('GET', '/api/users/me', pendingToken);
    expect(res.status).toBe(200);
    expect(res.body.approved).toBe(false);
  });

  test('cuenta pendiente puede cargar su documento (llega a la validación)', async () => {
    const res = await send('PUT', '/api/users/me/documento', pendingToken);
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/^tipo/);
  });

  test.each([
    ['GET', '/api/facturas'],
    ['POST', '/api/terceros'],
    ['GET', '/api/puc'],
    ['PUT', '/api/users/me'],
    ['POST', '/api/chat/message'],
  ])('cuenta pendiente no puede usar %s %s', async (method, url) => {
    const res = await send(method, url, pendingToken);
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Cuenta pendiente de aprobación');
  });

  test('cuenta deshabilitada es rechazada aunque su token sea válido', async () => {
    const res = await send('GET', '/api/users/me', disabledToken);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Cuenta deshabilitada');
  });
});

describe('Endpoints generales', () => {
  test('GET /api/health responde ok (lo usa el workflow de CI)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('GET /api/chat/health informa el provider activo', async () => {
    const res = await request(app).get('/api/chat/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ provider: expect.any(String), status: 'ok' });
  });

  test('GET /api-docs sirve la documentación Swagger', async () => {
    const res = await request(app).get('/api-docs/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/swagger/i);
  });
});

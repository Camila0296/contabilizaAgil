const request = require('supertest');
const app = require('../../index');
const seedInitialData = require('../../utils/seedInitialData');
const Role = require('../../models/role');
const User = require('../../models/user');
const Puc = require('../../models/puc');

describe('utils/seedInitialData', () => {
  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    await Promise.all([Role.deleteMany({}), User.deleteMany({}), Puc.deleteMany({})]);
  });
  afterAll(() => jest.restoreAllMocks());

  test('en una base vacía crea los 4 roles, el admin y el catálogo PUC', async () => {
    await seedInitialData();

    const roles = await Role.find().sort({ nivel: 1 });
    expect(roles.map(r => r.name)).toEqual(['administrador', 'contador', 'analista', 'auxiliar']);

    const admin = await User.findOne({ email: 'admin@admin.com' }).populate('role');
    expect(admin).not.toBeNull();
    expect(admin.approved).toBe(true);
    expect(admin.role.name).toBe('administrador');

    expect(await Puc.countDocuments()).toBe(46);
  });

  test('el admin sembrado puede iniciar sesión con la contraseña por defecto', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'admin@admin.com', password: 'admin123' });
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('administrador');
  });

  test('es idempotente: ejecutarlo de nuevo no duplica ni sobrescribe datos', async () => {
    await User.updateOne({ email: 'admin@admin.com' }, { nombres: 'Admin Editado' });
    await seedInitialData();
    expect(await Role.countDocuments()).toBe(4);
    expect(await User.countDocuments({ email: 'admin@admin.com' })).toBe(1);
    expect((await User.findOne({ email: 'admin@admin.com' })).nombres).toBe('Admin Editado');
    expect(await Puc.countDocuments()).toBe(46);
  });

  test('reasigna el rol administrador si el admin quedó sin rol', async () => {
    await User.collection.updateOne({ email: 'admin@admin.com' }, { $unset: { role: '' } });
    await seedInitialData();
    const admin = await User.findOne({ email: 'admin@admin.com' }).populate('role');
    expect(admin.role.name).toBe('administrador');
  });
});

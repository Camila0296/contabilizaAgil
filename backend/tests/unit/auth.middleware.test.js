const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('../../middleware/auth');
const User = require('../../models/user');
const Role = require('../../models/role');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
const reqWith = (authorization) => ({ headers: authorization ? { authorization } : {} });

describe('middleware/auth', () => {
  let user;

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await User.deleteMany({});
    await Role.deleteMany({});
    const r = await Role.create({ name: 'contador', nivel: 2, descripcion: 'Contador' });
    user = await User.create({
      nombres: 'Test', apellidos: 'Auth', email: 'auth-mw@test.com',
      password: 'x', telefono: '3001234567', numeroDocumento: '99999999',
      role: r._id, approved: true
    });
  });

  afterAll(() => jest.restoreAllMocks());

  test('401 sin header Authorization', async () => {
    const res = mockRes(); const next = jest.fn();
    await auth(reqWith(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token no proporcionado' });
    expect(next).not.toHaveBeenCalled();
  });

  test('401 si el header no usa el esquema Bearer', async () => {
    const res = mockRes(); const next = jest.fn();
    await auth(reqWith('Basic abc'), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('401 con token mal firmado', async () => {
    const res = mockRes(); const next = jest.fn();
    const token = jwt.sign({ id: user._id }, 'otra-clave');
    await auth(reqWith(`Bearer ${token}`), res, next);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
    expect(next).not.toHaveBeenCalled();
  });

  test('401 con token expirado', async () => {
    const res = mockRes(); const next = jest.fn();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: -10 });
    await auth(reqWith(`Bearer ${token}`), res, next);
    expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
  });

  test('401 si el usuario del token no existe', async () => {
    const res = mockRes(); const next = jest.fn();
    const token = jwt.sign({ id: new mongoose.Types.ObjectId() }, process.env.JWT_SECRET);
    await auth(reqWith(`Bearer ${token}`), res, next);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
  });

  test('token válido adjunta req.user con id y roles en minúscula', async () => {
    const res = mockRes(); const next = jest.fn();
    const req = reqWith(`Bearer ${jwt.sign({ id: user._id }, process.env.JWT_SECRET)}`);
    await auth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: user._id.toString(), roles: ['contador'] });
  });
});

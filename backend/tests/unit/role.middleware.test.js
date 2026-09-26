const role = require('../../middleware/role');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('middleware/role', () => {
  test('401 si no hay req.user', () => {
    const res = mockRes(); const next = jest.fn();
    role('administrador')({}, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test.each([undefined, [], 'administrador'])('403 si roles es inválido o vacío (%p)', (roles) => {
    const res = mockRes(); const next = jest.fn();
    role('administrador')({ user: { roles } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  test('permite el paso si el usuario tiene un rol permitido', () => {
    const res = mockRes(); const next = jest.fn();
    role('administrador', 'contador')({ user: { roles: ['contador'] } }, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('la comparación no distingue mayúsculas', () => {
    const res = mockRes(); const next = jest.fn();
    role('Administrador')({ user: { roles: ['ADMINISTRADOR'] } }, res, next);
    expect(next).toHaveBeenCalled();
  });

  test('403 con detalle si el rol no está permitido', () => {
    const res = mockRes(); const next = jest.fn();
    role('administrador', 'contador')({ user: { roles: ['auxiliar'] } }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      requiredRoles: ['administrador', 'contador'],
      userRoles: ['auxiliar'],
    }));
    expect(next).not.toHaveBeenCalled();
  });

  test('basta con que uno de varios roles del usuario esté permitido', () => {
    const res = mockRes(); const next = jest.fn();
    role('analista')({ user: { roles: ['auxiliar', 'analista'] } }, res, next);
    expect(next).toHaveBeenCalled();
  });
});

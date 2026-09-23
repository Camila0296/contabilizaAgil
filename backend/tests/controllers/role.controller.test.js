const roleCtrl = require('../../controllers/role.controller');
const { mockRequest, mockResponse, createTestRole } = require('../helpers/testHelpers');

describe('Role Controller', () => {
  describe('createRole', () => {
    it('should return error if role name is not in enum', async () => {
      const roleName = `test-role-${Date.now()}`;
      const req = mockRequest({
        body: {
          name: roleName,
          nivel: 4,
          descripcion: 'Rol de prueba'
        }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      // Los roles están predefinidos en enum, así que rechazar otros nombres es correcto
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return error if required fields are missing', async () => {
      const req = mockRequest({
        body: { name: 'test-role' }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nombre, nivel y descripción son requeridos'
      });
    });

    it('should return error if name is empty', async () => {
      const req = mockRequest({
        body: {
          name: '',
          nivel: 4,
          descripcion: 'Descripción'
        }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Nombre, nivel y descripción son requeridos'
      });
    });

    it('should return error if role name is not in enum', async () => {
      const roleName = `invalid-role-${Date.now()}`;
      const req = mockRequest({
        body: {
          name: roleName,
          nivel: 4,
          descripcion: 'Rol de prueba'
        }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      // Los roles están predefinidos en enum, así que rechazar otros nombres es correcto
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getRoles', () => {
    beforeAll(async () => {
      // Los nombres de rol están restringidos por enum: sembrar los 4 roles válidos
      await createTestRole('administrador');
      await createTestRole('contador');
      await createTestRole('analista');
      await createTestRole('auxiliar');
    });

    it('should return all roles', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await roleCtrl.getRoles(req, res);

      expect(res.json).toHaveBeenCalled();
      const roles = res.json.mock.calls[0][0];
      expect(Array.isArray(roles)).toBe(true);
      expect(roles.length).toBeGreaterThanOrEqual(2);
    });

    it('should return all existing roles', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await roleCtrl.getRoles(req, res);

      expect(res.json).toHaveBeenCalled();
      const roles = res.json.mock.calls[0][0];
      expect(Array.isArray(roles)).toBe(true);
      // Al menos los 4 roles globales deben existir
      expect(roles.length).toBeGreaterThanOrEqual(4);
    });
  });
}); 
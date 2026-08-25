const roleCtrl = require('../../controllers/role.controller');
const { mockRequest, mockResponse } = require('../helpers/testHelpers');

describe('Role Controller', () => {
  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'auxiliar',
          nivel: 4,
          descripcion: 'Rol auxiliar de prueba'
        }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Rol creado',
          role: expect.objectContaining({
            name: 'auxiliar',
            nivel: 4,
            descripcion: 'Rol auxiliar de prueba'
          })
        })
      );
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

    it('should handle duplicate role name error', async () => {
      const req1 = mockRequest({
        body: {
          name: 'administrador',
          nivel: 1,
          descripcion: 'Admin role'
        }
      });
      const res1 = mockResponse();
      await roleCtrl.createRole(req1, res1);

      const req2 = mockRequest({
        body: {
          name: 'administrador',
          nivel: 1,
          descripcion: 'Duplicate admin'
        }
      });
      const res2 = mockResponse();

      await roleCtrl.createRole(req2, res2);

      expect(res2.status).toHaveBeenCalledWith(500);
      expect(res2.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Error al crear el rol'
        })
      );
    });
  });

  describe('getRoles', () => {
    it('should return all roles', async () => {
      const rolesData = [
        { name: 'administrador', nivel: 1, descripcion: 'Admin role' },
        { name: 'contador', nivel: 2, descripcion: 'Counter role' }
      ];

      for (const roleData of rolesData) {
        const req = mockRequest({ body: roleData });
        const res = mockResponse();
        await roleCtrl.createRole(req, res);
      }

      const req = mockRequest({});
      const res = mockResponse();

      await roleCtrl.getRoles(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'administrador' }),
          expect.objectContaining({ name: 'contador' })
        ])
      );
    });

    it('should return empty array when no roles exist', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await roleCtrl.getRoles(req, res);

      expect(res.json).toHaveBeenCalledWith([]);
    });
  });
}); 
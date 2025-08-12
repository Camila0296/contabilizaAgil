const roleCtrl = require('../../controllers/role.controller');
const { mockRequest, mockResponse } = require('../helpers/testHelpers');

describe('Role Controller', () => {
  describe('createRole', () => {
    it('should create a new role successfully', async () => {
      const req = mockRequest({
        body: {
          name: 'test-role'
        }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'Rol creado',
          role: expect.objectContaining({
            name: 'test-role'
          })
        })
      );
    });

    it('should return error if name is missing', async () => {
      const req = mockRequest({
        body: {}
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El nombre es requerido' });
    });

    it('should return error if name is empty', async () => {
      const req = mockRequest({
        body: {
          name: ''
        }
      });
      const res = mockResponse();

      await roleCtrl.createRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'El nombre es requerido' });
    });

    it('should handle duplicate role name error', async () => {
      // Crear un rol primero
      const req1 = mockRequest({
        body: {
          name: 'duplicate-role'
        }
      });
      const res1 = mockResponse();
      await roleCtrl.createRole(req1, res1);

      // Intentar crear otro rol con el mismo nombre
      const req2 = mockRequest({
        body: {
          name: 'duplicate-role'
        }
      });
      const res2 = mockResponse();

      await roleCtrl.createRole(req2, res2);

      // Debería fallar por duplicado
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
      // Crear algunos roles de prueba
      const roles = ['admin', 'user', 'manager'];
      
      for (const roleName of roles) {
        const req = mockRequest({
          body: { name: roleName }
        });
        const res = mockResponse();
        await roleCtrl.createRole(req, res);
      }

      // Obtener todos los roles
      const req = mockRequest({});
      const res = mockResponse();

      await roleCtrl.getRoles(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ name: 'admin' }),
          expect.objectContaining({ name: 'user' }),
          expect.objectContaining({ name: 'manager' })
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
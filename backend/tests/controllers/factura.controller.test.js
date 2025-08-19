const facturaCtrl = require('../../controllers/factura.controller');
const { createTestUser, createTestRole, mockRequest, mockResponse } = require('../helpers/testHelpers');

describe('Factura Controller', () => {
  let testUser;
  let testRole;

  beforeEach(async () => {
    testRole = await createTestRole('user');
    testUser = await createTestUser({
      email: 'test@example.com',
      role: testRole._id,
      approved: true
    });
    // Add roles to the test user
    testUser.roles = ['user'];
  });

  describe('createFactura', () => {
    it('should create a new factura successfully', async () => {
      const req = mockRequest({
        body: {
          numero: 'F001',
          fecha: '2024-01-15',
          proveedor: 'Proveedor Test',
          monto: 100000,
          puc: '5110',
          detalle: 'Servicios de consultoría',
          naturaleza: 'debito',
          retefuentePct: 2.5,
          icaPct: 0.966
        },
        user: { id: testUser._id.toString(), roles: ['user'] }
      });
      const res = mockResponse();

      await facturaCtrl.createFactura(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Factura guardada' });
    });

    it('should return error if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          numero: 'F001',
          fecha: '2024-01-15',
          proveedor: 'Proveedor Test'
          // monto, puc, detalle, naturaleza missing
        },
        user: { id: testUser._id.toString(), roles: ['user'] }
      });
      const res = mockResponse();

      await facturaCtrl.createFactura(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Todos los campos son obligatorios' });
    });

    it('should return error if factura number already exists', async () => {
      // Crear una factura primero
      const req1 = mockRequest({
        body: {
          numero: 'F001',
          fecha: '2024-01-15',
          proveedor: 'Proveedor Test',
          monto: 100000,
          puc: '5110',
          detalle: 'Servicios de consultoría',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['user'] }
      });
      const res1 = mockResponse();
      await facturaCtrl.createFactura(req1, res1);

      // Intentar crear otra con el mismo número
      const req2 = mockRequest({
        body: {
          numero: 'F001', // Mismo número
          fecha: '2024-01-16',
          proveedor: 'Otro Proveedor',
          monto: 50000,
          puc: '5135',
          detalle: 'Otros servicios',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['user'] }
      });
      const res2 = mockResponse();

      await facturaCtrl.createFactura(req2, res2);

      expect(res2.status).toHaveBeenCalledWith(400);
      expect(res2.json).toHaveBeenCalledWith({ error: 'Ya existe una factura con ese número' });
    });
  });

  describe('getFacturas', () => {
    it('should return all facturas for admin', async () => {
      // Create test facturas first
      const factura1 = await facturaCtrl.createFactura(
        mockRequest({
          body: {
            numero: 'F001',
            fecha: '2024-01-15',
            proveedor: 'Proveedor 1',
            monto: 100000,
            puc: '5110',
            detalle: 'Test 1',
            naturaleza: 'debito'
          },
          user: { id: testUser._id.toString(), roles: ['user'] }
        }),
        mockResponse()
      );

      const factura2 = await facturaCtrl.createFactura(
        mockRequest({
          body: {
            numero: 'F002',
            fecha: '2024-01-16',
            proveedor: 'Proveedor 2',
            monto: 200000,
            puc: '5210',
            detalle: 'Test 2',
            naturaleza: 'credito'
          },
          user: { id: testUser._id.toString(), roles: ['user'] }
        }),
        mockResponse()
      );

      const req = mockRequest({
        user: { id: testUser._id.toString(), roles: ['admin'] }
      });
      const res = mockResponse();

      await facturaCtrl.getFacturas(req, res);

      expect(res.json).toHaveBeenCalled();
      const facturas = res.json.mock.calls[0][0];
      expect(Array.isArray(facturas)).toBeTruthy();
      expect(facturas.length).toBeGreaterThan(0);
    });
  });

  describe('getFactura', () => {
    it('should return a specific factura by ID', async () => {
      // Crear una factura
      const createReq = mockRequest({
        body: {
          numero: 'F003',
          fecha: '2024-01-17',
          proveedor: 'Proveedor Test',
          monto: 150000,
          puc: '5110',
          detalle: 'Servicios específicos',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString() }
      });
      const createRes = mockResponse();
      await facturaCtrl.createFactura(createReq, createRes);

      // Obtener todas las facturas para conseguir el ID
      const getAllReq = mockRequest({ user: { id: testUser._id.toString() } });
      const getAllRes = mockResponse();
      await facturaCtrl.getFacturas(getAllReq, getAllRes);

      const facturas = getAllRes.json.mock.calls[0][0];
      const facturaId = facturas[0]._id;

      // Obtener la factura específica
      const req = mockRequest({
        params: { id: facturaId },
        user: { id: testUser._id.toString() }
      });
      const res = mockResponse();

      await facturaCtrl.getFactura(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          numero: 'F003',
          proveedor: 'Proveedor Test'
        })
      );
    });

    it('should return 404 for non-existent factura', async () => {
      const req = mockRequest({
        params: { id: '507f1f77bcf86cd799439011' }, // ID que no existe
        user: { id: testUser._id.toString() }
      });
      const res = mockResponse();

      await facturaCtrl.getFactura(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Factura no encontrada' });
    });
  });

  describe('updateFactura', () => {
    it('should update a factura successfully', async () => {
      // Crear una factura
      const createReq = mockRequest({
        body: {
          numero: 'F004',
          fecha: '2024-01-18',
          proveedor: 'Proveedor Original',
          monto: 100000,
          puc: '5110',
          detalle: 'Servicios originales',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString() }
      });
      const createRes = mockResponse();
      await facturaCtrl.createFactura(createReq, createRes);

      // Obtener el ID de la factura creada
      const getAllReq = mockRequest({ user: { id: testUser._id.toString() } });
      const getAllRes = mockResponse();
      await facturaCtrl.getFacturas(getAllReq, getAllRes);
      const facturaId = getAllRes.json.mock.calls[0][0][0]._id;

      // Actualizar la factura
      const req = mockRequest({
        params: { id: facturaId },
        body: {
          numero: 'F004',
          fecha: '2024-01-19',
          proveedor: 'Proveedor Actualizado',
          monto: 150000,
          puc: '5135',
          detalle: 'Servicios actualizados',
          naturaleza: 'credito'
        },
        user: { id: testUser._id.toString() }
      });
      const res = mockResponse();

      await facturaCtrl.updateFactura(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Factura actualizada' });
    });
  });

  describe('deleteFactura', () => {
    it('should delete a factura successfully', async () => {
      // Crear una factura
      const createReq = mockRequest({
        body: {
          numero: 'F005',
          fecha: '2024-01-20',
          proveedor: 'Proveedor a Eliminar',
          monto: 100000,
          puc: '5110',
          detalle: 'Servicios a eliminar',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString() }
      });
      const createRes = mockResponse();
      await facturaCtrl.createFactura(createReq, createRes);

      // Obtener el ID de la factura creada
      const getAllReq = mockRequest({ user: { id: testUser._id.toString() } });
      const getAllRes = mockResponse();
      await facturaCtrl.getFacturas(getAllReq, getAllRes);
      const facturaId = getAllRes.json.mock.calls[0][0][0]._id;

      // Eliminar la factura
      const req = mockRequest({
        params: { id: facturaId },
        user: { id: testUser._id.toString() }
      });
      const res = mockResponse();

      await facturaCtrl.deleteFactura(req, res);

      expect(res.json).toHaveBeenCalledWith({ status: 'Factura eliminada' });
    });
  });

  describe('getReportes', () => {
    it('should return reportes with statistics', async () => {
      // Crear algunas facturas para generar estadísticas
      const facturas = [
        {
          numero: 'F006',
          fecha: '2024-01-15',
          proveedor: 'Proveedor A',
          monto: 100000,
          puc: '5110',
          detalle: 'Servicios A',
          naturaleza: 'debito'
        },
        {
          numero: 'F007',
          fecha: '2024-01-16',
          proveedor: 'Proveedor B',
          monto: 200000,
          puc: '5135',
          detalle: 'Servicios B',
          naturaleza: 'credito'
        }
      ];

      for (const factura of facturas) {
        const req = mockRequest({
          body: factura,
          user: { id: testUser._id.toString() }
        });
        const res = mockResponse();
        await facturaCtrl.createFactura(req, res);
      }

      // Generar reportes
      const req = mockRequest({ user: { id: testUser._id.toString() } });
      const res = mockResponse();

      await facturaCtrl.getReportes(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalFacturas: expect.any(Number),
          totalMonto: expect.any(Number),
          totalIva: expect.any(Number),
          totalReteFuente: expect.any(Number),
          totalIca: expect.any(Number)
        })
      );
    });
  });
}); 
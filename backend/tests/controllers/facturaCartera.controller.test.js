const facturaCarteraCtrl = require('../../controllers/facturaCartera.controller');
const FacturaCartera = require('../../models/facturaCartera');
const Tercero = require('../../models/tercero');
const Puc = require('../../models/puc');
const Sequence = require('../../models/sequence');
const { createTestUser, createTestRole, mockRequest, mockResponse } = require('../helpers/testHelpers');

describe('FacturaCartera Controller', () => {
  let testUser, testRole, testTercero, testPuc;

  beforeEach(async () => {
    testRole = await createTestRole('auxiliar');
    testUser = await createTestUser({ email: 'test@example.com', role: testRole._id, approved: true });
    testUser.roles = ['auxiliar'];

    testTercero = await Tercero.create({
      tipo: 'cliente',
      razonSocial: 'Test Client',
      tipoDocumento: 'NIT',
      numeroDocumento: '1111111111'
    });

    testPuc = await Puc.create({
      codigo: '5110',
      nombre: 'Honorarios',
      naturaleza: 'debito'
    });

    await Sequence.deleteMany({});
  });

  describe('createFacturaCartera', () => {
    it('should create a new factura cartera with auto-generated numero', async () => {
      const req = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'Servicios profesionales',
          naturaleza: 'debito',
          retefuentePct: 2.5,
          icaPct: 0
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();

      await facturaCarteraCtrl.createFacturaCartera(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      const call = response.data || response;
      expect(call.status).toBe('Factura guardada');
      expect(call.factura).toBeDefined();
      expect(call.factura.numeroDocumento).toBe('FAC-001');
      expect(call.factura.tipo).toBe('factura');
      expect(call.factura.impuestos.iva).toBe(19000);
    });

    it('should create nota de credito with NC prefix', async () => {
      const req = mockRequest({
        body: {
          tipo: 'creditNote',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 50000,
          puc: testPuc._id.toString(),
          detalle: 'Devolución',
          naturaleza: 'credito',
          retefuentePct: 0,
          icaPct: 0
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();

      await facturaCarteraCtrl.createFacturaCartera(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      const call = response.data || response;
      expect(call.factura.numeroDocumento).toBe('NC-001');
      expect(call.factura.tipo).toBe('creditNote');
    });

    it('should create nota de debito with ND prefix', async () => {
      const req = mockRequest({
        body: {
          tipo: 'debitNote',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 30000,
          puc: testPuc._id.toString(),
          detalle: 'Intereses',
          naturaleza: 'debito',
          retefuentePct: 0,
          icaPct: 0
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();

      await facturaCarteraCtrl.createFacturaCartera(req, res);

      expect(res.json).toHaveBeenCalled();
      const response = res.json.mock.calls[0][0];
      const call = response.data || response;
      expect(call.factura.numeroDocumento).toBe('ND-001');
      expect(call.factura.tipo).toBe('debitNote');
    });

    it('should increment consecutivo for each new factura', async () => {
      const req1 = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'First',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res1 = mockResponse();
      await facturaCarteraCtrl.createFacturaCartera(req1, res1);
      const first = res1.json.mock.calls[0][0].factura;

      const req2 = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'Second',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res2 = mockResponse();
      await facturaCarteraCtrl.createFacturaCartera(req2, res2);
      const second = res2.json.mock.calls[0][0].factura;

      expect(first.numeroDocumento).toBe('FAC-001');
      expect(second.numeroDocumento).toBe('FAC-002');
    });

    it('should return error if required fields are missing', async () => {
      const req = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date()
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();

      await facturaCarteraCtrl.createFacturaCartera(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Todos los campos son obligatorios'
      });
    });

    it('should return error if tipo is invalid', async () => {
      const req = mockRequest({
        body: {
          tipo: 'invalidType',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'Test',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();

      await facturaCarteraCtrl.createFacturaCartera(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Tipo de documento inválido'
      });
    });
  });

  describe('getFacturasCartera', () => {
    it('should return all facturas for admin', async () => {
      const req = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'Admin view test',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();
      await facturaCarteraCtrl.createFacturaCartera(req, res);

      const reqGet = mockRequest({
        query: {},
        user: { id: testUser._id.toString(), roles: ['administrador'] }
      });
      const resGet = mockResponse();

      await facturaCarteraCtrl.getFacturasCartera(reqGet, resGet);

      expect(resGet.json).toHaveBeenCalled();
      const response = resGet.json.mock.calls[0][0];
      expect(response).toHaveProperty('data');
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });

    it('should return only user own facturas for non-admin', async () => {
      const otherRole = await createTestRole('auxiliar');
      const otherUser = await createTestUser({ email: 'other@example.com', role: otherRole._id });

      const req1 = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'Other user',
          naturaleza: 'debito'
        },
        user: { id: otherUser._id.toString(), roles: ['auxiliar'] }
      });
      const res1 = mockResponse();
      await facturaCarteraCtrl.createFacturaCartera(req1, res1);

      const req2 = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 50000,
          puc: testPuc._id.toString(),
          detalle: 'Test user',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res2 = mockResponse();
      await facturaCarteraCtrl.createFacturaCartera(req2, res2);

      const reqGet = mockRequest({
        query: {},
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const resGet = mockResponse();

      await facturaCarteraCtrl.getFacturasCartera(reqGet, resGet);

      expect(resGet.json).toHaveBeenCalled();
      const facturas = resGet.json.mock.calls[0][0];
      expect(facturas.every(f => f.usuario._id.toString() === testUser._id.toString())).toBe(true);
    });
  });

  describe('deleteFacturaCartera', () => {
    it('should soft delete (anular) a factura cartera', async () => {
      const req = mockRequest({
        body: {
          tipo: 'factura',
          fecha: new Date(),
          tercero: testTercero._id.toString(),
          monto: 100000,
          puc: testPuc._id.toString(),
          detalle: 'To delete',
          naturaleza: 'debito'
        },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const res = mockResponse();

      await facturaCarteraCtrl.createFacturaCartera(req, res);
      const factura = res.json.mock.calls[0][0].factura;

      const reqDel = mockRequest({
        params: { id: factura._id.toString() },
        user: { id: testUser._id.toString(), roles: ['auxiliar'] }
      });
      const resDel = mockResponse();

      await facturaCarteraCtrl.deleteFacturaCartera(reqDel, resDel);

      expect(resDel.json).toHaveBeenCalledWith({
        message: 'Factura anulada correctamente'
      });

      const updated = await FacturaCartera.findById(factura._id);
      expect(updated.estado).toBe('anulada');
    });
  });
});

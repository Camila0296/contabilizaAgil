// Escenarios de factura, facturaCartera, puc y chat que no cubren las suites de controllers/.
// Nota: tests/setup.js vacía facturas/pucs/terceros/facturacarteras después de cada test,
// por eso los datos se crean dentro de cada test.
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../index');
const Factura = require('../../models/factura');
const Tercero = require('../../models/tercero');
const Puc = require('../../models/puc');
const Sequence = require('../../models/sequence');
const FacturaCartera = require('../../models/facturaCartera');
const { createUserWithToken } = require('../helpers/testHelpers');

let n = 0;
const facturaData = (usuario, overrides = {}) => ({
  numero: `T-${Date.now()}-${n++}`, fecha: new Date(), proveedor: 'Proveedor SAS', monto: 1000,
  puc: '510506', detalle: 'Servicio', naturaleza: 'debito', usuario, ...overrides
});
const fakeId = () => new mongoose.Types.ObjectId().toString();

describe('Facturas, cartera, PUC y chat - escenarios adicionales', () => {
  let admin, contador, analista, auxiliar, auxiliar2;
  const as = (who) => (req) => req.set('Authorization', `Bearer ${who.token}`);

  beforeAll(async () => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    admin = await createUserWithToken('administrador');
    contador = await createUserWithToken('contador', { nombres: 'Carla', apellidos: 'Contadora' });
    analista = await createUserWithToken('analista');
    auxiliar = await createUserWithToken('auxiliar');
    auxiliar2 = await createUserWithToken('auxiliar');
  });
  afterAll(() => jest.restoreAllMocks());

  describe('GET/DELETE /api/facturas/:id', () => {
    test('el dueño y los roles de gestión pueden ver la factura; otro auxiliar no', async () => {
      const f = await Factura.create(facturaData(auxiliar.user._id));
      expect((await as(auxiliar)(request(app).get(`/api/facturas/${f._id}`))).status).toBe(200);
      expect((await as(admin)(request(app).get(`/api/facturas/${f._id}`))).status).toBe(200);
      expect((await as(auxiliar2)(request(app).get(`/api/facturas/${f._id}`))).status).toBe(403);
    });

    test('404 si la factura no existe', async () => {
      expect((await as(admin)(request(app).get(`/api/facturas/${fakeId()}`))).status).toBe(404);
      expect((await as(admin)(request(app).delete(`/api/facturas/${fakeId()}`))).status).toBe(404);
    });

    test('analista elimina su propia factura, pero no la de otro usuario', async () => {
      const propia = await Factura.create(facturaData(analista.user._id));
      const ajena = await Factura.create(facturaData(auxiliar.user._id));
      expect((await as(analista)(request(app).delete(`/api/facturas/${propia._id}`))).status).toBe(200);
      expect(await Factura.findById(propia._id)).toBeNull();
      expect((await as(analista)(request(app).delete(`/api/facturas/${ajena._id}`))).status).toBe(403);
    });

    test('auxiliar no puede eliminar ni editar, ni siquiera su propia factura', async () => {
      const f = await Factura.create(facturaData(auxiliar.user._id));
      expect((await as(auxiliar)(request(app).delete(`/api/facturas/${f._id}`))).status).toBe(403);
      expect((await as(auxiliar)(request(app).put(`/api/facturas/${f._id}`).send({}))).status).toBe(403);
      expect(await Factura.findById(f._id)).not.toBeNull();
    });
  });

  describe('Consecutivos de facturas', () => {
    const year = new Date().getFullYear();

    test('siguiente consecutivo inicia en 001 y continúa desde el último del año', async () => {
      let res = await as(auxiliar)(request(app).get('/api/facturas/siguiente/consecutivo'));
      expect(res.status).toBe(200);
      expect(res.body.nextSuggested).toBe(`FAC-${year}-001`);

      await Factura.create(facturaData(auxiliar.user._id, { numero: `FAC-${year}-007` }));
      res = await as(auxiliar)(request(app).get('/api/facturas/siguiente/consecutivo'));
      expect(res.body.nextSuggested).toBe(`FAC-${year}-008`);
      expect(res.body.totalRegisteredThisYear).toBe(1);
    });

    test('verificar disponibilidad', async () => {
      await Factura.create(facturaData(auxiliar.user._id, { numero: 'FAC-X-1' }));
      const taken = await as(auxiliar)(request(app).get('/api/facturas/verificar/disponibilidad?numero=FAC-X-1'));
      expect(taken.body.available).toBe(false);
      const free = await as(auxiliar)(request(app).get('/api/facturas/verificar/disponibilidad?numero=FAC-X-2'));
      expect(free.body.available).toBe(true);
      const missing = await as(auxiliar)(request(app).get('/api/facturas/verificar/disponibilidad'));
      expect(missing.status).toBe(400);
    });
  });

  describe('GET /api/facturas/dashboard/stats', () => {
    test('calcula totales, ingresos del mes, variación vs mes anterior y facturas recientes', async () => {
      const now = new Date();
      const esteMes = new Date(now.getFullYear(), now.getMonth(), 1, 12);
      const mesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 15, 12);
      await Factura.create(facturaData(contador.user._id, { fecha: esteMes, monto: 3000 }));
      await Factura.create(facturaData(contador.user._id, { fecha: mesAnterior, monto: 2000 }));

      const res = await as(admin)(request(app).get('/api/facturas/dashboard/stats'));
      expect(res.status).toBe(200);
      expect(res.body.totalFacturas).toBe(2);
      expect(res.body.totalMonto).toBe(5000);
      expect(res.body.ingresosMes).toBe(3000);
      expect(res.body.cambioPorcentual).toBe(50);
      expect(res.body.facturasRecientes[0].usuario).toBe('Carla Contadora');
    });
  });

  describe('GET /api/facturas/reportes', () => {
    beforeEach(async () => {
      await Factura.create([
        facturaData(contador.user._id, { fecha: new Date('2026-03-10T12:00:00Z'), proveedor: 'Alfa (Norte)', monto: 1000, retefuentePct: 10 }),
        facturaData(contador.user._id, { fecha: new Date('2026-03-31T20:00:00Z'), proveedor: 'Beta', monto: 2000 }),
        facturaData(auxiliar.user._id, { fecha: new Date('2026-04-02T12:00:00Z'), proveedor: 'Beta', monto: 4000, naturaleza: 'credito' }),
      ]);
    });

    test('sin filtros suma todo e incluye impuestos', async () => {
      const res = await as(analista)(request(app).get('/api/facturas/reportes'));
      expect(res.status).toBe(200);
      expect(res.body.totalFacturas).toBe(3);
      expect(res.body.totalMonto).toBe(7000);
      expect(res.body.totalIva).toBe(1330);
      expect(res.body.totalReteFuente).toBe(100);
      expect(res.body.facturasPorMes).toEqual([
        { mes: '2026-03', cantidad: 2, monto: 3000 },
        { mes: '2026-04', cantidad: 1, monto: 4000 },
      ]);
      expect(res.body.topProveedores[0]).toEqual({ proveedor: 'Beta', cantidad: 2, monto: 6000 });
      expect(res.body.filtros.proveedores).toEqual(['Alfa (Norte)', 'Beta']);
    });

    test('filtro por mes incluye el último día completo del mes', async () => {
      const res = await as(analista)(request(app).get('/api/facturas/reportes?mes=2026-03'));
      expect(res.body.totalFacturas).toBe(2);
      expect(res.body.totalMonto).toBe(3000);
    });

    test('filtro por rango de fechas incluye la fecha final', async () => {
      const res = await as(analista)(request(app).get('/api/facturas/reportes?fechaInicio=2026-03-15&fechaFin=2026-04-02'));
      expect(res.body.totalFacturas).toBe(2);
      expect(res.body.totalMonto).toBe(6000);
    });

    test('filtro por usuario y listado de usuarios', async () => {
      const res = await as(analista)(request(app).get(`/api/facturas/reportes?usuarioId=${auxiliar.user._id}`));
      expect(res.body.totalFacturas).toBe(1);
      expect(res.body.totalMonto).toBe(4000);
      expect(res.body.filtros.usuarios).toHaveLength(1);
    });

    test('filtro por proveedor es literal (no interpreta regex)', async () => {
      const res = await as(analista)(request(app).get(`/api/facturas/reportes?proveedor=${encodeURIComponent('alfa (norte)')}`));
      expect(res.body.totalFacturas).toBe(1);
      expect(res.body.totalMonto).toBe(1000);
    });

    test.each([
      ['usuarioId=abc', /usuarioId/],
      ['fechaInicio=no&fechaFin=2026-01-01', /fecha/],
    ])('400 con filtros inválidos (%s)', async (qs, expected) => {
      const res = await as(analista)(request(app).get(`/api/facturas/reportes?${qs}`));
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(expected);
    });
  });

  describe('Facturas de cartera', () => {
    let tercero, puc;
    beforeEach(async () => {
      tercero = await Tercero.create({ tipo: 'cliente', razonSocial: 'Cliente SA', tipoDocumento: 'NIT', numeroDocumento: `9${Date.now()}` });
      puc = await Puc.create({ codigo: `4${Date.now()}`, nombre: 'Ingresos', naturaleza: 'credito' });
      await Sequence.deleteMany({});
    });

    const crear = (who, overrides = {}) => as(who)(request(app).post('/api/facturas-cartera').send({
      fecha: '2026-05-01', tercero: tercero._id.toString(), puc: puc._id.toString(),
      monto: 1000, detalle: 'Venta', naturaleza: 'credito', ...overrides
    }));

    test('asigna consecutivos independientes por tipo de documento', async () => {
      expect((await crear(auxiliar)).body.factura.numeroDocumento).toBe('FAC-001');
      expect((await crear(auxiliar)).body.factura.numeroDocumento).toBe('FAC-002');
      expect((await crear(auxiliar, { tipo: 'creditNote' })).body.factura.numeroDocumento).toBe('NC-001');
      expect((await crear(auxiliar, { tipo: 'debitNote' })).body.factura.numeroDocumento).toBe('ND-001');
    });

    test('400 si el tercero o la cuenta PUC no existen', async () => {
      expect((await crear(auxiliar, { tercero: fakeId() })).body.error).toMatch(/tercero/);
      expect((await crear(auxiliar, { puc: fakeId() })).body.error).toMatch(/PUC/);
    });

    test('GET /:id: dueño 200, otro auxiliar 403, inexistente 404', async () => {
      const id = (await crear(auxiliar)).body.id;
      expect((await as(auxiliar)(request(app).get(`/api/facturas-cartera/${id}`))).status).toBe(200);
      expect((await as(auxiliar2)(request(app).get(`/api/facturas-cartera/${id}`))).status).toBe(403);
      expect((await as(auxiliar)(request(app).get(`/api/facturas-cartera/${fakeId()}`))).status).toBe(404);
    });

    test('registrar pagos: parcial, total y exceso', async () => {
      const id = (await crear(auxiliar)).body.id;
      const pagar = (monto) => as(auxiliar)(request(app).post(`/api/facturas-cartera/${id}/pagos`).send({ monto, referencia: 'TRX', cuenta: '1110' }));

      let res = await pagar(400);
      expect(res.status).toBe(200);
      expect(res.body.estadoPago).toBe('Parcialmente Pagada');
      expect(res.body.saldoPendiente).toBe(600);

      res = await pagar(700);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/excede el saldo pendiente \(600\)/);

      res = await pagar(600);
      expect(res.body.estadoPago).toBe('Pagada');
      expect(res.body.saldoPendiente).toBe(0);
      expect(res.body.factura.pagos).toHaveLength(2);
    });

    test.each([0, -5, '100', null])('rechaza un pago con monto inválido (%p)', async (monto) => {
      const id = (await crear(auxiliar)).body.id;
      const res = await as(auxiliar)(request(app).post(`/api/facturas-cartera/${id}/pagos`).send({ monto }));
      expect(res.status).toBe(400);
    });

    test('otro auxiliar no puede registrar pagos en una factura ajena', async () => {
      const id = (await crear(auxiliar)).body.id;
      const res = await as(auxiliar2)(request(app).post(`/api/facturas-cartera/${id}/pagos`).send({ monto: 10 }));
      expect(res.status).toBe(403);
    });

    test('anular una factura impide pagos y ediciones posteriores', async () => {
      const id = (await crear(auxiliar)).body.id;
      expect((await as(contador)(request(app).delete(`/api/facturas-cartera/${id}`))).status).toBe(200);
      const pago = await as(auxiliar)(request(app).post(`/api/facturas-cartera/${id}/pagos`).send({ monto: 10 }));
      expect(pago.status).toBe(400);
      const edit = await as(contador)(request(app).put(`/api/facturas-cartera/${id}`).send({
        fecha: '2026-05-01', tercero: tercero._id.toString(), puc: puc._id.toString(), monto: 2000, detalle: 'x', naturaleza: 'credito'
      }));
      expect(edit.status).toBe(400);
    });

    test('editar el monto recalcula impuestos, saldo y estado de pago', async () => {
      const id = (await crear(auxiliar, { retefuentePct: 2 })).body.id;
      await as(auxiliar)(request(app).post(`/api/facturas-cartera/${id}/pagos`).send({ monto: 1000 }));

      const body = { fecha: '2026-05-01', tercero: tercero._id.toString(), puc: puc._id.toString(), detalle: 'Venta', naturaleza: 'credito' };
      const menor = await as(contador)(request(app).put(`/api/facturas-cartera/${id}`).send({ ...body, monto: 500 }));
      expect(menor.status).toBe(400);

      const res = await as(contador)(request(app).put(`/api/facturas-cartera/${id}`).send({ ...body, monto: 1500, totalPagado: 0, estadoPago: 'Pendiente' }));
      expect(res.status).toBe(200);
      expect(res.body.factura.impuestos.iva).toBe(285);
      expect(res.body.factura.impuestos.retefuente).toBe(30);
      expect(res.body.factura.totalPagado).toBe(1000); // no se puede sobrescribir desde el body
      expect(res.body.factura.saldoPendiente).toBe(500);
      expect(res.body.factura.estadoPago).toBe('Parcialmente Pagada');
    });
  });

  describe('GET /api/terceros?tipo=', () => {
    test('filtrar por cliente o proveedor incluye a los terceros de tipo "ambos"', async () => {
      const base = { tipoDocumento: 'NIT', activo: true };
      await Tercero.create([
        { ...base, tipo: 'cliente', razonSocial: 'Solo Cliente', numeroDocumento: `1${Date.now()}` },
        { ...base, tipo: 'proveedor', razonSocial: 'Solo Proveedor', numeroDocumento: `2${Date.now()}` },
        { ...base, tipo: 'ambos', razonSocial: 'Cliente y Proveedor', numeroDocumento: `3${Date.now()}` },
      ]);
      const nombres = async (tipo) =>
        (await as(auxiliar)(request(app).get(`/api/terceros?tipo=${tipo}`))).body.data.map(t => t.razonSocial).sort();
      expect(await nombres('cliente')).toEqual(['Cliente y Proveedor', 'Solo Cliente']);
      expect(await nombres('proveedor')).toEqual(['Cliente y Proveedor', 'Solo Proveedor']);
      expect(await nombres('ambos')).toEqual(['Cliente y Proveedor']);
    });
  });

  describe('GET /api/terceros/:id', () => {
    test('devuelve el tercero o 404', async () => {
      const t = await Tercero.create({ tipo: 'proveedor', razonSocial: 'Prov SAS', tipoDocumento: 'NIT', numeroDocumento: `8${Date.now()}` });
      const ok = await as(auxiliar)(request(app).get(`/api/terceros/${t._id}`));
      expect(ok.status).toBe(200);
      expect(ok.body.razonSocial).toBe('Prov SAS');
      expect((await as(auxiliar)(request(app).get(`/api/terceros/${fakeId()}`))).status).toBe(404);
    });
  });

  describe('PUC - consulta y deshabilitación', () => {
    test('GET /api/puc/:id devuelve la cuenta o 404', async () => {
      const puc = await Puc.create({ codigo: '110505', nombre: 'Caja general', naturaleza: 'debito' });
      const ok = await as(auxiliar)(request(app).get(`/api/puc/${puc._id}`));
      expect(ok.status).toBe(200);
      expect(ok.body.codigo).toBe('110505');
      expect((await as(auxiliar)(request(app).get(`/api/puc/${fakeId()}`))).status).toBe(404);
    });

    test('DELETE /api/puc/:id deshabilita (soft delete) y 404 si no existe', async () => {
      const puc = await Puc.create({ codigo: '110510', nombre: 'Caja menor', naturaleza: 'debito' });
      expect((await as(contador)(request(app).delete(`/api/puc/${puc._id}`))).status).toBe(200);
      expect((await Puc.findById(puc._id)).activo).toBe(false);
      expect((await as(contador)(request(app).delete(`/api/puc/${fakeId()}`))).status).toBe(404);
    });
  });

  describe('POST /api/chat/message', () => {
    beforeAll(() => {
      // El provider mock simula 700ms de latencia; se ejecuta de inmediato en los tests
      const realSetTimeout = global.setTimeout;
      jest.spyOn(global, 'setTimeout').mockImplementation((fn, ms, ...args) =>
        ms === 700 ? (fn(), 0) : realSetTimeout(fn, ms, ...args));
    });

    test('401 sin token', async () => {
      expect((await request(app).post('/api/chat/message').send({ messages: [] })).status).toBe(401);
    });

    test.each([undefined, [], 'hola'])('400 si messages es inválido (%p)', async (messages) => {
      const res = await as(auxiliar)(request(app).post('/api/chat/message').send({ messages }));
      expect(res.status).toBe(400);
    });

    test('responde con el contexto real del usuario (sus facturas)', async () => {
      await Factura.create([facturaData(auxiliar.user._id), facturaData(auxiliar.user._id), facturaData(auxiliar2.user._id)]);
      const res = await as(auxiliar)(request(app).post('/api/chat/message')
        .send({ messages: [{ role: 'user', content: '¿cuántas facturas tengo?' }] }));
      expect(res.status).toBe(200);
      expect(res.body.reply).toContain('2 facturas');
    });

    test('devuelve acción de navegación', async () => {
      const res = await as(auxiliar)(request(app).post('/api/chat/message')
        .send({ messages: [{ role: 'user', content: 'llévame a reportes' }] }));
      expect(res.body.action).toEqual({ type: 'navigate', payload: 'reportes' });
    });

    test('400 si ningún mensaje tiene texto', async () => {
      const res = await as(auxiliar)(request(app).post('/api/chat/message').send({ messages: [{ role: 'user', content: 42 }, { role: 'user', content: '  ' }] }));
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('El mensaje está vacío');
    });

    test('cuenta TODAS las facturas del usuario (no solo las 10 más recientes) y las del mes', async () => {
      const haceUnAno = new Date(Date.now() - 365 * 86400000);
      await Factura.create([
        ...Array.from({ length: 12 }, () => facturaData(auxiliar.user._id, { fecha: haceUnAno, monto: 1000 })),
        facturaData(auxiliar.user._id, { fecha: new Date(), monto: 5000 }),
      ]);
      const pregunta = async (content) => (await as(auxiliar)(request(app).post('/api/chat/message')
        .send({ messages: [{ role: 'user', content }] }))).body.reply;
      expect(await pregunta('¿cuántas facturas tengo?')).toMatch(/13 facturas.*\*\*1\*\* este mes/);
      expect(await pregunta('¿cuánto he facturado?')).toMatch(/17\.000/);
    });

    test('responde el saldo de cartera y las facturas vencidas del usuario', async () => {
      const tercero = await Tercero.create({ tipo: 'cliente', razonSocial: 'Cliente', tipoDocumento: 'NIT', numeroDocumento: `c${Date.now()}` });
      const puc = await Puc.create({ codigo: `p${Date.now()}`, nombre: 'Ingresos', naturaleza: 'credito' });
      const base = { tercero: tercero._id, puc: puc._id, detalle: 'Venta', naturaleza: 'credito', usuario: auxiliar.user._id };
      await FacturaCartera.create([
        { ...base, consecutivo: 1, numeroDocumento: `CH-${Date.now()}-1`, fecha: new Date('2025-01-01'), monto: 1000 },
        { ...base, consecutivo: 2, numeroDocumento: `CH-${Date.now()}-2`, fecha: new Date(), monto: 500, totalPagado: 200 },
        { ...base, consecutivo: 3, numeroDocumento: `CH-${Date.now()}-3`, fecha: new Date(), monto: 9000, estado: 'anulada' },
        { ...base, consecutivo: 4, numeroDocumento: `CH-${Date.now()}-4`, fecha: new Date(), monto: 700, totalPagado: 700 },
      ]);
      const pregunta = async (content) => (await as(auxiliar)(request(app).post('/api/chat/message')
        .send({ messages: [{ role: 'user', content }] }))).body.reply;
      expect(await pregunta('¿cuánto me deben?')).toMatch(/1\.300.*2 facturas pendientes/);
      expect(await pregunta('¿tengo facturas vencidas?')).toMatch(/1 factura vencida/);
    });

    test('no navega a secciones que el rol no tiene', async () => {
      const res = await as(auxiliar)(request(app).post('/api/chat/message')
        .send({ messages: [{ role: 'user', content: 'abre usuarios' }] }));
      expect(res.body.action).toBeUndefined();
      expect(res.body.reply).toMatch(/no está disponible para tu rol \(auxiliar\)/);
    });

    test('calcula impuestos sin llamar a la IA', async () => {
      const res = await as(auxiliar)(request(app).post('/api/chat/message')
        .send({ messages: [{ role: 'user', content: '¿cuánto es el IVA de 1.500.000?' }] }));
      expect(res.body.reply).toMatch(/285\.000/);
    });

    test('un historial largo responde al último mensaje y no expone datos internos', async () => {
      const historial = Array.from({ length: 15 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `mensaje ${i}` }));
      historial.push({ role: 'user', content: '¿qué es el PUC?' });
      const res = await as(auxiliar)(request(app).post('/api/chat/message').send({ messages: historial }));
      expect(res.status).toBe(200);
      expect(res.body.reply).toMatch(/Plan Único de Cuentas/);
      expect(res.body).not.toHaveProperty('source');
    });
  });
});

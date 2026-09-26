const mongoose = require('mongoose');
const Factura = require('../../models/factura');
const FacturaCartera = require('../../models/facturaCartera');
const Tercero = require('../../models/tercero');
const Puc = require('../../models/puc');
const User = require('../../models/user');
const Role = require('../../models/role');
const Sequence = require('../../models/sequence');

const oid = () => new mongoose.Types.ObjectId();
const validationErrorsOf = (doc) => Object.keys(doc.validateSync()?.errors || {});

describe('Modelos Mongoose', () => {
  beforeAll(async () => {
    // Asegurar índices únicos antes de probar duplicados
    await Promise.all([Factura, FacturaCartera, Tercero, Puc, User, Role, Sequence].map(m => m.init()));
  });

  afterEach(async () => {
    await Promise.all([User, Role, Sequence].map(m => m.deleteMany({})));
  });

  describe('Factura', () => {
    const base = () => ({
      numero: `F-${Date.now()}-${Math.random()}`, fecha: new Date(), proveedor: 'Prov',
      monto: 1000, puc: '510506', detalle: 'Servicio', naturaleza: 'debito', usuario: oid()
    });

    test('exige los campos obligatorios', () => {
      const errs = validationErrorsOf(new Factura({}));
      expect(errs).toEqual(expect.arrayContaining(['numero', 'fecha', 'proveedor', 'monto', 'puc', 'detalle', 'naturaleza', 'usuario']));
    });

    test('rechaza naturaleza fuera del enum', () => {
      expect(validationErrorsOf(new Factura({ ...base(), naturaleza: 'otro' }))).toContain('naturaleza');
    });

    test('pre-save calcula impuestos con retenciones', async () => {
      const f = await Factura.create({ ...base(), retefuentePct: 2.5, icaPct: 1 });
      expect(f.impuestos.toObject()).toEqual({ iva: 190, retefuente: 25, ica: 10, totalAPagar: 1155 });
    });

    test('número de factura es único', async () => {
      const data = base();
      await Factura.create(data);
      await expect(Factura.create({ ...data })).rejects.toMatchObject({ code: 11000 });
    });

    test('findByIdAndUpdate recalcula impuestos al cambiar el monto', async () => {
      const f = await Factura.create({ ...base(), retefuentePct: 2, icaPct: 1 });
      const upd = await Factura.findByIdAndUpdate(f._id, { monto: 2000, retefuentePct: 2, icaPct: 1 }, { new: true });
      expect(upd.impuestos.toObject()).toEqual({ iva: 380, retefuente: 40, ica: 20, totalAPagar: 2320 });
    });

    test('findByIdAndUpdate conserva los % de retención guardados si solo cambia el monto', async () => {
      const f = await Factura.create({ ...base(), retefuentePct: 2, icaPct: 1 });
      const upd = await Factura.findByIdAndUpdate(f._id, { monto: 2000 }, { new: true });
      expect(upd.impuestos.retefuente).toBe(40);
      expect(upd.impuestos.ica).toBe(20);
    });
  });

  describe('FacturaCartera', () => {
    const base = () => ({
      consecutivo: 1, numeroDocumento: `FC-${Date.now()}-${Math.random()}`, fecha: new Date('2026-01-01'),
      tercero: oid(), monto: 1000, puc: oid(), detalle: 'Venta', naturaleza: 'credito', usuario: oid()
    });

    test('exige los campos obligatorios y valida enums', () => {
      const errs = validationErrorsOf(new FacturaCartera({ tipo: 'x', estadoPago: 'x', estado: 'x' }));
      expect(errs).toEqual(expect.arrayContaining(['consecutivo', 'numeroDocumento', 'fecha', 'tercero', 'monto', 'puc', 'detalle', 'naturaleza', 'usuario', 'tipo', 'estadoPago', 'estado']));
    });

    test('pre-save: impuestos, vencimiento por plazo por defecto (30 días) y estado Pendiente', async () => {
      const f = await FacturaCartera.create(base());
      expect(f.impuestos.iva).toBe(190);
      expect(f.fechaVencimiento.toISOString().slice(0, 10)).toBe('2026-01-31');
      expect(f.saldoPendiente).toBe(1000);
      expect(f.estadoPago).toBe('Pendiente');
      expect(f.tipo).toBe('factura');
      expect(f.estado).toBe('activa');
    });

    test('respeta un plazo personalizado', async () => {
      const f = await FacturaCartera.create({ ...base(), plazo: 60 });
      expect(f.fechaVencimiento.toISOString().slice(0, 10)).toBe('2026-03-02');
    });

    test('estado Parcialmente Pagada y Pagada según totalPagado', async () => {
      const parcial = await FacturaCartera.create({ ...base(), totalPagado: 400 });
      expect(parcial.saldoPendiente).toBe(600);
      expect(parcial.estadoPago).toBe('Parcialmente Pagada');

      const pagada = await FacturaCartera.create({ ...base(), totalPagado: 1000 });
      expect(pagada.saldoPendiente).toBe(0);
      expect(pagada.estadoPago).toBe('Pagada');
    });

    test('findByIdAndUpdate conserva los % de retención guardados si solo cambia el monto', async () => {
      const f = await FacturaCartera.create({ ...base(), retefuentePct: 2, icaPct: 1 });
      const upd = await FacturaCartera.findByIdAndUpdate(f._id, { monto: 2000 }, { new: true });
      expect(upd.impuestos.retefuente).toBe(40);
      expect(upd.impuestos.ica).toBe(20);
    });
  });

  describe('Tercero', () => {
    test('exige campos obligatorios y valida enums', () => {
      const errs = validationErrorsOf(new Tercero({ tipo: 'x', tipoDocumento: 'x' }));
      expect(errs).toEqual(expect.arrayContaining(['tipo', 'razonSocial', 'tipoDocumento', 'numeroDocumento']));
    });

    test('activo por defecto y documento único', async () => {
      const data = { tipo: 'cliente', razonSocial: 'ACME', tipoDocumento: 'NIT', numeroDocumento: `900${Date.now()}` };
      const t = await Tercero.create(data);
      expect(t.activo).toBe(true);
      await expect(Tercero.create(data)).rejects.toMatchObject({ code: 11000 });
    });
  });

  describe('Puc', () => {
    test('exige campos y valida naturaleza', () => {
      const errs = validationErrorsOf(new Puc({ naturaleza: 'x' }));
      expect(errs).toEqual(expect.arrayContaining(['codigo', 'nombre', 'naturaleza']));
    });

    test('activo por defecto y código único', async () => {
      const data = { codigo: `9${Date.now()}`, nombre: 'Cuenta', naturaleza: 'debito' };
      expect((await Puc.create(data)).activo).toBe(true);
      await expect(Puc.create(data)).rejects.toMatchObject({ code: 11000 });
    });
  });

  describe('Role', () => {
    test('valida enum de nombre y rango de nivel', () => {
      const errs = validationErrorsOf(new Role({ name: 'superadmin', nivel: 5, descripcion: 'x' }));
      expect(errs).toEqual(expect.arrayContaining(['name', 'nivel']));
      expect(validationErrorsOf(new Role({ name: 'auxiliar', nivel: 0, descripcion: 'x' }))).toContain('nivel');
    });

    test('guarda el nombre en minúscula', () => {
      const r = new Role({ name: 'CONTADOR', nivel: 2, descripcion: 'x' });
      expect(r.name).toBe('contador');
      expect(r.validateSync()).toBeUndefined();
    });
  });

  describe('User', () => {
    const base = () => ({
      nombres: 'Ana', apellidos: 'Pérez', email: `u${Date.now()}@t.com`, password: 'hash',
      telefono: '3001234567', numeroDocumento: `${Date.now()}`, role: oid()
    });

    test('exige campos obligatorios', () => {
      const errs = validationErrorsOf(new User({}));
      expect(errs).toEqual(expect.arrayContaining(['nombres', 'apellidos', 'email', 'password', 'telefono', 'numeroDocumento', 'role']));
    });

    test('teléfono debe tener al menos 10 dígitos numéricos', () => {
      expect(validationErrorsOf(new User({ ...base(), telefono: '12345' }))).toContain('telefono');
      expect(validationErrorsOf(new User({ ...base(), telefono: '300-123-4567' }))).toContain('telefono');
      expect(validationErrorsOf(new User(base()))).not.toContain('telefono');
    });

    test('valida tipoDocumento y aplica defaults', () => {
      expect(validationErrorsOf(new User({ ...base(), tipoDocumento: 'XX' }))).toContain('tipoDocumento');
      const u = new User(base());
      expect(u.tipoDocumento).toBe('CC');
      expect(u.activo).toBe(true);
      expect(u.approved).toBe(false);
    });

    test('email y numeroDocumento son únicos', async () => {
      const data = base();
      await User.create(data);
      await expect(User.create({ ...data, numeroDocumento: 'otro' })).rejects.toMatchObject({ code: 11000 });
      await expect(User.create({ ...data, email: 'otro@t.com' })).rejects.toMatchObject({ code: 11000 });
    });
  });

  describe('Sequence', () => {
    test('seq inicia en 0 y el nombre es obligatorio y único', async () => {
      expect(validationErrorsOf(new Sequence({}))).toContain('name');
      const s = await Sequence.create({ name: 'x' });
      expect(s.seq).toBe(0);
      await expect(Sequence.create({ name: 'x' })).rejects.toMatchObject({ code: 11000 });
    });
  });
});

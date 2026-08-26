// Modelos mock — subclases concretas de MockModel
const MockModel = require('./MockModel');
const { calcularImpuestos } = require('../../utils/impuestosCalculator');

class MockRole extends MockModel {
  static _name = 'Role';

  static _checkUnique(doc) {
    if (doc.name) {
      const existing = this._store.find(d => d.name === doc.name && d._id !== doc._id);
      if (existing) {
        throw new Error(`E11000 duplicate key error: name "${doc.name}" already exists`);
      }
    }
  }
}

class MockUser extends MockModel {
  static _name = 'User';

  constructor(data = {}) {
    super(data);
    this.activo = data.activo !== undefined ? data.activo : true;
    this.approved = data.approved !== undefined ? data.approved : false;
  }

  static _checkUnique(doc) {
    if (doc.email) {
      const existing = this._store.find(d => d.email === doc.email && d._id !== doc._id);
      if (existing) {
        throw new Error(`E11000 duplicate key error: email "${doc.email}" already exists`);
      }
    }
  }
}

class MockTercero extends MockModel {
  static _name = 'Tercero';

  constructor(data = {}) {
    super(data);
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  static _checkUnique(doc) {
    if (doc.numeroDocumento) {
      const existing = this._store.find(
        d => d.numeroDocumento === doc.numeroDocumento && d._id !== doc._id
      );
      if (existing) {
        throw new Error(`E11000 duplicate key error: numeroDocumento "${doc.numeroDocumento}" already exists`);
      }
    }
  }
}

class MockPuc extends MockModel {
  static _name = 'Puc';

  constructor(data = {}) {
    super(data);
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  static _checkUnique(doc) {
    if (doc.codigo) {
      const existing = this._store.find(d => d.codigo === doc.codigo && d._id !== doc._id);
      if (existing) {
        throw new Error(`E11000 duplicate key error: codigo "${doc.codigo}" already exists`);
      }
    }
  }
}

class MockFactura extends MockModel {
  static _name = 'Factura';

  constructor(data = {}) {
    super(data);
    this.impuestos = data.impuestos || { iva: 0, retefuente: 0, ica: 0 };
  }

  static _runPreSave(doc) {
    if (doc.monto != null) {
      doc.impuestos = calcularImpuestos(doc.monto, doc.retefuentePct, doc.icaPct);
    }
  }

  static _runPreUpdate(doc, update) {
    if (update.monto != null) {
      doc.impuestos = calcularImpuestos(update.monto, update.retefuentePct || doc.retefuentePct, update.icaPct || doc.icaPct);
    }
  }

  static _checkUnique(doc) {
    if (doc.numero) {
      const existing = this._store.find(d => d.numero === doc.numero && d._id !== doc._id);
      if (existing) {
        throw new Error(`E11000 duplicate key error: numero "${doc.numero}" already exists`);
      }
    }
  }
}

class MockFacturaCartera extends MockModel {
  static _name = 'FacturaCartera';

  constructor(data = {}) {
    super(data);
    this.estado = data.estado || 'activa';
    this.impuestos = data.impuestos || { iva: 0, retefuente: 0, ica: 0 };
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  static _runPreSave(doc) {
    doc.estado = doc.estado || 'activa';
    if (doc.monto != null) {
      doc.impuestos = calcularImpuestos(doc.monto, doc.retefuentePct, doc.icaPct);
    }
  }

  static _runPreUpdate(doc, update) {
    if (update.monto != null) {
      doc.impuestos = calcularImpuestos(update.monto, update.retefuentePct || doc.retefuentePct, update.icaPct || doc.icaPct);
    }
  }

  static _checkUnique(doc) {
    if (doc.numeroDocumento) {
      const existing = this._store.find(
        d => d.numeroDocumento === doc.numeroDocumento && d._id !== doc._id
      );
      if (existing) {
        throw new Error(`E11000 duplicate key error: numeroDocumento "${doc.numeroDocumento}" already exists`);
      }
    }
  }
}

class MockSequence extends MockModel {
  static _name = 'Sequence';
}

module.exports = {
  MockUser,
  MockRole,
  MockFactura,
  MockTercero,
  MockPuc,
  MockFacturaCartera,
  MockSequence
};

// Mocks para modelos Mongoose
const mockModels = {
  users: [],
  roles: [],
  facturas: [],
  terceros: [],
  pucs: []
};

// Mock User Model
class MockUser {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substr(2, 9);
    this.nombres = data.nombres;
    this.apellidos = data.apellidos;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role;
    this.approved = data.approved !== undefined ? data.approved : false;
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  save() {
    mockModels.users.push(this);
    return Promise.resolve(this);
  }

  populate(field) {
    if (field === 'role' && this.role) {
      const role = mockModels.roles.find(r => r._id === this.role || r._id.toString() === this.role.toString());
      this.role = role || this.role;
    }
    return Promise.resolve(this);
  }

  static findOne(query) {
    return Promise.resolve(
      mockModels.users.find(u =>
        Object.keys(query).every(key => u[key] === query[key])
      )
    );
  }

  static findById(id) {
    return Promise.resolve(
      mockModels.users.find(u => u._id === id || u._id.toString() === id.toString())
    );
  }

  static findByIdAndUpdate(id, update, options = {}) {
    const user = mockModels.users.find(u => u._id === id || u._id.toString() === id.toString());
    if (user) {
      Object.assign(user, update);
      return Promise.resolve(options.new ? user : null);
    }
    return Promise.resolve(null);
  }

  static deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      mockModels.users = [];
    } else {
      mockModels.users = mockModels.users.filter(u =>
        !Object.keys(query).every(key => u[key] === query[key])
      );
    }
    return Promise.resolve({ deletedCount: mockModels.users.length });
  }
}

// Mock Role Model
class MockRole {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substr(2, 9);
    this.name = data.name;
    this.nivel = data.nivel;
    this.descripcion = data.descripcion;
  }

  save() {
    mockModels.roles.push(this);
    return Promise.resolve(this);
  }

  static findOne(query) {
    return Promise.resolve(
      mockModels.roles.find(r =>
        Object.keys(query).every(key => r[key] === query[key])
      )
    );
  }

  static create(data) {
    const role = new MockRole(data);
    mockModels.roles.push(role);
    return Promise.resolve(role);
  }

  static deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      mockModels.roles = [];
    } else {
      mockModels.roles = mockModels.roles.filter(r =>
        !Object.keys(query).every(key => r[key] === query[key])
      );
    }
    return Promise.resolve({ deletedCount: mockModels.roles.length });
  }
}

// Mock Factura Model
class MockFactura {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substr(2, 9);
    this.numero = data.numero;
    this.fecha = data.fecha;
    this.proveedor = data.proveedor;
    this.monto = data.monto;
    this.puc = data.puc;
    this.detalle = data.detalle;
    this.naturaleza = data.naturaleza;
    this.usuario = data.usuario;
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  static deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      mockModels.facturas = [];
    }
    return Promise.resolve({ deletedCount: 0 });
  }
}

// Mock Tercero Model
class MockTercero {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substr(2, 9);
    this.tipo = data.tipo;
    this.razonSocial = data.razonSocial;
    this.numeroDocumento = data.numeroDocumento;
    this.activo = data.activo !== undefined ? data.activo : true;
  }

  static deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      mockModels.terceros = [];
    }
    return Promise.resolve({ deletedCount: 0 });
  }
}

// Mock Puc Model
class MockPuc {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substr(2, 9);
    this.codigo = data.codigo;
    this.nombre = data.nombre;
    this.naturaleza = data.naturaleza;
  }

  static deleteMany(query = {}) {
    if (Object.keys(query).length === 0) {
      mockModels.pucs = [];
    }
    return Promise.resolve({ deletedCount: 0 });
  }
}

function resetMocks() {
  mockModels.users = [];
  mockModels.roles = [];
  mockModels.facturas = [];
  mockModels.terceros = [];
  mockModels.pucs = [];
}

module.exports = {
  MockUser,
  MockRole,
  MockFactura,
  MockTercero,
  MockPuc,
  mockModels,
  resetMocks
};

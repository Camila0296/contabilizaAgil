// Centro de datos compartido para todos los mocks en memoria
const crypto = require('crypto');

const stores = {
  User: [],
  Role: [],
  Factura: [],
  Tercero: [],
  Puc: [],
  FacturaCartera: [],
  Sequence: []
};

const REF_MAP = {
  User: { role: 'Role' },
  Factura: { usuario: 'User' },
  FacturaCartera: { tercero: 'Tercero', puc: 'Puc', usuario: 'User' }
};

const COLLECTION_NAME_MAP = {
  users: 'User',
  roles: 'Role',
  facturas: 'Factura',
  terceros: 'Tercero',
  pucs: 'Puc',
  facturacarteras: 'FacturaCartera',
  sequences: 'Sequence'
};

function genId() {
  return crypto.randomBytes(12).toString('hex');
}

function idsEqual(a, b) {
  if (a == null || b == null) return a === b;
  return a.toString() === b.toString();
}

function resetStores(keepRoles = false) {
  Object.keys(stores).forEach(k => {
    // No limpiar Roles si keepRoles es true
    if (keepRoles && k === 'Role') return;
    stores[k].length = 0;
  });
}

module.exports = {
  stores,
  REF_MAP,
  COLLECTION_NAME_MAP,
  genId,
  idsEqual,
  resetStores
};

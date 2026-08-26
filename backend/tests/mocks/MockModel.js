// Clase base genérica para todos los modelos mock
const { stores, REF_MAP, genId, idsEqual } = require('./db');
const MockQuery = require('./MockQuery');

function getPath(obj, path) {
  return path.split('.').reduce((o, p) => o?.[p], obj);
}

function projectFields(doc, projection) {
  if (!projection) return doc;
  const fields = projection.split(' ').filter(Boolean);
  const out = { _id: doc._id };
  fields.forEach(f => {
    out[f] = doc[f];
  });
  return out;
}

// Mini query engine para filtros
function matchField(value, cond) {
  if (cond instanceof RegExp) {
    return cond.test(String(value ?? ''));
  }

  if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
    return Object.entries(cond).every(([op, arg]) => {
      switch (op) {
        case '$ne':
          return !idsEqual(value, arg) && value !== arg;
        case '$in':
          return arg.some(a => idsEqual(value, a) || value === a);
        case '$exists':
          return arg ? value !== undefined : value === undefined;
        case '$gte':
          return value >= arg;
        case '$lte':
          return value <= arg;
        case '$gt':
          return value > arg;
        case '$lt':
          return value < arg;
        case '$regex':
          const regexOpts = cond.$options || '';
          return new RegExp(arg, regexOpts).test(String(value ?? ''));
        case '$options':
          // $options es manejado junto con $regex, ignorar aquí
          return true;
        default:
          throw new Error(`Mock matcher: operador no soportado "${op}"`);
      }
    });
  }

  return value === cond || idsEqual(value, cond);
}

function matches(doc, filter) {
  if (!filter || typeof filter !== 'object') return true;

  return Object.entries(filter).every(([key, cond]) => {
    if (key === '$or') {
      return cond.some(sub => matches(doc, sub));
    }
    if (key === '$and') {
      return cond.every(sub => matches(doc, sub));
    }

    const value = getPath(doc, key);
    return matchField(value, cond);
  });
}

function stripOperators(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (!k.startsWith('$')) out[k] = v;
  }
  return out;
}

function applyUpdate(doc, update) {
  if (!update) return;

  if (update.$inc) {
    Object.entries(update.$inc).forEach(([k, v]) => {
      doc[k] = (doc[k] || 0) + v;
    });
    const { $inc, ...rest } = update;
    Object.assign(doc, rest);
  } else {
    Object.assign(doc, update);
  }
}

class MockModel {
  static _name = 'MockModel';
  static _uniqueFields = {}; // override en subclases: { name: 'Role', email: 'User' }

  static get _store() {
    return stores[this._name];
  }

  constructor(data = {}) {
    this._id = data._id || genId();
    Object.assign(this, this.constructor._applyDefaults(data));
  }

  static _applyDefaults(data) {
    return { ...data };
  }

  static _runPreSave(doc) {} // no-op por defecto, override en Factura/FacturaCartera
  static _runPreUpdate(doc, update) {}
  static _checkUnique(doc) {} // override en subclases

  async save() {
    this.constructor._checkUnique(this);
    this.constructor._runPreSave(this);

    const idx = this.constructor._store.findIndex(d => idsEqual(d._id, this._id));
    if (idx >= 0) {
      this.constructor._store[idx] = this;
    } else {
      this.constructor._store.push(this);
    }
    return this;
  }

  populate(path, projection) {
    const q = new MockQuery(() => Promise.resolve(this), {
      many: false,
      modelName: this.constructor._name
    });
    q.populate(path, projection);
    return q._exec();
  }

  static find(filter = {}) {
    return new MockQuery(
      () => Promise.resolve(this._store.filter(d => matches(d, filter))),
      { many: true, modelName: this._name }
    );
  }

  static findOne(filter = {}) {
    return new MockQuery(
      () => {
        const result = this._store.find(d => matches(d, filter)) || null;
        if (this._name === 'User' && filter._id) {
          console.log(`[MockModel] ${this._name}.findOne({ _id: ${filter._id} }): found=${!!result}, storeSize=${this._store.length}`);
        }
        return Promise.resolve(result);
      },
      { many: false, modelName: this._name }
    );
  }

  static findById(id) {
    return this.findOne({ _id: id });
  }

  static findByIdAndUpdate(id, update, options = {}) {
    const self = this;
    return new MockQuery(
      async () => {
        const doc = self._store.find(d => idsEqual(d._id, id));
        if (!doc) return null;

        const snapshotBefore = { ...doc };
        applyUpdate(doc, update);
        self._runPreUpdate(doc, update);

        return options.new ? doc : snapshotBefore;
      },
      { many: false, modelName: this._name }
    );
  }

  static findByIdAndDelete(id) {
    const self = this;
    return new MockQuery(
      async () => {
        const idx = self._store.findIndex(d => idsEqual(d._id, id));
        if (idx === -1) return null;
        const [removed] = self._store.splice(idx, 1);
        return removed;
      },
      { many: false, modelName: this._name }
    );
  }

  static findOneAndUpdate(filter, update, options = {}) {
    const self = this;
    return new MockQuery(
      async () => {
        let doc = self._store.find(d => matches(d, filter));
        if (!doc && options.upsert) {
          doc = new self({ ...stripOperators(filter) });
          self._store.push(doc);
        }
        if (!doc) return null;

        applyUpdate(doc, update);
        self._runPreUpdate(doc, update);

        return doc;
      },
      { many: false, modelName: this._name }
    );
  }

  static create(data) {
    return (async () => {
      const doc = new this(data);
      await doc.save();
      return doc;
    })();
  }

  static countDocuments(filter = {}) {
    return Promise.resolve(this._store.filter(d => matches(d, filter)).length);
  }

  static deleteMany(filter = {}) {
    const remaining = this._store.filter(d => !matches(d, filter));
    const deletedCount = this._store.length - remaining.length;
    this._store.length = 0;
    this._store.push(...remaining);
    return Promise.resolve({ deletedCount });
  }

  static updateMany(filter, update) {
    const matched = this._store.filter(d => matches(d, filter));
    matched.forEach(d => applyUpdate(d, update));
    return Promise.resolve({
      matchedCount: matched.length,
      modifiedCount: matched.length
    });
  }

  static distinct(field, filter = {}) {
    const vals = this._store
      .filter(d => matches(d, filter))
      .map(d => getPath(d, field))
      .filter(v => v != null);
    return Promise.resolve([...new Set(vals)]);
  }

  static aggregate(pipeline) {
    return runAggregate(this._store, pipeline);
  }
}

// Mini intérprete de agregación
function evalExpr(doc, expr) {
  if (typeof expr === 'string' && expr.startsWith('$')) {
    return getPath(doc, expr.slice(1));
  }
  if (Array.isArray(expr)) {
    return expr.map(e => evalExpr(doc, e));
  }
  if (expr && typeof expr === 'object') {
    const [fn, arg] = Object.entries(expr)[0];
    if (fn === '$substr') {
      const [f, start, len] = arg;
      return String(evalExpr(doc, f)).substr(start, len);
    }
    if (fn === '$concat') {
      return arg.map(a => String(evalExpr(doc, a) ?? '')).join('');
    }
    throw new Error(`Mock aggregate: expresión no soportada "${fn}"`);
  }
  return expr;
}

function applyAccumulator(op, arg, docs) {
  if (op === '$sum') {
    return arg === 1 ? docs.length : docs.reduce((s, d) => s + (Number(evalExpr(d, arg)) || 0), 0);
  }
  if (op === '$first') {
    return docs.length ? evalExpr(docs[0], arg) : undefined;
  }
  if (op === '$min') {
    return docs.reduce((m, d) => {
      const v = evalExpr(d, arg);
      return m === undefined || v < m ? v : m;
    }, undefined);
  }
  if (op === '$max') {
    return docs.reduce((m, d) => {
      const v = evalExpr(d, arg);
      return m === undefined || v > m ? v : m;
    }, undefined);
  }
  throw new Error(`Mock aggregate: acumulador no soportado "${op}"`);
}

function runGroup(docs, spec) {
  const groups = new Map();
  for (const doc of docs) {
    const idVal = evalExpr(doc, spec._id);
    const key = JSON.stringify(idVal);
    if (!groups.has(key)) groups.set(key, { idVal, docs: [] });
    groups.get(key).docs.push(doc);
  }

  return [...groups.values()].map(({ idVal, docs: gdocs }) => {
    const out = { _id: idVal };
    for (const [field, accExpr] of Object.entries(spec)) {
      if (field === '_id') continue;
      const [accOp, accArg] = Object.entries(accExpr)[0];
      out[field] = applyAccumulator(accOp, accArg, gdocs);
    }
    return out;
  });
}

function applySortGeneric(docs, spec) {
  let field, dir;
  if (typeof spec === 'string') {
    [field, dir] = [spec, 1];
  } else if (Array.isArray(spec)) {
    [field, dir] = spec[0];
  } else {
    [field, dir] = Object.entries(spec)[0];
  }

  const d = dir === -1 || dir === 'desc' ? -1 : 1;
  return [...docs].sort((a, b) => {
    const av = getPath(a, field);
    const bv = getPath(b, field);
    if (av === bv) return 0;
    return (av > bv ? 1 : -1) * d;
  });
}

function runLookup(docs, spec) {
  const { from, localField, foreignField, as } = spec;
  const targetModelName = require('./db').COLLECTION_NAME_MAP[from];
  const targetStore = stores[targetModelName] || [];
  return docs.map(d => ({
    ...d,
    [as]: targetStore.filter(t => idsEqual(getPath(t, foreignField), getPath(d, localField)))
  }));
}

function runUnwind(docs, spec) {
  const path = (typeof spec === 'string' ? spec : spec.path).replace(/^\$/, '');
  const out = [];
  for (const d of docs) {
    const arr = getPath(d, path);
    if (!Array.isArray(arr) || arr.length === 0) continue;
    arr.forEach(item => {
      const cloned = { ...d };
      const keys = path.split('.');
      let obj = cloned;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = item;
      out.push(cloned);
    });
  }
  return out;
}

function runProject(doc, spec) {
  const out = {};
  for (const [field, include] of Object.entries(spec)) {
    if (include === 1 || include === true) {
      out[field] = getPath(doc, field);
    } else if (typeof include === 'object') {
      // expresión, p.ej. { $substr: [...] }
      out[field] = evalExpr(doc, include);
    }
  }
  return out;
}

async function runAggregate(store, pipeline) {
  let docs = store.map(d => ({ ...d })); // clones desacoplados

  for (const stage of pipeline) {
    const [op, spec] = Object.entries(stage)[0];
    switch (op) {
      case '$match':
        docs = docs.filter(d => matches(d, spec));
        break;
      case '$group':
        docs = runGroup(docs, spec);
        break;
      case '$sort':
        docs = applySortGeneric(docs, spec);
        break;
      case '$limit':
        docs = docs.slice(0, spec);
        break;
      case '$lookup':
        docs = runLookup(docs, spec);
        break;
      case '$unwind':
        docs = runUnwind(docs, spec);
        break;
      case '$project':
        docs = docs.map(d => runProject(d, spec));
        break;
      default:
        throw new Error(`Mock aggregate: stage no soportado "${op}"`);
    }
  }

  return docs;
}

module.exports = MockModel;

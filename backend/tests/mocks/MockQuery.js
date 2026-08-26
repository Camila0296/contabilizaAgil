// Query builder encadenable y thenable (similar a Mongoose Query)
const { idsEqual, stores, REF_MAP } = require('./db');

function projectFields(doc, projection) {
  if (!projection) return doc;
  const fields = projection.split(' ').filter(Boolean);
  const out = { _id: doc._id };
  fields.forEach(f => {
    out[f] = doc[f];
  });
  return out;
}

class MockQuery {
  constructor(execFn, { many, modelName }) {
    this._execFn = execFn;
    this._many = many; // true para find(), false para findOne/findById/findByIdAndUpdate/etc
    this._modelName = modelName;
    this._populates = [];
    this._sort = null;
    this._skip = 0;
    this._limit = null;
  }

  populate(path, projection) {
    this._populates.push({ path, projection });
    return this; // encadenable
  }

  sort(spec) {
    this._sort = spec;
    return this;
  }

  skip(n) {
    this._skip = n;
    return this;
  }

  limit(n) {
    this._limit = n;
    return this;
  }

  async _resolvePopulateOn(doc) {
    if (!doc) {
      if (this._populates.length > 0) console.log('[MockQuery] _resolvePopulateOn: doc es null/undefined');
      return doc;
    }
    for (const { path, projection } of this._populates) {
      const raw = doc[path];
      if (raw == null) {
        console.log(`[MockQuery] ${this._modelName}.populate('${path}'): campo null/undefined`);
        continue;
      }

      const refId = typeof raw === 'object' && raw._id ? raw._id : raw;
      const refModelName = REF_MAP[this._modelName]?.[path];
      const refStore = stores[refModelName] || [];

      console.log(`[MockQuery] ${this._modelName}.populate('${path}'): refId=${refId}, refModel=${refModelName}, refStoreSize=${refStore.length}`);

      const found = refStore.find(r => idsEqual(r._id, refId));
      if (found) {
        console.log(`[MockQuery] populate('${path}'): Encontrado, asignando`);
        doc[path] = projection ? projectFields(found, projection) : found;
      } else {
        console.log(`[MockQuery] populate('${path}'): NO encontrado en store`);
      }
      // si no se encuentra, se deja el id crudo (igual que mongoose real)
    }
    return doc;
  }

  _applySort(arr) {
    if (!this._sort) return arr;

    let field, dir;
    if (typeof this._sort === 'string') {
      // p.ej. "fecha"
      [field, dir] = [this._sort, 1];
    } else if (Array.isArray(this._sort)) {
      // p.ej. [["fecha", -1]]
      [field, dir] = this._sort[0];
    } else {
      // p.ej. { fecha: -1 }
      [field, dir] = Object.entries(this._sort)[0];
    }

    const d = dir === -1 || dir === 'desc' ? -1 : 1;
    return [...arr].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * d;
    });
  }

  async _exec() {
    let result = await this._execFn();

    if (this._many) {
      result = this._applySort(result);
      if (this._skip) result = result.slice(this._skip);
      if (this._limit != null) result = result.slice(0, this._limit);
      for (const doc of result) await this._resolvePopulateOn(doc);
      return result;
    }

    await this._resolvePopulateOn(result);
    return result;
  }

  // Hacer que `await Model.findOne(...)` funcione sin `.exec()`
  then(onFulfilled, onRejected) {
    return this._exec().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this._exec().catch(onRejected);
  }

  finally(onFinally) {
    return this._exec().finally(onFinally);
  }
}

module.exports = MockQuery;

const Factura = require('../models/factura');

const facturaCtrl = {};

facturaCtrl.getFacturas = async (req, res) => {
  const facturas = await Factura.find().populate('usuario');
  res.json(facturas);
};

facturaCtrl.getFactura = async (req, res) => {
  const factura = await Factura.findById(req.params.id).populate('usuario');
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json(factura);
};

facturaCtrl.createFactura = async (req, res) => {
  const { numero, fecha, proveedor, monto, puc, detalle, naturaleza } = req.body;
  if (!numero || !fecha || !proveedor || !monto || !puc || !detalle || !naturaleza) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const exists = await Factura.findOne({ numero });
  if (exists) return res.status(400).json({ error: 'Ya existe una factura con ese número' });
  const factura = new Factura(req.body);
  await factura.save();
  res.json({ status: 'Factura guardada' });
};

facturaCtrl.updateFactura = async (req, res) => {
  const { numero, fecha, proveedor, monto, puc, detalle, naturaleza } = req.body;
  if (!numero || !fecha || !proveedor || !monto || !puc || !detalle || !naturaleza) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }
  const exists = await Factura.findOne({ numero, _id: { $ne: req.params.id } });
  if (exists) return res.status(400).json({ error: 'Ya existe una factura con ese número' });
  const factura = await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json({ status: 'Factura actualizada' });
};

facturaCtrl.deleteFactura = async (req, res) => {
  const factura = await Factura.findByIdAndDelete(req.params.id);
  if (!factura) return res.status(404).json({ error: 'Factura no encontrada' });
  res.json({ status: 'Factura eliminada' });
};

module.exports = facturaCtrl;
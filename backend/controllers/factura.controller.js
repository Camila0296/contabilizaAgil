const Factura = require('../models/factura');

const facturaCtrl = {};

facturaCtrl.getFacturas = async (req, res) => {
  const facturas = await Factura.find().populate('usuario');
  res.json(facturas);
};

facturaCtrl.getFactura = async (req, res) => {
  const factura = await Factura.findById(req.params.id).populate('usuario');
  res.json(factura);
};

facturaCtrl.createFactura = async (req, res) => {
  const factura = new Factura(req.body);
  await factura.save();
  res.json({ status: 'Factura guardada' });
};

facturaCtrl.updateFactura = async (req, res) => {
  await Factura.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ status: 'Factura actualizada' });
};

facturaCtrl.deleteFactura = async (req, res) => {
  await Factura.findByIdAndDelete(req.params.id);
  res.json({ status: 'Factura eliminada' });
};

module.exports = facturaCtrl;
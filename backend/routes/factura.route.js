const express = require('express');
const router = express.Router();
const facturaCtrl = require('../controllers/factura.controller');

router.get('/', facturaCtrl.getFacturas);
router.get('/:id', facturaCtrl.getFactura);
router.post('/', facturaCtrl.createFactura);
router.put('/:id', facturaCtrl.updateFactura);
router.delete('/:id', facturaCtrl.deleteFactura);

module.exports = router;
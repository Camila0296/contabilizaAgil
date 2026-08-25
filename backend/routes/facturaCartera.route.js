const express = require('express');
const router = express.Router();
const facturaCarteraCtrl = require('../controllers/facturaCartera.controller');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', facturaCarteraCtrl.createFacturaCartera);
router.get('/', facturaCarteraCtrl.getFacturasCartera);
router.get('/:id', facturaCarteraCtrl.getFacturaCartera);
router.put('/:id', facturaCarteraCtrl.updateFacturaCartera);
router.delete('/:id', facturaCarteraCtrl.deleteFacturaCartera);

module.exports = router;

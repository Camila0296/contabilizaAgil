const express = require('express');
const router = express.Router();
const facturaCarteraCtrl = require('../controllers/facturaCartera.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// El auxiliar solo puede crear; editar/anular queda para roles de gestión
const ROLES_GESTION = ['administrador', 'contador', 'analista'];

router.use(auth);

router.post('/', facturaCarteraCtrl.createFacturaCartera);
router.get('/', facturaCarteraCtrl.getFacturasCartera);
router.post('/:id/pagos', facturaCarteraCtrl.registrarPago);
router.get('/:id', facturaCarteraCtrl.getFacturaCartera);
router.put('/:id', role(...ROLES_GESTION), facturaCarteraCtrl.updateFacturaCartera);
router.delete('/:id', role(...ROLES_GESTION), facturaCarteraCtrl.deleteFacturaCartera);

module.exports = router;

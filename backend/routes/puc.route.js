const express = require('express');
const router = express.Router();
const pucCtrl = require('../controllers/puc.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', pucCtrl.getPucs);
router.get('/:id', pucCtrl.getPuc);
router.post('/', role('administrador', 'contador'), pucCtrl.createPuc);
router.put('/:id', role('administrador', 'contador'), pucCtrl.updatePuc);
router.delete('/:id', role('administrador', 'contador'), pucCtrl.deletePuc);

module.exports = router;

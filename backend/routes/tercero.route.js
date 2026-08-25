const express = require('express');
const router = express.Router();
const terceroCtrl = require('../controllers/tercero.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.get('/', terceroCtrl.getTerceros);
router.get('/:id', terceroCtrl.getTercero);
router.post('/', terceroCtrl.createTercero);
router.put('/:id', role(['administrador', 'contador']), terceroCtrl.updateTercero);
router.delete('/:id', role(['administrador', 'contador']), terceroCtrl.deleteTercero);

module.exports = router;

const express = require('express');
const router = express.Router();
const roleCtrl = require('../controllers/role.controller');

router.post('/', roleCtrl.createRole);
router.get('/', roleCtrl.getRoles);

module.exports = router;
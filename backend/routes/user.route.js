const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const userCtrl = require('../controllers/user.controller');

// Protege todas las rutas bajo /users solo para admin
router.use(auth, role(['admin']));

router.post('/', userCtrl.createUser);
router.get('/', userCtrl.getUsers);
router.get('/:id', userCtrl.getUser);
router.put('/:id', userCtrl.updateUser);
router.put('/:id/approve', userCtrl.approveUser);
router.put('/:id/reject', userCtrl.rejectUser);
router.delete('/:id', userCtrl.deleteUser);

module.exports = router;
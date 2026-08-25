const express = require('express');
const router = express.Router();
const aprobacionesCtrl = require('../controllers/aprobaciones.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

// Todas las rutas requieren autenticación y rol de administrador
router.use(auth);
router.use(role('administrador'));

// Obtener usuarios pendientes de aprobación
router.get('/pendientes', aprobacionesCtrl.getPendientes);

// Obtener historial de usuarios aprobados
router.get('/historial', aprobacionesCtrl.getHistorial);

// Obtener estadísticas
router.get('/estadisticas', aprobacionesCtrl.getEstadisticas);

// Aprobar un usuario específico
router.put('/:id/aprobar', aprobacionesCtrl.aprobarUsuario);

// Rechazar un usuario específico
router.put('/:id/rechazar', aprobacionesCtrl.rechazarUsuario);

// Aprobar múltiples usuarios
router.post('/batch/aprobar', aprobacionesCtrl.aprobarMultiples);

module.exports = router;

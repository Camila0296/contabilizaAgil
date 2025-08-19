/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Gestión de roles de usuario
 * 
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID del rol
 *         name:
 *           type: string
 *           description: Nombre del rol
 *       example:
 *         name: admin
 */

const express = require('express');
const router = express.Router();
const roleCtrl = require('../controllers/role.controller');
const auth = require('../middleware/auth');
const role = require('../middleware/role');

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Crear un nuevo rol (solo admin)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nombre del rol a crear
 *             example:
 *               name: editor
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
router.post('/', auth, role(['admin']), roleCtrl.createRole);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Obtener todos los roles (solo admin)
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
router.get('/', auth, role(['admin']), roleCtrl.getRoles);

module.exports = router;
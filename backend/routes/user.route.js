/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios del sistema
 * 
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del usuario
 *         nombres:
 *           type: string
 *         apellidos:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *         activo:
 *           type: boolean
 *         approved:
 *           type: boolean
 *       example:
 *         nombres: Juan
 *         apellidos: Pérez
 *         email: juan@ejemplo.com
 *         role: 60f6c0c1e3e4a23ab4b5c678
 *         activo: true
 *         approved: true
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const userCtrl = require('../controllers/user.controller');

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Obtener perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', auth, userCtrl.getMe);
/**
 * @swagger
 * /users/me:
 *   put:
 *     summary: Actualizar perfil del usuario actual
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *                 description: Requerida cuando se envía password
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado correctamente
 */
router.put('/me', auth, userCtrl.updateMe);
/**
 * @swagger
 * /users/me/documento:
 *   put:
 *     summary: Cargar o reemplazar el documento de identidad del usuario autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipo
 *               - datos
 *             properties:
 *               tipo:
 *                 type: string
 *                 description: image/jpeg, image/png o application/pdf
 *               datos:
 *                 type: string
 *                 description: Contenido del archivo en base64
 *     responses:
 *       200:
 *         description: Documento cargado correctamente
 */
router.put('/me/documento', auth, userCtrl.uploadMyDocumento);

// Protege todas las rutas bajo /users solo para administrador
router.use(auth, role('administrador'));

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crear un nuevo usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - email
 *               - role
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/', auth, role('administrador'), userCtrl.createUser);
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: approved
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filtrar por estado de aprobación
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, apellido o email
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/', auth, role('administrador'), userCtrl.getUsers);
/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Obtener un usuario por ID (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Detalles del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/:id', auth, role('administrador'), userCtrl.getUser);
/**
 * @swagger
 * /users/{id}/documento:
 *   get:
 *     summary: Obtener el documento de identidad cargado por un usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Documento de identidad del usuario
 *       404:
 *         description: El usuario no ha cargado un documento
 */
router.get('/:id/documento', auth, role('administrador'), userCtrl.getUserDocumento);
/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar un usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', auth, role('administrador'), userCtrl.updateUser);
/**
 * @swagger
 * /users/{id}/approve:
 *   put:
 *     summary: Aprobar un usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a aprobar
 *     responses:
 *       200:
 *         description: Usuario aprobado exitosamente
 */
router.put('/:id/approve', auth, role('administrador'), userCtrl.approveUser);
/**
 * @swagger
 * /users/{id}/reject:
 *   delete:
 *     summary: Rechazar una solicitud de registro pendiente (elimina al usuario permanentemente, solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a rechazar
 *     responses:
 *       200:
 *         description: Usuario rechazado y eliminado exitosamente
 *       400:
 *         description: La cuenta ya fue aprobada y no puede rechazarse así
 */
router.delete('/:id/reject', auth, role('administrador'), userCtrl.rejectUser);
/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar un usuario (solo admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 */
router.delete('/:id', auth, role('administrador'), userCtrl.deleteUser);

module.exports = router;
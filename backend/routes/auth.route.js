/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Endpoints de autenticación
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
 *       example:
 *         id: 60f6c0c1e3e4a23ab4b5c678
 *         nombres: Juan
 *         apellidos: Pérez
 *         email: juan@example.com
 *         role: user
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           example: juan@example.com
 *         password:
 *           type: string
 *           example: secret123
 *     RegisterRequest:
 *       allOf:
 *         - $ref: '#/components/schemas/LoginRequest'
 *         - type: object
 *           required:
 *             - nombres
 *             - apellidos
 *           properties:
 *             nombres:
 *               type: string
 *               example: Juan
 *             apellidos:
 *               type: string
 *               example: Pérez
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Datos inválidos
 *
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso con token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Credenciales inválidas
 */

const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

router.post('/register', authCtrl.register);
router.post('/login', authCtrl.login);

module.exports = router;
/**
 * @swagger
 * tags:
 *   name: Facturas
 *   description: Gestión de facturas
 *
 * components:
 *   schemas:
 *     Factura:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         numero:
 *           type: string
 *         fecha:
 *           type: string
 *           format: date
 *         proveedor:
 *           type: string
 *         monto:
 *           type: number
 *         puc:
 *           type: string
 *         detalle:
 *           type: string
 *         naturaleza:
 *           type: string
 *           enum: [credito, debito]
 *       example:
 *         numero: F001
 *         fecha: 2025-06-20
 *         proveedor: ACME SAS
 *         monto: 100000
 *         puc: 413505
 *         detalle: Compra de equipos
 *         naturaleza: debito
 */

/**
 * @swagger
 * /facturas:
 *   get:
 *     summary: Listar todas las facturas
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de facturas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Factura'
 *
 *   post:
 *     summary: Crear una factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Factura'
 *     responses:
 *       200:
 *         description: Factura creada
 *
 * /facturas/{id}:
 *   get:
 *     summary: Obtener una factura por ID
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID de la factura
 *     responses:
 *       200:
 *         description: Datos de la factura
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Factura'
 *   put:
 *     summary: Actualizar una factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Factura'
 *     responses:
 *       200:
 *         description: Factura actualizada
 *   delete:
 *     summary: Eliminar una factura
 *     tags: [Facturas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Factura eliminada
 */

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const facturaCtrl = require('../controllers/factura.controller');

router.use(auth);

router.get('/', facturaCtrl.getFacturas);
router.get('/reportes', facturaCtrl.getReportes);
router.get('/:id', facturaCtrl.getFactura);
router.post('/', facturaCtrl.createFactura);
router.put('/:id', facturaCtrl.updateFactura);
router.delete('/:id', facturaCtrl.deleteFactura);

module.exports = router;
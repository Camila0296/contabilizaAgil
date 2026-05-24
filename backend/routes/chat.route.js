const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, healthCheck } = require('../controllers/chat.controller');

router.get('/health', healthCheck);
router.post('/message', auth, sendMessage);

module.exports = router;

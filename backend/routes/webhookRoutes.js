const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// WhatsApp Webhook
router.get('/whatsapp', webhookController.verifyWhatsApp);
router.post('/whatsapp', webhookController.handleWhatsAppMessage);

// Exotel Webhook
router.post('/exotel', webhookController.handleExotelCall);
router.get('/exotel', webhookController.handleExotelCall);

module.exports = router;

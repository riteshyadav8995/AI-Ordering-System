const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/analytics', protect, admin, orderController.getAnalytics);
router.get('/last-by-phone/:phone', protect, admin, orderController.getLastByPhone);
router.put('/missed-calls/:id/recover', protect, admin, orderController.recoverMissedCall);
router.get('/', protect, admin, orderController.getOrders);
router.get('/myorders', protect, orderController.getMyOrders);
router.put('/:id/status', protect, admin, orderController.updateStatus);
router.post('/:id/pay', protect, orderController.payOrder);
router.post('/', protect, orderController.placeOrder);

module.exports = router;

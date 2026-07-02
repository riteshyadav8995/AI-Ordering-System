const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', menuController.getMenu);
router.post('/', protect, admin, menuController.addMenuItem);
router.put('/:id', protect, admin, menuController.updateMenuItem);
router.delete('/:id', protect, admin, menuController.deleteMenuItem);

module.exports = router;

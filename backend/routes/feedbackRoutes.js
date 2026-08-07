const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// Submit feedback (public route)
router.post('/', feedbackController.submitFeedback);

// Get all feedbacks (admin route - keeping it open for now or add auth middleware later if needed)
router.get('/', feedbackController.getFeedbacks);

module.exports = router;

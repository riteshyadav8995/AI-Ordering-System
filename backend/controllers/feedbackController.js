const Feedback = require('../models/Feedback');
const Order = require('../models/Order');

// Submit Feedback
const submitFeedback = async (req, res) => {
  try {
    const { orderId, rating, comments } = req.body;
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create Feedback
    const feedback = new Feedback({
      orderId,
      customerName: order.customerName || 'Guest',
      rating,
      comments
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ message: 'Error submitting feedback', error: err.message });
  }
};

// Get all feedbacks for admin
const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).populate('orderId', 'totalAmount items');
    res.json(feedbacks);
  } catch (err) {
    console.error('Error fetching feedbacks:', err);
    res.status(500).json({ message: 'Error fetching feedbacks', error: err.message });
  }
};

module.exports = {
  submitFeedback,
  getFeedbacks
};

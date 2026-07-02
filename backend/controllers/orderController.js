const orderService = require('../services/orderService');

exports.getOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching my orders', error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
    
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    
    // Notify all connected clients about the order update
    req.io.emit('orderUpdated', updatedOrder);
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
};

exports.payOrder = async (req, res) => {
  try {
    // In a real scenario, you'd verify a Razorpay signature here.
    const updatedOrder = await orderService.updateOrderPayment(req.params.id, 'Paid');
    
    if (!updatedOrder) return res.status(404).json({ message: 'Order not found' });
    
    // Emit event to update dashboard immediately
    req.io.emit('orderUpdated', updatedOrder);
    
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error processing payment', error: error.message });
  }
};

exports.placeOrder = async (req, res) => {
  try {
    const savedOrder = await orderService.createOrder(req.body);
    
    // Notify Admin Dashboard immediately via Socket.io
    req.io.emit('newOrder', savedOrder);
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
};

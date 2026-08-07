const orderService = require('../services/orderService');
const { sendEmail } = require('../services/emailService');
const User = require('../models/User');

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

    // Send email to customer if order is completed
    if (status === 'Completed' && updatedOrder.user) {
      const customer = await User.findById(updatedOrder.user);
      if (customer && customer.email) {
        const itemsList = updatedOrder.items.map(i => `<li>${i.quantity}x ${i.name} - ₹${i.price}</li>`).join('');
        await sendEmail({
          toEmail: customer.email,
          toName: customer.firstName,
          subject: 'Your Neon Bite Order is Delivered!',
          htmlContent: `
            <h2>Enjoy your meal, ${customer.firstName}!</h2>
            <p>Your order (<strong>#${updatedOrder._id.toString().slice(-6).toUpperCase()}</strong>) has been marked as Completed and Delivered.</p>
            <h3>Order Summary:</h3>
            <ul>${itemsList}</ul>
            <p><strong>Total Paid:</strong> ₹${updatedOrder.totalAmount}</p>
            <br/>
            <p>We'd love to hear about your experience!</p>
            <a href="https://ai-ordering-system.onrender.com/feedback/${updatedOrder._id}" style="display:inline-block;padding:10px 20px;background-color:#06b6d4;color:white;text-decoration:none;border-radius:5px;font-weight:bold;">Leave Feedback</a>
            <br/><br/>
            <p>Thank you for choosing Neon Bite!</p>
          `
        });
      }
    }
    
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
    req.io.emit('newOrder', savedOrder);

    // Send email to admin
    const itemsList = savedOrder.items.map(i => `<li>${i.quantity}x ${i.name}</li>`).join('');
    await sendEmail({
      toEmail: 'rk5061288@gmail.com',
      toName: 'Admin',
      subject: `New Order Received - #${savedOrder._id.toString().slice(-6).toUpperCase()}`,
      htmlContent: `
        <h2>New Order Alert</h2>
        <p><strong>Customer:</strong> ${savedOrder.customerName || 'Guest'}</p>
        <p><strong>Total:</strong> ₹${savedOrder.totalAmount}</p>
        <p><strong>Channel:</strong> ${savedOrder.channel || 'web'}</p>
        <h3>Items:</h3>
        <ul>${itemsList}</ul>
        <p>Log in to the Admin Dashboard to view and manage this order.</p>
      `
    });

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const data = await orderService.getAnalytics();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching analytics', error: error.message });
  }
};

exports.getLastByPhone = async (req, res) => {
  try {
    const order = await orderService.getLastOrderByPhone(req.params.phone);
    if (!order) return res.status(404).json({ message: 'No previous order found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error: error.message });
  }
};

exports.recoverMissedCall = async (req, res) => {
  try {
    const MissedCall = require('../models/MissedCall');
    const mc = await MissedCall.findByIdAndUpdate(
      req.params.id,
      { recovered: true, recoveredAt: new Date() },
      { new: true }
    );
    if (!mc) return res.status(404).json({ message: 'Missed call not found' });
    res.json(mc);
  } catch (error) {
    res.status(500).json({ message: 'Error recovering call', error: error.message });
  }
};

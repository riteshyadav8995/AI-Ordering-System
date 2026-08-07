const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

exports.getAllOrders = async () => {
  return await Order.find().sort({ createdAt: -1 });
};

exports.getOrdersByUser = async (userId) => {
  return await Order.find({ user: userId }).sort({ createdAt: -1 });
};

exports.updateOrderStatus = async (id, status) => {
  const timestampField = `statusTimestamps.${status.toLowerCase()}`;
  return await Order.findByIdAndUpdate(id, { 
    $set: { 
      status,
      [timestampField]: new Date()
    } 
  }, { new: true });
};

exports.updateOrderPayment = async (id, paymentStatus) => {
  // We can also change the overall status if we want, but for now just paymentStatus
  return await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
};

exports.createOrder = async (orderData) => {
  if (orderData.items && orderData.items.length > 0) {
    for (let item of orderData.items) {
      if (!item.menuItem) {
        let menuItemDoc = await MenuItem.findOne({ name: new RegExp('^' + item.name + '$', 'i') });
        
        if (!menuItemDoc) {
           // Fallback: Check if the AI included size/customizations in the name (e.g. "Medium Paneer Tikka Pizza")
           const allItems = await MenuItem.find();
           menuItemDoc = allItems.find(dbItem => 
              item.name.toLowerCase().includes(dbItem.name.toLowerCase()) || 
              dbItem.name.toLowerCase().includes(item.name.toLowerCase())
           );
        }

        if (menuItemDoc) {
          item.menuItem = menuItemDoc._id;
          item.price = item.price || menuItemDoc.price;
          item.name = menuItemDoc.name; // Normalize the name for the order record
        } else {
           throw new Error(`Menu item '${item.name}' not found in database.`);
        }
      }
    }
  }

  const newOrder = new Order({
    ...orderData,
    statusTimestamps: {
      pending: new Date()
    }
  });
  return await newOrder.save();
};

// ── Repeat order shortcut ──────────────────────────────────────────
exports.getLastOrderByPhone = async (phone) => {
  return await Order.findOne({ phoneNumber: phone }).sort({ createdAt: -1 });
};

// ── Analytics ─────────────────────────────────────────────────────
exports.getAnalytics = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last7Start = new Date(todayStart);
  last7Start.setDate(last7Start.getDate() - 6);

  const todayOrders = await Order.find({ createdAt: { $gte: todayStart } });
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const daily = await Order.aggregate([
    { $match: { createdAt: { $gte: last7Start } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$totalAmount' }
    }},
    { $sort: { _id: 1 } }
  ]);

  const channelBreakdown = await Order.aggregate([
    { $group: { _id: { $ifNull: ['$channel', 'web'] }, count: { $sum: 1 } } }
  ]);

  const topItems = await Order.aggregate([
    { $unwind: '$items' },
    { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' } } },
    { $sort: { totalQty: -1 } },
    { $limit: 5 }
  ]);

  let missedCallsToday = 0;
  let missedCallsPending = 0;
  try {
    const MissedCall = require('../models/MissedCall');
    missedCallsToday = await MissedCall.countDocuments({ createdAt: { $gte: todayStart } });
    missedCallsPending = await MissedCall.countDocuments({ recovered: false });
  } catch (e) { /* model may not exist yet */ }

  return {
    today: { orders: todayOrders.length, revenue: todayRevenue },
    totalOrders: await Order.countDocuments(),
    dailyTrend: daily,
    channelBreakdown,
    topItems,
    missedCalls: { today: missedCallsToday, pendingRecovery: missedCallsPending }
  };
};

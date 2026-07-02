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

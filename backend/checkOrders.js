require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
    console.log("Recent Orders in DB:");
    orders.forEach(o => {
      console.log(`- ${o._id}: ${o.status}, Items: ${o.items.map(i => i.name).join(', ')}`);
    });
    mongoose.disconnect();
  });

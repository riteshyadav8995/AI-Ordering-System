const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const priceMap = {
  'Classic Burger': 149,
  'Margherita Pizza': 249,
  'Paneer Tikka Pizza': 299,
  'Farmhouse Pizza': 279,
  'Caesar Salad': 199,
  'French Fries': 99,
  'Coca Cola': 59
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to DB, updating prices to INR...");
  
  const items = await MenuItem.find();
  for (const item of items) {
    if (priceMap[item.name]) {
      item.price = priceMap[item.name];
      await item.save();
      console.log(`Updated ${item.name} to ₹${item.price}`);
    }
  }
  
  console.log("Migration complete!");
  process.exit(0);
});

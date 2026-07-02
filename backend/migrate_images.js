const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');
require('dotenv').config();

const imageMap = {
  'Classic Burger': '/images/burger.png',
  'Margherita Pizza': '/images/margherita.png',
  'Paneer Tikka Pizza': '/images/paneer_tikka.png',
  'Farmhouse Pizza': '/images/farmhouse.png',
  'Caesar Salad': '/images/salad.png',
  'French Fries': '/images/fries.png',
  'Coca Cola': '/images/coke.png'
};

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log("Connected to DB, starting migration...");
  
  const items = await MenuItem.find();
  for (const item of items) {
    if (imageMap[item.name]) {
      item.image = imageMap[item.name];
      await item.save();
      console.log(`Updated ${item.name} with image ${item.image}`);
    }
  }
  
  console.log("Migration complete!");
  process.exit(0);
});

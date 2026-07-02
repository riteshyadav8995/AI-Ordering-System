const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  customizations: [{
    name: String, // e.g., "Size", "Add-ons", "Remove"
    options: [String] // e.g., ["Small", "Medium", "Large"] or ["Extra Cheese", "Bacon"]
  }],
  image: {
    type: String,
    default: '/images/default.jpg'
  },
  available: { type: Boolean, default: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);

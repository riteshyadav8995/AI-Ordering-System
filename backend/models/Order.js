const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  name: { type: String, required: true }, // Store name at time of order
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true }, // Store price at time of order
  customizations: [String], // e.g., ["Extra Cheese", "No Onions"]
  notes: { type: String }
});

const orderSchema = new mongoose.Schema({
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'credit_card', 'debit_card'],
    default: 'cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid'],
    default: 'Pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerName: { type: String, default: 'Guest' }, // Or inferred from voice
  phoneNumber: { type: String }, // For WhatsApp or Exotel calls
  deliveryAddress: { type: String },
  isDelivery: { type: Boolean, default: false },
  handoffRequested: { type: Boolean, default: false },
  channel: { 
    type: String, 
    enum: ['web', 'voice', 'whatsapp'], 
    default: 'web' 
  },
  paymentLink: { type: String }, // URL for WhatsApp payments
  statusTimestamps: {
    pending: { type: Date, default: Date.now },
    preparing: { type: Date },
    ready: { type: Date },
    completed: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);

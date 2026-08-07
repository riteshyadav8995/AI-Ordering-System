const mongoose = require('mongoose');

const missedCallSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  callSid: { type: String },
  recovered: { type: Boolean, default: false },
  recoveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MissedCall', missedCallSchema);

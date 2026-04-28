const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    url:  { type: String, required: true, trim: true },
    interval: { type: Number, default: 5 }, // minutes
    active: { type: Boolean, default: true },
    currentStatus: {
      type: String,
      enum: ['up', 'down', 'pending'],
      default: 'pending',
    },
    lastChecked: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Monitor', monitorSchema);

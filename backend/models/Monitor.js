const mongoose = require('mongoose');

const monitorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

// Fast per-user queries
monitorSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Monitor', monitorSchema);
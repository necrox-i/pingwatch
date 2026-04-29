const mongoose = require('mongoose');

const statusLogSchema = new mongoose.Schema({
  monitorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Monitor', required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status:       { type: String, enum: ['up', 'down'], required: true },
  responseTime: { type: Number, default: null }, // ms
  statusCode:   { type: Number, default: null },
  error:        { type: String, default: null },
  checkedAt:    { type: Date, default: Date.now },
});

statusLogSchema.index({ monitorId: 1, checkedAt: -1 });
statusLogSchema.index({ userId: 1, checkedAt: -1 });
statusLogSchema.index(
  { checkedAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 } // 7-day TTL
);

module.exports = mongoose.model('StatusLog', statusLogSchema);
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
}, { timestamps: true });

// Index to quickly find feedbacks by shop
feedbackSchema.index({ shop: 1, createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);

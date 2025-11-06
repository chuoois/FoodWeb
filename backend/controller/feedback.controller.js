const mongoose = require('mongoose');
const Feedback = require('../models/feedback.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const Shop = require('../models/shop.model');

// Create feedback for an order (only by the order's customer and after delivery)
const createFeedback = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rating, comment } = req.body;
    const accountId = req.user.accountId;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findById(orderId).lean();
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Get user object id from User collection
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only the customer who placed the order can leave feedback
    if (order.customer_id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'You are not allowed to feedback this order' });
    }

    // Only allow feedback when order is DELIVERED
    if (order.status !== 'DELIVERED') {
      return res.status(400).json({ message: 'Can only leave feedback for delivered orders' });
    }

    // Check existing feedback for this order
    const existing = await Feedback.findOne({ order_id: order._id });
    if (existing) return res.status(400).json({ message: 'Feedback already exists for this order' });

    // Create feedback
    const feedback = await Feedback.create({
      order_id: order._id,
      user: user._id,
      shop: order.shop_id,
      rating,
      comment: comment || '',
    });

    // Also append to shop.reviews array and update average rating
    try {
      await Shop.findByIdAndUpdate(order.shop_id, {
        $push: { reviews: { user: user._id, rating, comment } }
      });

      // Recalculate avg rating
      const shop = await Shop.findById(order.shop_id).lean();
      if (shop) {
        const ratings = (shop.reviews || []).map(r => r.rating || 0);
        const avg = ratings.length ? (ratings.reduce((a,b) => a + b, 0) / ratings.length) : 0;
        await Shop.findByIdAndUpdate(order.shop_id, { rating: avg });
      }
    } catch (err) {
      // non-fatal: if updating shop fails, continue but log
      console.error('Error updating shop reviews:', err.message);
    }

    return res.status(201).json({ message: 'Feedback created', feedback });
  } catch (error) {
    console.error('createFeedback error:', error);
    return res.status(500).json({ message: error.message });
  }
};

const getFeedbacksByShop = async (req, res) => {
  try {
    const { shopId } = req.params;               // <-- string từ URL
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // 1. Chuyển string → ObjectId (nếu không hợp lệ sẽ ném lỗi)
    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    // 2. Parallel: danh sách, total, average
    const [feedbacks, total, avgResult] = await Promise.all([
      Feedback.find({ shop: shopObjectId })
        .populate('user', 'full_name avatar_url')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),

      Feedback.countDocuments({ shop: shopObjectId }),

      Feedback.aggregate([
        { $match: { shop: shopObjectId } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' }
          }
        }
      ])
    ]);

    // 3. Làm tròn xuống
    const averageRating = avgResult[0]?.avgRating;
    const flooredRating = averageRating ? Math.floor(averageRating) : 0;

    // 4. Response
    return res.json({
      feedbacks,
      total,
      averageRating: flooredRating,
      page: Number(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('getFeedbacksByShop error:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { createFeedback, getFeedbacksByShop };

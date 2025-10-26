// models/orderDetail.model.js
const mongoose = require("mongoose");

const orderDetailSchema = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    food_id: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true },

    // Snapshot thông tin món ăn tại thời điểm đặt
    food_name: { type: String, required: true },
    food_image_url: { type: String },
    food_size: { type: String },

    // Giá và số lượng
    unit_price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    discount_percent: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },

    // Ghi chú món ăn
    note: { type: String },
  },
  { timestamps: true }
);

// Index phục vụ truy vấn nhanh
orderDetailSchema.index({ order_id: 1 });
orderDetailSchema.index({ food_id: 1 });

module.exports = mongoose.model("OrderDetail", orderDetailSchema);

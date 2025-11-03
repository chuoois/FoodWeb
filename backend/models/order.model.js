// models/order.model.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_code: { type: String, unique: true, required: true },

    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shop_id: { type: mongoose.Schema.Types.ObjectId, ref: "Shop", required: true },

    delivery_address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserAddress",
      required: true,
    },

    // Giá trị đơn hàng
    subtotal: { type: Number, required: true },
    discount_amount: { type: Number, default: 0 },
    shipping_fee: { type: Number, default: 0 },
    total_amount: { type: Number, required: true },

    // Voucher áp dụng (nếu có)
    voucher_id: { type: mongoose.Schema.Types.ObjectId, ref: "Voucher" },

    // Trạng thái đơn hàng
    status: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "PENDING",
        "CONFIRMED",
        "PREPARING",
        "SHIPPING",
        "DELIVERED",
        "CANCELLED",
        "REFUNDED",
      ],
      default: "PENDING_PAYMENT",
    },

    // Thanh toán
    payment_method: {
      type: String,
      enum: ["COD", "PAYOS"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["UNPAID", "PAID", "REFUNDED", "COD_PENDING", "CANCELLED"],
      default: "UNPAID",
    },
    paid_at: { type: Date },

    // Ghi chú
    note: { type: String },
    cancel_reason: { type: String },
    cancelled_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // Thời gian giao hàng
    estimated_delivery_time: { type: Date },
    actual_delivery_time: { type: Date },
  },
  { timestamps: true }
);



module.exports = mongoose.model("Order", orderSchema);

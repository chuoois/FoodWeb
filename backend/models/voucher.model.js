const mongoose = require("mongoose");

const voucherSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    discount_type: {
      type: String,
      required: true,
      enum: ["PERCENT", "FIXED"], // % hoặc số tiền
    },
    discount_value: {
      type: mongoose.Decimal128,
      required: true,
      get: v => parseFloat(v.toString()),
    },
    min_order_amount: {
      type: mongoose.Decimal128,
      default: 0,
      get: v => parseFloat(v.toString()),
    },
    max_discount: {
      type: mongoose.Decimal128,
      get: v => (v ? parseFloat(v.toString()) : null),
    },
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
    usage_limit: {
      type: Number,
      default: 0, // 0 = không giới hạn
    },
    used_count: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: { getters: true },
  }
);

// Tạo index phục vụ tìm kiếm nhanh
voucherSchema.index({ code: 1 });
voucherSchema.index({ is_active: 1 });
voucherSchema.index({ start_date: 1, end_date: 1 });

const Voucher = mongoose.model("Voucher", voucherSchema);
module.exports = Voucher;

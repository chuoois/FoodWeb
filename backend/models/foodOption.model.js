const mongoose = require("mongoose");

const foodOptionSchema = new mongoose.Schema(
  {
    food_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["SIZE", "TOPPING", "EXTRA", "SPICY"], // đảm bảo đúng 4 loại option
    },
    name: {
      type: String,
      required: true,
      trim: true, // tránh lỗi trùng do khoảng trắng
    },
    price: {
      type: Number,
      default: 0, // giá cộng thêm cho option
    },
    is_available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// 🔍 Mỗi món ăn (food_id) không thể có 2 option trùng tên
foodOptionSchema.index({ food_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("FoodOption", foodOptionSchema);

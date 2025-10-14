// models/foodCategory.model.js
const mongoose = require("mongoose");

const foodCategorySchema = new mongoose.Schema({
  shop_id: { // Liên kết danh mục với một cửa hàng cụ thể
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  name: { // Ví dụ: "Món chính", "Trà sữa", "Đồ ăn vặt"
    type: String,
    required: true,
    trim: true,
  },
  description: String,
}, { timestamps: true });

// Đảm bảo mỗi cửa hàng không có 2 danh mục trùng tên
foodCategorySchema.index({ shop_id: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("FoodCategory", foodCategorySchema);
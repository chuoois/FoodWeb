const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["SIZE", "TOPPING", "EXTRA", "SPICY"],
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      default: 0
    },
  },
  {
    _id: false
  }
);

const foodSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FoodCategory",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0, // % giảm giá
    },
    image_url: {
      type: String,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    // 👇 Nhúng mảng các options trực tiếp vào món ăn
    options: [optionSchema],
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // MANAGER_STAFF tạo
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

//  Unique index: mỗi cửa hàng không được có 2 món trùng tên
foodSchema.index({ shop_id: 1, name: 1 }, { unique: true });



module.exports = mongoose.model("Food", foodSchema);

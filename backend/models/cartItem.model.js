const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    food_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Food",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    note: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CHECKOUT", "REMOVED"],
      default: "ACTIVE",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index phục vụ truy vấn nhanh và đảm bảo tính duy nhất
cartItemSchema.index(
  { user_id: 1, shop_id: 1, food_id: 1, status: 1 },
  { unique: true }
);

module.exports = mongoose.model("CartItem", cartItemSchema, "cartitems");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
);

const shopSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      ward: { type: String, trim: true },
      district: { type: String, trim: true },
      city: { type: String, trim: true },
      province: { type: String, trim: true },
    },
    gps: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true },
    },
    phone: { type: String, unique: true, required: true, trim: true },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE", "BANNED", "PENDING_APPROVAL"],
      default: "PENDING_APPROVAL",
      index: true,
    },
    statusReason: {
      type: String,
      default: null,
      trim: true,
    },
    logoUrl: { type: String, trim: true },
    coverUrl: { type: String, trim: true },
    type: { type: String, enum: ["Food", "Drink"], required: false },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reviews: [reviewSchema],
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

shopSchema.index({ gps: "2dsphere" });

module.exports = mongoose.model("Shop", shopSchema);
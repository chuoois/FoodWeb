  // models/UserAddress.js
  import mongoose from "mongoose";

  const userAddressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: {
      street: String,
      ward: String,
      district: String,
      city: String,
      province: String
    },
    gps: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true } // [lng, lat]
    },
    isDefault: { type: Boolean, default: false }
  }, { timestamps: true });

  // index geospatial
  userAddressSchema.index({ gps: "2dsphere" });

  export default mongoose.model("UserAddress", userAddressSchema);

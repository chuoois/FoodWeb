const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
    account_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Account",
        required: true,
        unique: true,
    },
    full_name: {
        type: String,
        sparse: true,
    },
    phone: {
        type: String
    },
    avatar_url: {
        type: String,
    },
    date_of_birth: {
        type: Date,
    },
    gender: {
        type: String,
        enum: ["MALE", "FEMALE", "OTHER"],
    },
    hire_date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"],
        default: "ACTIVE",
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
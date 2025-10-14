// controllers/shop.controller.js
const Shop = require("../../models/shop.model");

const createShop = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      gps, // { coordinates: [lng, lat] }
      phone,
      logoUrl,
      coverUrl
    } = req.body;

    // Lấy owner từ token
    const owner = req.user.accountId;

    if (!gps || !gps.coordinates || gps.coordinates.length !== 2) {
      return res.status(400).json({ message: "GPS coordinates are required [lng, lat]" });
    }

    const newShop = new Shop({
      owner,
      name,
      description,
      address,
      gps: { type: "Point", coordinates: gps.coordinates },
      phone,
      logoUrl,
      coverUrl
    });

    const savedShop = await newShop.save();
    return res.status(201).json(savedShop);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createShop };
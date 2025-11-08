// routes/profile.routes.js
const express = require("express");
const router = express.Router();
const { getProfile, updateProfile } = require("../controller/updateProfile.controller");
const { getAddresses, createAddress, updateAddress, deleteAddress } = require("../controller/updateProfile.controller");
const authenticate = require('../middleware/authenticate.middleware');

router.get("/auth/profile", authenticate, getProfile);
router.patch("/auth/profile", authenticate, updateProfile);

// === ADDRESS ===
router.get("/auth/addresses", authenticate, getAddresses);
router.post("/auth/addresses", authenticate, createAddress);
router.patch("/auth/addresses/:addrId", authenticate, updateAddress);
router.delete("/auth/addresses/:addrId", authenticate, deleteAddress);

module.exports = router;
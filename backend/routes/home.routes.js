const express = require('express');
const router = express.Router();

const { getNearbyShopsByCoords,searchHome,getShopsByRate } = require('../controller/home.controller');

// Người dùng gửi lat/lng (login hoặc chưa login đều dùng được)
router.get("/home/nearby", getNearbyShopsByCoords);

router.get("/home/search", searchHome);
router.get("/home/popular", getShopsByRate);

module.exports = router;

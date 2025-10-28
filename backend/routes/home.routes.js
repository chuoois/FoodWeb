const express = require('express');
const router = express.Router();

const { getNearbyShopsByCoords,searchHome,getShopsByRate ,getShopsByType,getShopsById, getShopWithFoods,listCategoryByShopId} = require('../controller/home.controller');

// Người dùng gửi lat/lng (login hoặc chưa login đều dùng được)
router.get("/home/nearby", getNearbyShopsByCoords);
router.get("/home/filter", getShopsByType);
router.get("/home/search", searchHome);
router.get("/home/popular", getShopsByRate);
router.get("/home/shop/:shopId", getShopsById);
router.get("/home/shop/:id/foods", getShopWithFoods);
router.get("/home/shop/:shopId/categories", listCategoryByShopId);
module.exports = router;

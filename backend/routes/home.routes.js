const express = require('express');
const router = express.Router();

const { getNearbyShopsByCoords,searchShopsAndFoods,searchHome,getShopsByRate ,getShopsByType,getShopsById, getShopWithFoods,listCategoryByShopId,getRandomShops} = require('../controller/home.controller');

// Người dùng gửi lat/lng (login hoặc chưa login đều dùng được)
router.get("/home/nearby", getNearbyShopsByCoords);
router.get("/home/filter", getShopsByType);
router.get("/home/search", searchHome);
router.get("/home/popular", getShopsByRate);
router.get("/home/search-all", searchShopsAndFoods);
router.get("/home/shop/:shopId", getShopsById);
router.get("/home/shop/:id/foods", getShopWithFoods);
router.get("/home/shop/:shopId/categories", listCategoryByShopId);
router.get("/home/detail/random", getRandomShops);
module.exports = router;

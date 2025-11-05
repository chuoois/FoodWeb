const express = require('express');
const router = express.Router();
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");
const { getFavoriteShops,getNearbyShopsByCoords,searchShopsAndFoods,searchHome,getShopsByRate ,getShopsByType,getShopsById, getShopWithFoods,listCategoryByShopId,getRandomShops, addFavoriteShop, removeFavoriteShop} = require('../controller/home.controller');

// Người dùng gửi lat/lng (login hoặc chưa login đều dùng được)
router.get("/home/nearby", authenticate, authorize("CUSTOMER"), getNearbyShopsByCoords);
router.get("/home/filter", getShopsByType);
router.get("/home/search", searchHome);
router.get("/home/popular", authenticate, authorize("CUSTOMER"), getShopsByRate);
router.get("/home/search-all", searchShopsAndFoods);
router.get("/home/shop/:shopId", getShopsById);
router.get("/home/shop/:id/foods", getShopWithFoods);
router.get("/home/shop/:shopId/categories", listCategoryByShopId);
router.get("/home/detail/random", authenticate, authorize("CUSTOMER"), getRandomShops);

router.get("/home/favorite", authenticate, authorize("CUSTOMER"), getFavoriteShops);
router.post("/home/favorite/:shopId", authenticate, authorize("CUSTOMER"), addFavoriteShop);
router.delete("/home/favorite/:shopId", authenticate, authorize("CUSTOMER"), removeFavoriteShop);

module.exports = router;

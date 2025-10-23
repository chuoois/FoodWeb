const express = require('express');
const router = express.Router();

const {
    createFoodWithCategory,
    getFoodsByShop,
    getShopIdByManager
} = require('../controller/store/food.controller');
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

// Tạo món ăn cùng danh mục (nếu chưa có)
router.post('/food/create-with-category', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), createFoodWithCategory);

// Lấy shop ID theo manager
router.get('/food/shopId-by-manager', authenticate, authorize("MANAGER_STAFF"), getShopIdByManager);

// Lấy danh sách món ăn
router.get('/food/:shop_id/detail', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), getFoodsByShop);

module.exports = router;
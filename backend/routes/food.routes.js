const express = require('express');
const router = express.Router();

const {
    createFoodWithCategory,
    getFoodsByShop
} = require('../controller/store/food.controller');
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

// Tạo món ăn cùng danh mục (nếu chưa có)
router.post('/food/create-with-category', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), createFoodWithCategory);

// Lấy danh sách món ăn
router.get('/food/:shop_id', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), getFoodsByShop);

module.exports = router;

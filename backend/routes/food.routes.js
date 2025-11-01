const express = require('express');
const router = express.Router();

const {
    createFoodWithCategory,
    getFoodsByShop,
    updateFood,
    deleteFood,
    toggleFoodStatus
} = require('../controller/store/food.controller');
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

// Tạo món ăn cùng danh mục (nếu chưa có)
router.post('/food/create-with-category', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), createFoodWithCategory);

// Lấy danh sách món ăn
router.get('/food/all', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), getFoodsByShop);

// Cập nhật món ăn
router.put('/food/:foodId', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), updateFood);

// Xóa món ăn
router.delete('/food/:foodId', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), deleteFood);

// Bật/tắt trạng thái món ăn
router.patch('/food/:foodId/toggle-status', authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), toggleFoodStatus);

module.exports = router;
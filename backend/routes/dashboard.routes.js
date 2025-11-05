// routes/checkout.route.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");
const {
    getRevenueComparison,
    getOverview,
    getRevenueStats,
    getTopFoods,
    getShopsPerformance,
    getCustomerStats
} = require("../controller/store/dashboard.controller");

router.get("/dashboard/overview", authenticate, authorize("STORE_DIRECTOR"), getOverview);
router.get("/dashboard/revenue-comparison", authenticate, authorize("STORE_DIRECTOR"), getRevenueComparison);
router.get("/dashboard/revenue-stats", authenticate, authorize("STORE_DIRECTOR"), getRevenueStats);
router.get("/dashboard/top-foods", authenticate, authorize("STORE_DIRECTOR"), getTopFoods);
router.get("/dashboard/shops-performance", authenticate, authorize("STORE_DIRECTOR"), getShopsPerformance);
router.get("/dashboard/customer-stats", authenticate, authorize("STORE_DIRECTOR"), getCustomerStats);

module.exports = router;

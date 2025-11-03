const express = require("express");
const router = express.Router();

const {
  acceptOrder,
  getOrders,
  registerSSE,
  updateOrderStatus,
} = require("../controller/orderManager.controller");

const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

// SSE - realtime order updates
router.get("/ordersManage/sse", authenticate, authorize("MANAGER_STAFF"), registerSSE);

// Get orders list
router.get("/ordersManage", authenticate, authorize("MANAGER_STAFF"), getOrders);

// Accept order
router.patch("/ordersManage/:order_id/accept", authenticate, authorize("MANAGER_STAFF"), acceptOrder);

// Update order status
router.patch("/ordersManage/:order_id/status", authenticate, authorize("MANAGER_STAFF"), updateOrderStatus);

module.exports = router;

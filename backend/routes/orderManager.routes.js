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

router.get(
  "/ordersManage/sse",
  authenticate,
  authorize("MANAGER_STAFF"),
  registerSSE
);
router.get(
  "/ordersManage",
  authenticate,
  authorize("MANAGER_STAFF"),
  getOrders
);
router.put(
  "/ordersManage/:order_id/accept",
  authenticate,
  authorize("MANAGER_STAFF"),
  acceptOrder
);
router.put(
  "/ordersManage/:order_id/status",
  authenticate,
  authorize("MANAGER_STAFF"),
  updateOrderStatus
);

module.exports = router;

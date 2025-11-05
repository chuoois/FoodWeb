// routes/checkout.route.js
const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");
const {
  checkout,
  checkoutSuccess,
  checkoutCancel
} = require("../controller/checkout.controller");

// ✅ Tạo đơn hàng (COD hoặc PayOS)
router.post("/checkout", authenticate, authorize("CUSTOMER"), checkout);

// ✅ PayOS callback redirect
router.get("/checkout/success", checkoutSuccess);
router.get("/checkout/cancel", checkoutCancel);

module.exports = router;

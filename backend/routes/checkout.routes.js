const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");
const { checkout, checkoutSuccess, checkoutCancel } = require("../controller/checkout.controller");

// Gọi thanh toán
router.post("/checkout", authenticate, authorize("CUSTOMER"), checkout);

// PayOS redirect về
router.get("/checkout/success", checkoutSuccess);
router.get("/checkout/cancel", checkoutCancel);

module.exports = router;

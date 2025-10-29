const express = require("express");
const router = express.Router();
const {createOrder, getVouchers} = require('../controller/order.controller')
const authenticate = require('../middleware/authenticate.middleware')
const authorize = require('../middleware/authorize.middleware')

router.post("/orders", authenticate, authorize("CUSTOMER"), createOrder);

router.get("/vouchers", authenticate, authorize("CUSTOMER"), getVouchers);

module.exports = router;
 
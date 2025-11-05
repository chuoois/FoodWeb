const express = require("express");
const router = express.Router();
const {getVouchers, cancelOrder, getUserOrders, getOrderDetail} = require('../controller/order.controller')
const authenticate = require('../middleware/authenticate.middleware')
const authorize = require('../middleware/authorize.middleware')

// router.post("/orders", authenticate, authorize("CUSTOMER"), createOrder);

router.get("/orders", authenticate,authorize("CUSTOMER") , getUserOrders)

router.get("/orders/:id", authenticate, authorize("CUSTOMER"), getOrderDetail);

router.patch("/orders/:order_id/cancel",authenticate, authorize("CUSTOMER"),cancelOrder)

router.get("/vouchers", authenticate, authorize("CUSTOMER"), getVouchers);

module.exports = router;
 
const express = require("express");
const router = express.Router();
const {createOrder} = require('../controller/order.controller')
const authenticate = require('../middleware/authenticate.middleware')
const authorize = require('../middleware/authorize.middleware')

router.post("/orders", authenticate, authorize("CUSTOMER"), createOrder);

module.exports = router;
 
const express = require('express');
const router = express.Router();
const { createShop, getShopByOwerID } = require('../controller/store/shop.controller');
const authenticate = require('../middleware/authenticate.middleware')
const authorize = require('../middleware/authorize.middleware')

router.post('/shop/create', authenticate, authorize('STORE_DIRECTOR'), createShop);
router.get('/shop/get-by-owner', authenticate, authorize('STORE_DIRECTOR'), getShopByOwerID);

module.exports = router;
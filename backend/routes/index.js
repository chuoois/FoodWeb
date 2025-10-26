const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const homeRoutes = require('./home.routes');
const updateProfileRouters = require('./profile.routes');
const adminRouters = require('./admin.routes')
const shopRoutes = require('./shop.routes')
const foodRoutes = require('./food.routes');
const orderRouter = require('./order.routes');
const cartRoutes = require('./cart.routes');

router.use(homeRoutes);
router.use(authRoutes);
router.use(updateProfileRouters);
router.use(adminRouters);
router.use(shopRoutes);
router.use(foodRoutes);
router.use(orderRouter)
router.use(cartRoutes);

module.exports = router;
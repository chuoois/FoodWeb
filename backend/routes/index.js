const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const homeRoutes = require('./home.routes');
const updateProfileRouters = require('./profile.routes');
const adminRouters = require('./admin.routes')
const shopRoutes = require('./shop.routes')
const foodRoutes = require('./food.routes');

router.use(homeRoutes);
router.use(authRoutes);
router.use(updateProfileRouters);
router.use(adminRouters);
router.use(shopRoutes);
router.use(foodRoutes);

module.exports = router;
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');

const homeRoutes = require('./home.routes');

router.use(homeRoutes);
router.use(authRoutes);

const updateProfileRouters = require('./profile.routers');
const adminRouters = require('./admin.routers')

router.use(authRoutes,updateProfileRouters,adminRouters);


module.exports = router;
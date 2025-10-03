const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const updateProfileRouters = require('./profile.routers');
const adminRouters = require('./admin.routers')

router.use(authRoutes,updateProfileRouters,adminRouters);

module.exports = router;
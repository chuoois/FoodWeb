const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const updateProfileRouters = require('./profile.routers');

router.use(authRoutes,updateProfileRouters);

module.exports = router;
const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const homeRoutes = require('./home.routes');

router.use(homeRoutes);
router.use(authRoutes);

module.exports = router;
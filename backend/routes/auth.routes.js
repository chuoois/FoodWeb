const express = require('express');
const router = express.Router();
const { register, verifyOtp, registerGoogle } = require('../controller/auth.controller');

router.post('/auth/register', register);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/register/google', registerGoogle);

module.exports = router;
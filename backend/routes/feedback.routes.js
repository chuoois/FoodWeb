const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate.middleware');
const authorize = require('../middleware/authorize.middleware');
const { createFeedback, getFeedbacksByShop } = require('../controller/feedback.controller');

// POST feedback for an order (only customer who placed order and after delivery)
router.post('/orders/:orderId/feedback', authenticate, authorize('CUSTOMER'), createFeedback);

// GET feedbacks for a shop (public)
router.get('/shops/:shopId/feedbacks', getFeedbacksByShop);



module.exports = router;

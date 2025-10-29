const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");
const { addToCart, getCart, updateCartItem, removeCartItem } = require("../controller/cart.controller");

// Add item to cart (one active cart per shop per user)
router.post("/cart/add", authenticate, authorize("CUSTOMER"), addToCart);

// Get active cart
router.get("/cart", authenticate, authorize("CUSTOMER"), getCart);

// Update cart item (quantity / note)
router.post("/cart/item/:itemId", authenticate, authorize("CUSTOMER"), updateCartItem);

// Remove cart item
router.delete("/cart/item/:itemId", authenticate, authorize("CUSTOMER"), removeCartItem);

module.exports = router;

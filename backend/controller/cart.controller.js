const mongoose = require("mongoose");
const CartItem = require("../models/cartItem.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const Food = require("../models/food.model");

// Helper: get user._id from req.user.accountId
async function getUserObjectId(accountId) {
  const user = await User.findOne({ account_id: accountId });
  if (!user) throw new Error("User not found");
  return user._id;
}

const addToCart = async (req, res) => {
  try {
    const { shop_id, food_id, quantity = 1, note = "" } = req.body;
    const accountId = req.user.accountId;

    if (!shop_id || !food_id) {
      return res.status(400).json({ message: "Missing shop_id or food_id" });
    }

    if (quantity <= 0) return res.status(400).json({ message: "Quantity must be >= 1" });

    const user_id = await getUserObjectId(accountId);

    // Validate shop and food
    const shop = await Shop.findById(shop_id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const food = await Food.findById(food_id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    if (food.shop_id.toString() !== shop_id.toString()) {
      return res.status(400).json({ message: "Food does not belong to the specified shop" });
    }

    if (!food.is_available) {
      return res.status(400).json({ message: "Food is not available" });
    }

    // Check existing ACTIVE cart for this user
    const existingActive = await CartItem.find({ user_id, status: "ACTIVE" });
    if (existingActive.length > 0) {
      const existingShopId = existingActive[0].shop_id.toString();
      if (existingShopId !== shop_id.toString()) {
        return res.status(400).json({ message: "Cart contains items from another shop. Please clear or checkout before adding items from a different shop." });
      }
    }

    // If same food exists, update quantity
    const existingItem = await CartItem.findOne({ user_id, shop_id, food_id, status: "ACTIVE" });
    if (existingItem) {
      existingItem.quantity = existingItem.quantity + Number(quantity);
      if (note) existingItem.note = note;
      await existingItem.save();
      return res.status(200).json({ message: "Updated cart item", item: existingItem });
    }

    // Create new cart item
    const newItem = new CartItem({ user_id, shop_id, food_id, quantity, note, status: "ACTIVE" });
    await newItem.save();
    return res.status(201).json({ message: "Added to cart", item: newItem });
  } catch (error) {
    // handle duplicate key race (rare)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Cart item conflict, please retry" });
    }
    return res.status(500).json({ message: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const user_id = await getUserObjectId(accountId);

    let items = await CartItem.find({ user_id, status: "ACTIVE" })
      .populate("food_id")
      .populate("shop_id", "name");

    if (!items.length) return res.json({ shop: null, items: [] });

    // If some food is no longer available, mark as REMOVED
    const unavailableIds = [];
    const resultItems = [];
    for (const it of items) {
      const food = it.food_id;
      if (!food || !food.is_available) {
        // mark removed
        it.status = "REMOVED";
        await it.save();
        unavailableIds.push(it._id);
        continue;
      }

      const unit_price = food.price;
      const discount_percent = food.discount || 0;
      const subtotal = unit_price * it.quantity * (1 - discount_percent / 100);

      resultItems.push({
        id: it._id,
        food_id: food._id,
        name: food.name,
        image_url: food.image_url,
        unit_price,
        discount_percent,
        quantity: it.quantity,
        subtotal,
        note: it.note || "",
        is_available: true,
      });
    }

    // Return shop info based on first active (they must all be same shop by design)
    const shop = items[0] && items[0].shop_id ? items[0].shop_id : null;

    // Also return list of removed/unavailable item ids so frontend can notify
    return res.json({ shop, items: resultItems, removed_item_ids: unavailableIds });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, note } = req.body;
    const accountId = req.user.accountId;
    const user_id = await getUserObjectId(accountId);

    const item = await CartItem.findById(itemId).populate("food_id");
    if (!item || item.user_id.toString() !== user_id.toString()) return res.status(404).json({ message: "Cart item not found" });

    if (item.status !== "ACTIVE") return res.status(400).json({ message: "Cannot update non-active cart item" });

    // Check food availability
    if (!item.food_id || !item.food_id.is_available) {
      item.status = "REMOVED";
      await item.save();
      return res.status(400).json({ message: "Food is no longer available and has been removed from cart" });
    }

    if (quantity !== undefined) {
      if (Number(quantity) <= 0) {
        item.status = "REMOVED";
        await item.save();
        return res.json({ message: "Item removed from cart (quantity <= 0)", item });
      }
      item.quantity = Number(quantity);
    }

    if (note !== undefined) item.note = note;

    await item.save();
    return res.json({ message: "Cart item updated", item });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const accountId = req.user.accountId;
    const user_id = await getUserObjectId(accountId);

    const item = await CartItem.findById(itemId);
    if (!item || item.user_id.toString() !== user_id.toString()) return res.status(404).json({ message: "Cart item not found" });

    if (item.status !== "ACTIVE") return res.status(400).json({ message: "Item is not active" });

    item.status = "REMOVED";
    await item.save();

    return res.json({ message: "Item removed from cart" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeCartItem };

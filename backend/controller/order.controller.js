const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types; // Nếu cần, nhưng có thể bỏ nếu Mongoose tự xử lý
const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const CartItem = require("../models/cartItem.model");
const Voucher = require("../models/voucher.model");
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const UserAddress = require("../models/userAddress.model");
const Food = require("../models/food.model");
const orderManager = require("../controller/orderManager.controller")

const generateOrderCode = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD${dateStr}${randomStr}`;
};

exports.createOrder = async (req, res) => {
  try {
    const { shop_id, delivery_address_id, voucher_id, payment_method, note } = req.body;
    const accountId = req.user.accountId;

    const user = await User.findOne({ account_id: accountId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const user_id = user._id;

    if (!shop_id || !delivery_address_id || !payment_method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const shop = await Shop.findById(shop_id);
    const address = await UserAddress.findOne({
      _id: delivery_address_id,
      user: user_id,
    }).lean();
    if (!shop || !address) {
      return res.status(404).json({ message: "Shop or address not found" });
    }

    const cartItems = await CartItem.find({ user_id, shop_id, status: "ACTIVE" }).populate("food_id");
    if (cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let subtotal = 0;
    const orderDetails = [];
    for (const item of cartItems) {
      if (!item.food_id) {
        return res.status(400).json({ message: "Food data not found for an item" });
      }
      const food = item.food_id;
      if (!food.is_available) {
        return res.status(400).json({ message: `Food ${food.name} is not available` });
      }
      const itemSubtotal = food.price * item.quantity * (1 - (food.discount || 0) / 100); // Lấy price từ Food
      subtotal += itemSubtotal;

      orderDetails.push({
        order_id: null,
        food_id: item.food_id._id,
        food_name: food.name,
        food_image_url: food.image_url,
        food_size: null,
        unit_price: food.price,
        quantity: item.quantity,
        discount_percent: food.discount || 0,
        subtotal: itemSubtotal,
        note: item.note,
      });
    }

    let discount_amount = 0;
    if (voucher_id) {
      const voucher = await Voucher.findById(voucher_id);
      if (
        !voucher ||
        !voucher.is_active ||
        voucher.start_date > new Date() ||
        voucher.end_date < new Date() ||
        (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) ||
        voucher.min_order_amount > subtotal
      ) {
        return res.status(400).json({ message: "Invalid or expired voucher" });
      }
      if (voucher.discount_type === "FIXED") {
        discount_amount = parseFloat(voucher.discount_value);
      } else if (voucher.discount_type === "PERCENT") {
        discount_amount = (subtotal * parseFloat(voucher.discount_value)) / 100;
        if (voucher.max_discount && discount_amount > parseFloat(voucher.max_discount)) {
          discount_amount = parseFloat(voucher.max_discount);
        }
      }
    }

    const shipping_fee = 20000;
    const total_amount = subtotal - discount_amount + shipping_fee;

    const order = new Order({
      order_code: generateOrderCode(),
      customer_id: user_id,
      shop_id,
      delivery_address_id,
      subtotal,
      discount_amount,
      shipping_fee,
      total_amount,
      voucher_id: voucher_id || null,
      payment_method,
      payment_status: payment_method === "COD" ? "COD_PENDING" : "UNPAID",
      status: payment_method === "COD" ? "PENDING" : "PENDING_PAYMENT",
      note,
    });

    await order.save();
    orderManager.notifyNewOrder(order)
    orderDetails.forEach((detail) => (detail.order_id = order._id));
    await OrderDetail.insertMany(orderDetails);
    await CartItem.updateMany({ user_id, shop_id, status: "ACTIVE" }, { status: "CHECKOUT" });
    if (voucher_id) {
      await Voucher.findByIdAndUpdate(voucher_id, { $inc: { used_count: 1 } });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};
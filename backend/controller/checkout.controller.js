const mongoose = require("mongoose");
const { PayOS } = require("@payos/node");
const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const CartItem = require("../models/cartItem.model");
const Voucher = require("../models/voucher.model");
const User = require("../models/user.model");
const UserAddress = require("../models/userAddress.model");
const Shop = require("../models/shop.model");
const orderManager = require("../controller/orderManager.controller");
require("dotenv").config();

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// =====================================================
// Hàm tính toán chi tiết đơn hàng
// =====================================================
async function calculateOrderData(user_id, shop_id, voucher_id, clientDiscount = 0) {
  const cartItems = await CartItem.find({
    user_id,
    shop_id,
    status: "ACTIVE",
  }).populate("food_id");

  if (cartItems.length === 0) throw new Error("Cart is empty");

  let subtotal = 0;
  const orderDetails = [];

  for (const item of cartItems) {
    const food = item.food_id;
    if (!food || !food.is_available) {
      throw new Error(`Food ${food?.name || "unknown"} is not available`);
    }

    const itemSubtotal =
      food.price * item.quantity * (1 - (food.discount || 0) / 100);
    subtotal += itemSubtotal;

    orderDetails.push({
      order_id: null,
      food_id: food._id,
      food_name: food.name,
      food_image_url: food.image_url,
      unit_price: food.price,
      quantity: item.quantity,
      discount_percent: food.discount || 0,
      subtotal: itemSubtotal,
      note: item.note,
    });
  }

  // --- ƯU TIÊN DÙNG discount_amount TỪ CLIENT ---
  let discount_amount = clientDiscount;

  // --- Nếu không có clientDiscount → tự tính từ voucher_id ---
  if (!discount_amount && voucher_id && mongoose.Types.ObjectId.isValid(voucher_id)) {
    const voucher = await Voucher.findById(voucher_id);
    const now = new Date();

    if (
      voucher &&
      voucher.is_active &&
      voucher.start_date <= now &&
      voucher.end_date >= now &&
      (!voucher.usage_limit || voucher.used_count < voucher.usage_limit) &&
      (!voucher.min_order_amount || voucher.min_order_amount <= subtotal)
    ) {
      if (voucher.discount_type === "FIXED") {
        discount_amount = parseFloat(voucher.discount_value);
      } else if (voucher.discount_type === "PERCENT") {
        discount_amount = (subtotal * parseFloat(voucher.discount_value)) / 100;
        if (
          voucher.max_discount &&
          discount_amount > parseFloat(voucher.max_discount)
        ) {
          discount_amount = parseFloat(voucher.max_discount);
        }
      }
    }
  }

  const shipping_fee = 10000;
  const total_amount = subtotal - discount_amount + shipping_fee;

  return {
    subtotal,
    discount_amount,
    shipping_fee,
    total_amount,
    orderDetails,
  };
}

// =====================================================
// ✅ API CHÍNH: CHECKOUT (COD hoặc PayOS)
// =====================================================
exports.checkout = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { shop_id, delivery_address_id, voucher_id, payment_method, note } = req.body;

    if (!req.user || !req.user.accountId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const accountId = req.user.accountId;
    const user = await User.findOne({ account_id: accountId });
    if (!user) throw new Error("User not found");

    const address = await UserAddress.findOne({
      _id: delivery_address_id,
      user: user._id,
    });
    if (!address) throw new Error("Delivery address not found");

    const shop = await Shop.findById(shop_id);
    if (!shop) throw new Error("Shop not found");

    const {
      subtotal,
      discount_amount,
      shipping_fee,
      total_amount,
      orderDetails,
    } = await calculateOrderData(user._id, shop_id, voucher_id);

    // ✅ Tạo mã đơn PayOS (số nguyên)
    const orderCode = Math.floor(Date.now() / 1000);
    const displayOrderCode = `ORD${orderCode}`;

    // ✅ Tạo đơn hàng trước (dùng cho cả COD và PayOS)
    const order = new Order({
      order_code: displayOrderCode,
      customer_id: user._id,
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

    await order.save({ session });

    // Gán order_id cho từng item
    orderDetails.forEach((d) => (d.order_id = order._id));
    await OrderDetail.insertMany(orderDetails, { session });

    // Chuyển giỏ hàng sang trạng thái CHECKOUT (không xóa)
    await CartItem.updateMany(
      { user_id: user._id, shop_id, status: "ACTIVE" },
      { status: "CHECKOUT" },
      { session }
    );

    if (voucher_id) {
      await Voucher.findByIdAndUpdate(
        voucher_id,
        { $inc: { used_count: 1 } },
        { session }
      );
    }

    // ===== Nếu là COD =====
    if (payment_method === "COD") {
      await session.commitTransaction();
      if (orderManager.notifyNewOrder) orderManager.notifyNewOrder(order);

      return res.json({ message: "Order created with COD", order });
    }

    // ===== Nếu là PayOS =====
    const paymentRes = await payOS.paymentRequests.create({
      orderCode,
      amount: Math.round(total_amount),
      description: `Order ${displayOrderCode}`,
      returnUrl: `http://localhost:9999/api/checkout/success?order=${displayOrderCode}`,
      cancelUrl: `http://localhost:9999/api/checkout/cancel?order=${displayOrderCode}`,
      items: orderDetails.map((it) => ({
        name: it.food_name,
        quantity: it.quantity,
        price: Math.round(it.unit_price),
      })),
    });

    await session.commitTransaction();

    return res.json({
      url: paymentRes.checkoutUrl,
      order,
      message: "Payment link created successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("❌ Checkout Error:", err);
    res.status(500).json({
      message: err.message || "Checkout failed",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  } finally {
    session.endSession();
  }
};

// =====================================================
// ✅ PAYOS RETURN CALLBACKS
// =====================================================
exports.checkoutSuccess = async (req, res) => {
  try {
    const orderCode = req.query.order;
    const order = await Order.findOneAndUpdate(
      { order_code: orderCode },
      { payment_status: "PAID", status: "CONFIRMED" },
      { new: true }
    );

    if (!order) return res.status(404).send("Order not found");

    if (orderManager.notifyNewOrder) orderManager.notifyNewOrder(order);

    // ✅ Redirect về frontend cùng thông báo
    res.redirect(
      `http://localhost:5173/myorder/${order._id}?status=success&message=Thanh toán thành công`
    );
  } catch (err) {
    console.error("PayOS success error:", err);
    res.status(500).send("Lỗi xác nhận thanh toán");
  }
};

exports.checkoutCancel = async (req, res) => {
  try {
    const orderCode = req.query.order;
    const order = await Order.findOneAndUpdate(
      { order_code: orderCode },
      { payment_status: "CANCELLED", status: "CANCELLED" },
      { new: true }
    );

    if (!order) return res.status(404).send("Order not found");

    // Khôi phục giỏ hàng
    await CartItem.updateMany(
      {
        user_id: order.customer_id,
        shop_id: order.shop_id,
        status: "CHECKOUT",
      },
      { status: "ACTIVE" }
    );

    // ✅ Redirect về frontend cùng thông báo
    res.redirect(
      `http://localhost:5173/myorder?status=cancel&message=Đơn hàng đã bị hủy`
    );
  } catch (err) {
    console.error("PayOS cancel error:", err);
    res.status(500).send("Lỗi hủy thanh toán");
  }
};

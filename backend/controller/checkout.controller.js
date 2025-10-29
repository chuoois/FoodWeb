const { PayOS } = require("@payos/node");
const Order = require("../models/order.model");
const OrderDetail = require("../models/orderDetail.model");
const CartItem = require("../models/cartItem.model");
const Voucher = require("../models/voucher.model");
const User = require("../models/user.model");
const UserAddress = require("../models/userAddress.model");
const Shop = require("../models/shop.model");
require("dotenv").config();

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID,
  apiKey: process.env.PAYOS_API_KEY,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY,
});

// 🔹 Sinh mã order ngẫu nhiên
const generateOrderCode = () => {
  return Math.floor(100000000 + Math.random() * 900000000); // 9 chữ số
};

// 🔹 Tính toán tổng tiền (giống order cũ)
async function calculateOrderData(user_id, shop_id, voucher_id) {
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
    const itemSubtotal =
      food.price * item.quantity * (1 - (food.discount || 0) / 100);
    subtotal += itemSubtotal;

    orderDetails.push({
      order_id: null,
      food_id: food._id,
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
    if (voucher && voucher.is_active) {
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

  const shipping_fee = 20000;
  const total_amount = subtotal - discount_amount + shipping_fee;

  return {
    subtotal,
    discount_amount,
    shipping_fee,
    total_amount,
    orderDetails,
  };
}

// ================================================
// 🔹 CONTROLLER CHÍNH: CHECKOUT
// ================================================
exports.checkout = async (req, res) => {
  try {
    const { shop_id, delivery_address_id, voucher_id, payment_method, note } =
      req.body;
    const accountId = req.user.accountId;

    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const address = await UserAddress.findOne({
      _id: delivery_address_id,
      user: user._id,
    }).lean();
    if (!address)
      return res.status(404).json({ message: "Delivery address not found" });

    const shop = await Shop.findById(shop_id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });

    const {
      subtotal,
      discount_amount,
      shipping_fee,
      total_amount,
      orderDetails,
    } = await calculateOrderData(user._id, shop_id, voucher_id);

    // 🔸 Nếu thanh toán COD → tạo order ngay
    if (payment_method === "COD") {
      const order = new Order({
        order_code: generateOrderCode(),
        customer_id: user._id,
        shop_id,
        delivery_address_id,
        subtotal,
        discount_amount,
        shipping_fee,
        total_amount,
        voucher_id: voucher_id || null,
        payment_method,
        payment_status: "COD_PENDING",
        status: "PENDING",
        note,
      });

      await order.save();
      orderDetails.forEach((d) => (d.order_id = order._id));
      await OrderDetail.insertMany(orderDetails);
      await CartItem.updateMany(
        { user_id: user._id, shop_id },
        { status: "CHECKOUT" }
      );

      return res.json({ message: "Order created with COD", order });
    }
    
    // 🔸 Nếu thanh toán PayOS → tạo link thanh toán
    const orderCode = generateOrderCode();
    const paymentRes = await payOS.paymentRequests.create({
      orderCode: orderCode,
      amount: Math.round(total_amount),
      description: `Order ${shop.name}`,
      returnUrl: `${process.env.APP_URL}/api/checkout/success?order=${orderCode}`,
      cancelUrl: `${process.env.APP_URL}/api/checkout/cancel?order=${orderCode}`,
      items: orderDetails.map((it) => ({
        name: it.food_name,
        quantity: it.quantity,
        price: Math.round(it.unit_price),
      })),
    });

    const order = new Order({
      order_code: orderCode,
      customer_id: user._id,
      shop_id,
      delivery_address_id,
      subtotal,
      discount_amount,
      shipping_fee,
      total_amount,
      voucher_id: voucher_id || null,
      payment_method,
      payment_status: "UNPAID",
      status: "PENDING_PAYMENT",
      note,
    });

    await order.save();
    orderDetails.forEach((d) => (d.order_id = order._id));
    await OrderDetail.insertMany(orderDetails);
    await CartItem.updateMany(
      { user_id: user._id, shop_id },
      { status: "CHECKOUT" }
    );

    return res.json({ url: paymentRes.checkoutUrl, order });
  } catch (err) {
    console.error("Checkout Error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================================================
// 🔹 XỬ LÝ TRẢ VỀ SAU THANH TOÁN PAYOS
// ================================================
exports.checkoutSuccess = async (req, res) => {
  try {
    const orderCode = req.query.order;
    const order = await Order.findOneAndUpdate(
      { order_code: orderCode },
      { payment_status: "PAID", status: "CONFIRMED" },
      { new: true }
    );

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>✅ Thanh toán PayOS thành công!</h2>
          <p>Cảm ơn bạn đã đặt hàng. Mã đơn hàng: <b>${orderCode}</b></p>
        </body>
      </html>
    `);
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

    if (!order) {
      return res.status(404).send("Order not found");
    }

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 40px;">
          <h2>❌ Thanh toán đã bị hủy!</h2>
          <p>Mã đơn hàng: <b>${orderCode}</b></p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error("PayOS cancel error:", err);
    res.status(500).send("Lỗi hủy thanh toán");
  }
};

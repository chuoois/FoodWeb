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
const orderManager = require("../controller/orderManager.controller");
const Feedback = require("../models/feedback.model");

const generateOrderCode = () => {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ORD${dateStr}${randomStr}`;
};

// exports.createOrder = async (req, res) => {
//   try {
//     const { shop_id, delivery_address_id, voucher_id, payment_method, note } = req.body;
//     const accountId = req.user.accountId;
//      console.log("🧾 Request body:", req.body);
//     const user = await User.findOne({ account_id: accountId });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }
//     const user_id = user._id;

//     if (!shop_id || !delivery_address_id || !payment_method) {
//       return res.status(400).json({ message: "Missing required fields" });
//     }

//     const shop = await Shop.findById(shop_id);
//     const address = await UserAddress.findOne({
//       _id: delivery_address_id,
//       user: user_id,
//     }).lean();
//     if (!shop || !address) {
//       return res.status(404).json({ message: "Shop or address not found" });
//     }

//     const cartItems = await CartItem.find({ user_id, shop_id, status: "ACTIVE" }).populate("food_id");
//     if (cartItems.length === 0) {
//       return res.status(400).json({ message: "Cart is empty" });
//     }

//     let subtotal = 0;
//     const orderDetails = [];
//     for (const item of cartItems) {
//       if (!item.food_id) {
//         return res.status(400).json({ message: "Food data not found for an item" });
//       }
//       const food = item.food_id;
//       if (!food.is_available) {
//         return res.status(400).json({ message: `Food ${food.name} is not available` });
//       }
//       const itemSubtotal = food.price * item.quantity * (1 - (food.discount || 0) / 100); // Lấy price từ Food
//       subtotal += itemSubtotal;

//       orderDetails.push({
//         order_id: null,
//         food_id: item.food_id._id,
//         food_name: food.name,
//         food_image_url: food.image_url,
//         food_size: null,
//         unit_price: food.price,
//         quantity: item.quantity,
//         discount_percent: food.discount || 0,
//         subtotal: itemSubtotal,
//         note: item.note,
//       });
//     }

//     let discount_amount = 0;
//     if (voucher_id) {
//       const voucher = await Voucher.findById(voucher_id);
//       if (
//         !voucher ||
//         !voucher.is_active ||
//         voucher.start_date > new Date() ||
//         voucher.end_date < new Date() ||
//         (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) ||
//         voucher.min_order_amount > subtotal
//       ) {
//         return res.status(400).json({ message: "Invalid or expired voucher" });
//       }
//       if (voucher.discount_type === "FIXED") {
//         discount_amount = parseFloat(voucher.discount_value);
//       } else if (voucher.discount_type === "PERCENT") {
//         discount_amount = (subtotal * parseFloat(voucher.discount_value)) / 100;
//         if (voucher.max_discount && discount_amount > parseFloat(voucher.max_discount)) {
//           discount_amount = parseFloat(voucher.max_discount);
//         }
//       }
//     }

//     const shipping_fee = 20000;
//     const total_amount = subtotal - discount_amount + shipping_fee;

//     const order = new Order({
//       order_code: generateOrderCode(),
//       customer_id: user_id,
//       shop_id,
//       delivery_address_id,
//       subtotal,
//       discount_amount,
//       shipping_fee,
//       total_amount,
//       voucher_id: voucher_id || null,
//       payment_method,
//       payment_status: payment_method === "COD" ? "COD_PENDING" : "UNPAID",
//       status: payment_method === "COD" ? "PENDING" : "PENDING_PAYMENT",
//       note,
//     });

//     await order.save();
//     orderManager.notifyNewOrder(order)
//     orderDetails.forEach((detail) => (detail.order_id = order._id));
//     await OrderDetail.insertMany(orderDetails);
//     await CartItem.updateMany({ user_id, shop_id, status: "ACTIVE" }, { status: "CHECKOUT" });
//     if (voucher_id) {
//       await Voucher.findByIdAndUpdate(voucher_id, { $inc: { used_count: 1 } });
//     }

//     res.status(201).json({ message: "Order created successfully", order });
//   } catch (error) {
//     res.status(500).json({ message: "Error creating order", error: error.message });
//   }
// };

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { order_code, status } = req.body; // PayOS webhook gửi về
    const order = await Order.findOne({ order_code });

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status === "PAID") {
      order.payment_status = "PAID";
      order.status = "CONFIRMED";
    } else if (status === "CANCELLED") {
      order.payment_status = "CANCELLED";
      order.status = "CANCELLED";
    }

    await order.save();
    res.json({ message: "Order updated", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating payment status", error: error.message });
  }
};

exports.getVouchers = async (req, res) => {
  try {
    // ✅ Chấp nhận cả shop_id và shop
    const { shop_id, shop } = req.query;

    let filter = { is_active: true };
    if (shop_id || shop) {
      filter.shop_id = shop_id || shop;
    }

    const vouchers = await Voucher.find(filter).sort({ created_at: -1 }).lean();

    res.status(200).json({
      success: true,
      count: vouchers.length,
      data: vouchers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vouchers",
      error: error.message,
    });
  }
};

/**
 * Hủy đơn hàng (chỉ khi đang PENDING)
 * PATCH /orders/:order_code/cancel
 */

exports.cancelOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { reason } = req.body; // Lý do hủy (tùy chọn)
    const accountId = req.user.accountId;

    // 1. Tìm user
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Tìm đơn hàng bằng order_code (đúng field trong model)
    const order = await Order.findById(order_id).populate("voucher_id");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // 3. Kiểm tra quyền: chỉ khách hàng đặt đơn mới được hủy
    if (order.customer_id.toString() !== user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own order" });
    }

    // 4. Chỉ hủy được khi status = PENDING
    if (order.status !== "PENDING") {
      return res.status(400).json({
        message: "Cannot cancel order. Only PENDING orders can be cancelled.",
        current_status: order.status,
      });
    }

    // 5. Cập nhật trạng thái + lý do + người hủy
    order.status = "CANCELLED";
    order.payment_status =
      order.payment_method === "COD" ? "CANCELLED" : "CANCELLED";
    order.cancel_reason = reason || "Khách hàng hủy đơn";
    order.cancelled_by = user._id;

    await order.save();

    // 6. Hoàn lại voucher (nếu có)
    if (order.voucher_id) {
      await Voucher.findByIdAndUpdate(order.voucher_id, {
        $inc: { used_count: -1 },
      });
    }

    // 7. Gửi thông báo realtime đến shop
    try {
      if (orderManager.notifyOrderCancelled) {
        await orderManager.notifyOrderCancelled(order);
      } else {
        // Fallback: dùng notifyNewOrder với status mới
        await orderManager.notifyNewOrder({
          ...order.toObject(),
          status: "CANCELLED",
        });
      }
    } catch (notifyErr) {
      console.warn("SSE notify failed (non-critical):", notifyErr.message);
    }

    // 8. Trả về kết quả
    res.json({
      success: true,
      message: "Order cancelled successfully",
      order: {
        order_code: order.order_code,
        status: order.status,
        cancel_reason: order.cancel_reason,
        cancelled_at: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({
      success: false,
      message: "Error cancelling order",
      error: error.message,
    });
  }
};

/**
 * Lấy danh sách đơn hàng của user hiện tại
 * GET /orders?status=PENDING&page=1&limit=10
 */
exports.getUserOrders = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const { status, page = 1, limit = 10 } = req.query;

    // Tìm user
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const filter = { customer_id: user._id };
    if (status) {
      // Tách chuỗi status thành một mảng và chuyển sang chữ hoa
      const statusArray = status.split(",").map((s) => s.toUpperCase());
      filter.status = { $in: statusArray };
    }

    // Phân trang
    const skip = (page - 1) * limit;
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("shop_id", "name image_url")
      .populate("delivery_address_id", "address recipient_name phone")
      .populate("voucher_id", "code discount_type discount_value")
      .lean();

    // Lấy chi tiết món ăn cho từng đơn
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ order_id: order._id })
          .select(
            "food_name food_image_url quantity unit_price discount_percent subtotal"
          )
          .lean();
        return { ...order, items: details };
      })
    );

    // ✅ THÊM LOGIC KIỂM TRA isReviewed
    let ordersWithReviewStatus = ordersWithDetails;

    if (ordersWithDetails.length > 0) {
      // Lấy tất cả order IDs
      const orderIds = ordersWithDetails.map((order) => order._id);

      // Tìm những order nào đã có feedback
      const reviewedOrderIds = await Feedback.find({
        order_id: { $in: orderIds },
      }).distinct("order_id");

      // Convert sang Set để lookup nhanh O(1)
      const reviewedSet = new Set(reviewedOrderIds.map((id) => id.toString()));

      // Thêm field isReviewed vào mỗi order
      ordersWithReviewStatus = ordersWithDetails.map((order) => ({
        ...order,
        isReviewed: reviewedSet.has(order._id.toString()),
      }));
    }

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: ordersWithReviewStatus, // ⬅️ ĐỔI TỪ ordersWithDetails
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getUserOrders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// Lấy chi tiết 1 đơn hàng theo ID hoặc order_code
exports.getOrderDetail = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const { id } = req.params;

    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await Order.findOne({
      $or: [{ _id: id }, { order_code: id }],
      customer_id: user._id,
    })
      .select("-__v")
      .populate("shop_id", "name image_url address")
      .populate("delivery_address_id", "recipient_name phone address")
      .populate("voucher_id", "code discount_type discount_value")
      .lean();

    if (!order) return res.status(404).json({ message: "Order not found" });

    const items = await OrderDetail.find({ order_id: order._id })
      .select(
        "food_name food_image_url food_size quantity unit_price discount_percent subtotal note"
      )
      .lean();

    return res.json({
      success: true,
      data: { ...order, items },
    });
  } catch (error) {
    console.error("❌ getOrderDetail error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching order detail",
      error: error.message,
    });
  }
};

/**
 * 📊 Lấy tất cả đơn hàng đã hoàn thành (dành cho MANAGER-FINANCE)
 * GET /finance/orders?shop_id=&page=&limit=
 */
exports.getAllCompletedOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, shop_id } = req.query;
    const skip = (page - 1) * limit;

    // ⚡ Chỉ lấy đơn hàng hoàn thành
    const filter = { status: "DELIVERED" };
    if (shop_id) filter.shop_id = shop_id;

    const orders = await Order.find(filter)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "shop_id",
        select: "name logoUrl coverUrl address owner",
        populate: {
          path: "owner", // đây là field owner trong Shop
          select: "full_name email", // lấy tên, email, avatar, tùy ý
        },
      })
      .populate("customer_id", "full_name email")
      .populate("voucher_id", "code discount_value discount_type")
      .lean();

    // Lấy chi tiết món ăn
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const details = await OrderDetail.find({ order_id: order._id })
          .select(
            "food_name food_image_url quantity unit_price discount_percent subtotal"
          )
          .lean();
        return { ...order, items: details };
      })
    );

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: ordersWithDetails,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("getAllCompletedOrders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching completed orders",
      error: error.message,
    });
  }
};

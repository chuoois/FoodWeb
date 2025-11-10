const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Shop = require("../models/shop.model");
const Staff = require("../models/staff.model");
const OrderDetail = require("../models/orderDetail.model")

// SSE clients: Map<staffId(string), Array<res>>
const sseClients = new Map();

/**
 * Lấy staffId từ accountId (dùng chung)
 */
const getStaffId = async (accountId) => {
  const staff = await Staff.findOne({ account_id: accountId }).lean();
  if (!staff) throw new Error("Staff not found");
  return staff._id;
};

/**
 * Lấy danh sách đơn hàng của shop mà staff quản lý
 * (Không dùng res → có thể dùng cho cả REST và SSE)
 */
const fetchShopOrders = async (staffId, query = {}) => {
  const shop = await Shop.findOne({ managers: staffId }).lean();
  if (!shop) return { orders: [], pagination: { total: 0, totalPages: 1, page: 1 } };

  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    sort_by = "createdAt",
    sort_order = "desc",
  } = query;

  const filter = { shop_id: shop._id };

  // 🔍 Tìm kiếm theo mã đơn hoặc tên khách hàng
  if (search) {
    filter.$or = [
      { order_code: { $regex: search, $options: "i" } },
      { "customer_id.full_name": { $regex: search, $options: "i" } },
    ];
  }

  // 🟢 Lọc theo trạng thái nếu có
  if (status) {
    filter.status = status;
  }

  // Tổng số đơn (để tính trang)
  const total = await Order.countDocuments(filter);

  // Lấy danh sách đơn có populate + sort + phân trang
  const orders = await Order.find(filter)
    .populate("customer_id", "full_name phone")
    .populate("shop_id", "name image_url")
    .populate("delivery_address_id", "address recipient_name phone")
    .sort({ [sort_by]: sort_order === "desc" ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  // Lấy chi tiết món ăn
  const orderIds = orders.map((o) => o._id);
  const orderDetails = await OrderDetail.find({ order_id: { $in: orderIds } })
    .select("order_id food_name quantity food_image_url")
    .lean();

  const orderNameMap = {};
  const orderQuantity = {};
  const orderImages = {};
orderDetails.forEach((detail) => {
  const id = detail.order_id.toString();
  if (!orderNameMap[id]) orderNameMap[id] = [];
  if (!orderQuantity[id]) orderQuantity[id] = [];
  if (!orderImages[id]) orderImages[id] = [];

  orderNameMap[id].push(detail.food_name);
  orderQuantity[id].push(detail.quantity);
  orderImages[id].push(detail.food_image_url);
});

const ordersWithNames = orders.map((order) => ({
  ...order,
  order_name: orderNameMap[order._id.toString()]?.join(", ") || "",
  quantity: orderQuantity[order._id.toString()]?.join(", ") || "",
  images: orderImages[order._id.toString()] || [],
}));

  const totalPages = Math.ceil(total / limit);

  return {
    orders: ordersWithNames,
    pagination: { total, totalPages, page: Number(page), limit: Number(limit) },
  };
};



/**
 * Gửi SSE event cho một staff
 */
const sendEventToStaff = (staffId, event) => {
  const clients = sseClients.get(staffId.toString()) || [];
  clients.forEach((client) => {
    if (!client.writableEnded) {
      client.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });
};

/**
 * Gửi event cho tất cả manager của shop
 */
const broadcastToShopManagers = async (shopId, event) => {
  const shop = await Shop.findById(shopId).lean();
  if (!shop) return;

  shop.managers.forEach((managerId) => {
    sendEventToStaff(managerId, event);
  });
};

/* ==============================
   REST API CONTROLLERS
   ============================== */

/* REST API Controller */
class OrderManagerController {
  // GET /ordersManage
  static async getOrders(req, res) {
    try {
      const staffId = await getStaffId(req.user.accountId);
      const { orders, pagination } = await fetchShopOrders(staffId, req.query);
      res.status(200).json({ orders, pagination });
    } catch (error) {
      res.status(403).json({ message: error.message });
    }
  }

  // PATCH /shop/orders/:order_id/accept
  static async acceptOrder(req, res) {
    try {
      const { order_id } = req.params;
      const staffId = await getStaffId(req.user.accountId);

      const order = await Order.findById(order_id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const shop = await Shop.findById(order.shop_id).lean();
      if (!shop || !shop.managers.some((m) => m.toString() === staffId.toString())) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      order.status = "CONFIRMED";
      await order.save();

      // 🔥 Populate lại cho đầy đủ
      const populatedOrder = await Order.findById(order._id)
        .populate("customer_id", "full_name phone")
        .populate("shop_id", "name image_url")
        .populate("delivery_address_id", "address recipient_name phone")
        .lean();

      // Gửi cập nhật realtime
      broadcastToShopManagers(order.shop_id, {
        type: "order_updated",
        data: populatedOrder,
      });

      res.json({ message: "Order accepted", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PATCH /shop/orders/:order_id/status
  static async updateOrderStatus(req, res) {
    try {
      const { order_id } = req.params;
      const { status } = req.body;
      const validStatuses = ["SHIPPING", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const staffId = await getStaffId(req.user.accountId);
      const order = await Order.findById(order_id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const shop = await Shop.findById(order.shop_id).lean();
      if (!shop || !shop.managers.some((m) => m.toString() === staffId.toString())) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      order.status = status;

   
      await order.save();

      // Populate lại đầy đủ thông tin trước khi gửi
      const populatedOrder = await Order.findById(order._id)
        .populate("customer_id", "full_name phone")
        .populate("shop_id", "name image_url")
        .populate("delivery_address_id", "address recipient_name phone")
        .lean();

      broadcastToShopManagers(order.shop_id, {
        type: "order_updated",
        data: populatedOrder,
      });

      res.json({ message: "Status updated", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

/* ==============================
   SSE CONTROLLER
   ============================== */

// GET /shop/orders/stream → Kết nối SSE
OrderManagerController.registerSSE = async (req, res) => {
  let staffId;
  try {
    staffId = await getStaffId(req.user.accountId);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }

  // Thiết lập SSE headers
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*", // tùy môi trường
  };
  res.writeHead(200, headers);

  // Lưu client
  const staffKey = staffId.toString();
  if (!sseClients.has(staffKey)) sseClients.set(staffKey, []);
  sseClients.get(staffKey).push(res);

  // Gửi danh sách đơn ban đầu
  const orders = await fetchShopOrders(staffId);
res.write(`data: ${JSON.stringify({
  type: "orders",
  data: orders.orders,        // danh sách đơn
  pagination: orders.pagination // phân trang
})}\n\n`);

  // Xử lý ngắt kết nối
  req.on("close", () => {
    const clients = sseClients.get(staffKey) || [];
    const index = clients.indexOf(res);
    if (index !== -1) {
      clients.splice(index, 1);
      if (clients.length === 0) sseClients.delete(staffKey);
    }
    res.end();
  });
};

/* ==============================
   NOTIFY NEW ORDER (gọi từ createOrder)
   ============================== */

OrderManagerController.notifyNewOrder = async (order) => {
  try {
    // Lấy order kèm populate như fetchShopOrders
    const populatedOrder = await Order.findById(order._id)
      .populate("customer_id", "full_name phone")
      .populate("shop_id", "name image_url")
      .populate("delivery_address_id", "address recipient_name phone")
      .lean();

    // Lấy chi tiết món ăn
    const orderDetails = await OrderDetail.find({ order_id: order._id })
      .select("order_id food_name quantity food_image_url unit_price discount_percent note")
      .lean();

    const order_name = orderDetails.map(d => d.food_name).join(", ");
    const quantity = orderDetails.map(d => d.quantity).join(", ");
    const images = orderDetails.map(d => d.food_image_url);

    const orderWithDetails = {
      ...populatedOrder,
      details: orderDetails,
      order_name,
      quantity,
      images,
    };

    await broadcastToShopManagers(order.shop_id, {
      type: "new_order",
      data: orderWithDetails,
    });
  } catch (error) {
    console.error("SSE Notify Error:", error);
  }
};


module.exports = OrderManagerController;
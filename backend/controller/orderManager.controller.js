const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Shop = require("../models/shop.model");
const Staff = require("../models/staff.model");

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
const fetchShopOrders = async (staffId) => {
  const shop = await Shop.findOne({ managers: staffId }).lean();
  if (!shop) return [];

  return await Order.find({
    shop_id: shop._id,
    status: { $in: ["PENDING", "CONFIRMED"] },
  })
    .populate("customer_id", "full_name phone")
    .populate("delivery_address_id", "address")
    .lean();
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

class OrderManagerController {
  // GET /shop/orders → Lấy danh sách đơn (REST)
  static async getOrders(req, res) {
    try {
      const staffId = await getStaffId(req.user.accountId);
      const orders = await fetchShopOrders(staffId);
      res.status(200).json(orders);
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

      // Gửi cập nhật realtime
      broadcastToShopManagers(order.shop_id, {
        type: "order_updated",
        data: order.toObject(),
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
      const validStatuses = ["SHIPPED", "DELIVERED", "CANCELLED"];
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

      broadcastToShopManagers(order.shop_id, {
        type: "order_updated",
        data: order.toObject(),
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
  res.write(`data: ${JSON.stringify({ type: "orders", data: orders })}\n\n`);

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
    await broadcastToShopManagers(order.shop_id, {
      type: "new_order",
      data: order.toObject ? order.toObject() : order,
    });
  } catch (error) {
    console.error("SSE Notify Error:", error);
  }
};

module.exports = OrderManagerController;

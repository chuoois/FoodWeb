const Order = require("../models/order.model");
const Shop = require("../models/shop.model");
const Staff = require("../models/staff.model");

// Biến lưu SSE clients: Map<staffId(string), Array<res>>
const sseClients = new Map();

// === HÀM HỖ TRỢ CHUNG ===
const getStaffId = async (accountId) => {
  const staff = await Staff.findOne({ account_id: accountId }).lean();
  if (!staff) throw new Error("Staff not found");
  return staff._id;
};

const getShopOrders = async (staffId) => {
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

const sendToStaff = (staffId, event) => {
  const clients = sseClients.get(staffId.toString()) || [];
  clients.forEach((res) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });
};

const broadcastToShop = async (shopId, event) => {
  const shop = await Shop.findById(shopId).lean();
  if (!shop) return;
  shop.managers.forEach((managerId) => sendToStaff(managerId, event));
};

// === CONTROLLER CLASS ===
class OrderManagerController {
  // GET /ordersManage → REST API: Lấy danh sách đơn
  static async getOrders(req, res) {
    try {
      const accountId = req.user.accountId;
      const staffId = await OrderManagerController.getStaffIdFromAccountId(
        accountId
      );
      const shop = await Shop.findOne({ managers: staffId }); // Chỉ kiểm tra managers vì staff không phải owner
      console.log("Debug - Found Shop:", shop); // Debug
      if (!shop) {
        if (isSSE) {
          res.write(
            `data: ${JSON.stringify({
              type: "error",
              message: "Unauthorized",
            })}\n\n`
          );
        } else {
          return res.status(403).json({ message: "Unauthorized" });
        }
        return;
      }

      const orders = await Order.find({
        shop_id: shop._id,
        status: { $in: ["PENDING", "CONFIRMED"] },
      })
        .populate("customer_id", "full_name phone")
        .populate("delivery_address_id", "address")
        .lean();

      if (isSSE) {
        res.write(
          `data: ${JSON.stringify({ type: "orders", data: orders })}\n\n`
        );
      } else {
        console.log(orders);
        res.status(200).json(orders);
      }
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  // PUT /ordersManage/:order_id/accept
  static async acceptOrder(req, res) {
    try {
      const { order_id } = req.params;
      const accountId = req.user.accountId;
      const staffId = await OrderManagerController.getStaffIdFromAccountId(
        accountId
      );
      const order = await Order.findById(order_id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const shop = await Shop.findById(order.shop_id).lean();
      if (!shop || !shop.managers.some(m => m.toString() === staffId.toString())) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      order.status = "CONFIRMED";
      await order.save();

      // Gửi realtime
      broadcastToShop(order.shop_id, {
        type: "order_updated",
        data: order.toObject(),
      });

      res.json({ message: "Order accepted", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // PUT /ordersManage/:order_id/status
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
      if (!shop || !shop.managers.some(m => m.toString() === staffId.toString())) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      order.status = status;
      await order.save();

      broadcastToShop(order.shop_id, {
        type: "order_updated",
        data: order.toObject(),
      });

      res.json({ message: "Status updated", order });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  // GET /ordersManage/sse → SSE Stream
  static async registerSSE(req, res) {
    let staffId;
    try {
      staffId = await getStaffId(req.user.accountId);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    // Thiết lập SSE
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    const key = staffId.toString();
    if (!sseClients.has(key)) sseClients.set(key, []);
    sseClients.get(key).push(res);

    // Gửi danh sách đơn ban đầu
    const orders = await getShopOrders(staffId);
    res.write(`data: ${JSON.stringify({ type: "orders", data: orders })}\n\n`);

    // Xử lý ngắt kết nối
    req.on("close", () => {
      const clients = sseClients.get(key) || [];
      const idx = clients.indexOf(res);
      if (idx !== -1) {
        clients.splice(idx, 1);
        if (clients.length === 0) sseClients.delete(key);
      }
      if (!res.writableEnded) res.end();
    });
  }

  // Gọi từ createOrder để thông báo đơn mới
  static async notifyNewOrder(order) {
    try {
      await broadcastToShop(order.shop_id, {
        type: "new_order",
        data: order.toObject ? order.toObject() : order,
      });
    } catch (error) {
      console.error("SSE notify error:", error);
    }
  }
}

// Export đúng tên để router cũ dùng được
module.exports = {
  getOrders: OrderManagerController.getOrders,
  acceptOrder: OrderManagerController.acceptOrder,
  updateOrderStatus: OrderManagerController.updateOrderStatus,
  registerSSE: OrderManagerController.registerSSE,
  notifyNewOrder: OrderManagerController.notifyNewOrder,
};
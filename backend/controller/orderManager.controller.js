const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Shop = require("../models/shop.model");
const Staff = require("../models/staff.model"); // Thêm mô hình Staff

const sseClients = new Map();

class OrderManagerController {
  // Hàm lấy staffId từ accountId
  static async getStaffIdFromAccountId(accountId) {
    const staff = await Staff.findOne({ account_id: accountId });
    if (!staff) {
      throw new Error("Staff not found");
    }
    return staff._id;
  }

  // Đăng ký kết nối SSE để nhận cập nhật realtime
  static async registerSSE(req, res) {
    const accountId = req.user.accountId;
    let staffId;
    try {
      staffId = await OrderManagerController.getStaffIdFromAccountId(accountId);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }

    const headers = {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    };
    res.writeHead(200, headers);

    if (!sseClients.has(staffId.toString())) {
      sseClients.set(staffId.toString(), []);
    }
    const client = res;
    sseClients.get(staffId.toString()).push(client);

    OrderManagerController.getOrders(req, res, true);

    req.on("close", () => {
      const clients = sseClients.get(staffId.toString()) || [];
      const index = clients.indexOf(client);
      if (index !== -1) {
        clients.splice(index, 1);
        if (clients.length === 0) sseClients.delete(staffId.toString());
      }
    });
  }

  // Lấy danh sách đơn hàng
  static async getOrders(req, res, isSSE = false) {
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
      console.error("Debug - Error in getOrders:", error);
      if (isSSE) {
        res.write(
          `data: ${JSON.stringify({
            type: "error",
            message: error.message,
          })}\n\n`
        );
      } else {
        res
          .status(500)
          .json({ message: "Error fetching orders", error: error.message });
      }
    }
  }

  // Chấp nhận đơn hàng
  static async acceptOrder(req, res) {
    try {
      const { order_id } = req.params;
      const accountId = req.user.accountId;
      const staffId = await OrderManagerController.getStaffIdFromAccountId(
        accountId
      );



      

      const order = await Order.findById(order_id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const shop = await Shop.findById(order.shop_id);
      if (!shop || !shop.managers.includes(staffId)) {
        // Chỉ kiểm tra managers
        console.log(staffId);
        console.log(shop.managers);
        console.log(shop._id);

        return res
          .status(403)
          .json({ message: "Unauthorized to accept order" });
      }

      order.status = "CONFIRMED";
      await order.save();

      const clients = sseClients.get(staffId.toString()) || [];
      clients.forEach((client) => {
        if (!client.finished) {
          client.write(
            `data: ${JSON.stringify({
              type: "order_updated",
              data: order,
            })}\n\n`
          );
        }
      });

      res.status(200).json({ message: "Order accepted", order });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error accepting order", error: error.message });
    }
  }

  // Cập nhật trạng thái đơn hàng
  static async updateOrderStatus(req, res) {
    try {
      const { order_id } = req.params;
      const { status } = req.body;
      const accountId = req.user.accountId;
      const staffId = await OrderManagerController.getStaffIdFromAccountId(
        accountId
      );

      const validStatuses = ["SHIPPED", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await Order.findById(order_id);
      if (!order) return res.status(404).json({ message: "Order not found" });

      const shop = await Shop.findById(order.shop_id);
      if (!shop || !shop.managers.includes(staffId)) {
        // Chỉ kiểm tra managers
        return res
          .status(403)
          .json({ message: "Unauthorized to update status" });
      }

      order.status = status;
      await order.save();

      const clients = sseClients.get(staffId.toString()) || [];
      clients.forEach((client) => {
        if (!client.finished) {
          client.write(
            `data: ${JSON.stringify({
              type: "order_updated",
              data: order,
            })}\n\n`
          );
        }
      });

      res.status(200).json({ message: "Order status updated", order });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error updating order status", error: error.message });
    }
  }

  // Hàm để đẩy thông báo khi có order mới
  static async notifyNewOrder(order) {
    const shop = await Shop.findById(order.shop_id);
    if (shop) {
      const managerClients = shop.managers
        .filter((managerId) => sseClients.has(managerId.toString()))
        .flatMap((managerId) => sseClients.get(managerId.toString()));

      managerClients.forEach((client) => {
        if (!client.finished) {
          client.write(
            `data: ${JSON.stringify({ type: "new_order", data: order })}\n\n`
          );
        }
      });
    }
  }
}

module.exports = OrderManagerController;

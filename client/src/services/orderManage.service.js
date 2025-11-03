import api from "../lib/axios";
import { EventSourcePolyfill } from "event-source-polyfill";

/**
 * ===========================
 * ORDER MANAGER SERVICE
 * ===========================
 */

/**
 * Lấy danh sách đơn hàng mà nhân viên quản lý
 * @returns {Promise} Danh sách đơn hàng
 */
export const getShopOrders = () => {
  return api.get("/ordersManage");
};

/**
 * Kết nối SSE (Server-Sent Events) để nhận realtime order update
 * @param {Function} onMessage - Callback khi có dữ liệu SSE gửi về
 * @returns {EventSource} - Trả về EventSource để có thể đóng khi cần
 */
export const connectOrderSSE = (onMessage) => {
  const token = localStorage.getItem("token");
  const baseURL = api.defaults.baseURL;

  const eventSource = new EventSourcePolyfill(`${baseURL}/ordersManage/sse`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("⚠️ Lỗi parse dữ liệu SSE:", err);
    }
  };

  eventSource.onerror = (error) => {
    console.error("❌ Lỗi SSE:", error);
    eventSource.close();
  };

  return eventSource;
};
/**
 * Chấp nhận đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @returns {Promise}
 */
export const acceptOrder = (orderId) => {
  return api.put(`/ordersManage/${orderId}/accept`);
};

/**
 * Cập nhật trạng thái đơn hàng
 * @param {string} orderId - ID đơn hàng
 * @param {string} status - Trạng thái mới ("SHIPPED" | "DELIVERED" | "CANCELLED")
 * @returns {Promise}
 */
export const updateOrderStatus = (orderId, status) => {
  return api.put(`/ordersManage/${orderId}/status`, { status });
};

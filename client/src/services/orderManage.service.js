import api from "../lib/axios";
import { EventSourcePolyfill } from "event-source-polyfill";

let eventSource = null;

/**
 * Lấy danh sách đơn hàng mà nhân viên quản lý
 */
export const getShopOrders = () => {
  return api.get("/ordersManage");
};

/**
 * Kết nối SSE (Server-Sent Events) để nhận realtime order update
 * @param {Function} onMessage - callback khi có dữ liệu SSE gửi về
 */
export const connectOrderSSE = (onMessage) => {
  const token = localStorage.getItem("token");
  const baseURL = api.defaults.baseURL;

  if (!token) {
    console.error("❌ Không tìm thấy token. Chưa đăng nhập?");
    return;
  }

  // Nếu đã có kết nối rồi thì đóng trước khi mở mới
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSourcePolyfill(`${baseURL}/ordersManage/sse`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    heartbeatTimeout: 300000, // 5 phút - giúp giữ kết nối
  });

  eventSource.onopen = () => {
    console.log("✅ SSE Connected: /ordersManage/sse");
  };

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.error("⚠️ Lỗi parse JSON SSE:", err);
    }
  };

  eventSource.onerror = (error) => {
    console.error("❌ SSE Error:", error);

    // Nếu lỗi (mất mạng, server down) → tự reconnect
    if (eventSource.readyState === EventSource.CLOSED) {
      console.log("🔄 SSE disconnected, trying to reconnect in 3s...");
      setTimeout(() => connectOrderSSE(onMessage), 3000);
    }
  };

  return eventSource;
};

/**
 * Ngắt kết nối SSE khi không còn dùng
 */
export const disconnectOrderSSE = () => {
  if (eventSource) {
    eventSource.close();
    console.log("🛑 SSE disconnected");
  }
};

/**
 * Chấp nhận đơn hàng
 */
export const acceptOrder = (orderId) => {
  return api.patch(`/ordersManage/${orderId}/accept`);
};

/**
 * Cập nhật trạng thái đơn hàng
 */
export const updateOrderStatus = (orderId, status) => {
  return api.patch(`/ordersManage/${orderId}/status`, { status });
};

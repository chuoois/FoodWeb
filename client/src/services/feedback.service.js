import api from "../lib/axios";

// Lấy danh sách feedback của một shop
export const getFeedBackByShop = (shopId) => {
  return api.get(`/shops/${shopId}/feedbacks`);
};

// Gửi feedback cho 1 đơn hàng
export const createFeedback = (orderId, data) => {
  return api.post(`/orders/${orderId}/feedback`, data);
};

// services/order.service.js
import api from "../lib/axios";

// ✅ Checkout (COD hoặc PayOS)
export const checkoutOrder = (data) => {
  return api.post("/checkout", data);
};

// ✅ Lấy danh sách voucher của shop
export const getVouchers = (params) => {
  return api.get("/vouchers", { params });
};

// ✅ Lấy danh sách đơn hàng của user
export const getUserOrders = (params) => {
  return api.get("/orders", { params }); // ⚠️ bỏ /user
};

// ✅ Lấy chi tiết đơn hàng theo orderId
export const getOrderDetail = (orderId) => {
  return api.get(`/orders/${orderId}`);
};

export const getAllCompletedOrders = (params) => {
  return api.get("/getAllOrders", { params });
};


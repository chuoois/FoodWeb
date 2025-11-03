import api from "../lib/axios";

// Tạo voucher mới
// POST http://localhost:9999/api/voucher/create
export const createVoucher = (data) => {
  return api.post("/voucher/create", data);
};

// Lấy danh sách voucher của shop
// GET http://localhost:9999/api/voucher/all?page=1&limit=10
export const getVouchersByShop = (params) => {
  return api.get("/voucher/all", { params });
};

// Cập nhật voucher
// PUT http://localhost:9999/api/voucher/:voucherId
export const updateVoucher = (voucherId, data) => {
  return api.put(`/voucher/${voucherId}`, data);
};

// Xóa voucher
// DELETE http://localhost:9999/api/voucher/:voucherId
export const deleteVoucher = (voucherId) => {
  return api.delete(`/voucher/${voucherId}`);
};

// Cập nhật trạng thái voucher (bật/tắt)
// PATCH http://localhost:9999/api/voucher/:voucherId/status
export const toggleVoucherStatus = (voucherId, is_active) => {
  return api.patch(`/voucher/${voucherId}/status`, { is_active });
};

// Lấy danh sách voucher công khai cho người dùng
// GET http://localhost:9999/api/voucher/public/:shopId?page=1&limit=10
export const getPublicVouchers = (shopId, params) => {
  return api.get(`/voucher/public/${shopId}`, { params });
};
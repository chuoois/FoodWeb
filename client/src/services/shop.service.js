import api from "../lib/axios";

//  Tạo cửa hàng mới
export const createShop = (data) => {
  return api.post("/shop/create", data);
};

//  Lấy danh sách shop theo owner
export const getShopByOwnerID = (params = {}) => {
  return api.get("/shop/get-by-owner", { params });
};

//  Lấy danh sách tất cả manager staff
export const getAllManagerStaffNames = () => {
  return api.get("/shop/managers/names/staff");
};

//  Tạo tài khoản nhân viên (staff)
export const createShopStaff = (data) => {
  return api.post("/shop/staff/create", data);
};

//  Cập nhật danh sách managers của shop
export const updateShopManagers = (shopId, data) => {
  // data = { managers: ["userId1", "userId2"] }
  return api.put(`/shop/${shopId}/managers`, data);
};

//  Xóa shop theo ID
export const deleteShop = (shopId) => {
  return api.delete(`/shop/${shopId}`);
};

//  Lấy danh sách nhân viên do người dùng tạo
export const listStaffByCreator = (params = {}) => {
  return api.get("/shop/staff/list", { params });
};

//  Cập nhật thông tin nhân viên
export const updateStaff = (staffId, data) => {
  return api.put(`/shop/staff/${staffId}`, data);
};

//  Xóa nhân viên theo ID
export const deleteStaff = (staffId) => {
  return api.delete(`/shop/staff/${staffId}`);
};

// Lấy chi tiết cửa hàng theo ID
export const getShopDetailByID = (shopId) => {
  return api.get(`/shop/${shopId}/detail`);
};


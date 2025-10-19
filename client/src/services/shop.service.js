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

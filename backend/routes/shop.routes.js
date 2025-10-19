const express = require("express");
const router = express.Router();
const {
  createShop,
  getShopByOwnerID,
  getAllManagerStaffNames,
  createShopStaff,
  updateManager,
  deleteShop,
  listStaffAccounts
} = require("../controller/store/shop.controller");
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

//  Tạo cửa hàng mới
router.post("/shop/create", authenticate, authorize("STORE_DIRECTOR"), createShop);

//  Lấy danh sách shop theo owner
router.get("/shop/get-by-owner", authenticate, authorize("STORE_DIRECTOR"), getShopByOwnerID);

//  Lấy danh sách tất cả nhân viên quản lý (MANAGER_STAFF)
router.get("/shop/managers/names/staff", authenticate, authorize("STORE_DIRECTOR"), getAllManagerStaffNames);

//  Tạo tài khoản nhân viên (staff)
router.post("/shop/staff/create", authenticate, authorize("STORE_DIRECTOR"), createShopStaff);

//  Cập nhật danh sách managers của shop
router.put("/shop/:shopId/managers", authenticate, authorize("STORE_DIRECTOR"), updateManager);

//  Xóa shop theo ID
router.delete("/shop/:shopId", authenticate, authorize("STORE_DIRECTOR"), deleteShop);

//  Lấy danh sách tài khoản nhân viên (SELLER_STAFF và MANAGER_STAFF) đang làm việc cho các shop
router.get("/shop/staff/accounts", authenticate, authorize("STORE_DIRECTOR"), listStaffAccounts);

module.exports = router;

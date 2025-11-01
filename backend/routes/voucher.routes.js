const express = require("express");
const router = express.Router();
const {
    createVoucher,
    getVouchersByShop,
    updateVoucher,
    deleteVoucher,
    toggleVoucherStatus
} = require("../controller/store/voucher.controller");
const authenticate = require("../middleware/authenticate.middleware");
const authorize = require("../middleware/authorize.middleware");

// Tạo voucher mới
router.post("/voucher/create", authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), createVoucher);

// Lấy danh sách voucher theo shop
router.get("/voucher/all", authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), getVouchersByShop);

// Cập nhật voucher
router.put("/voucher/:voucherId", authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), updateVoucher);

// Xóa voucher
router.delete("/voucher/:voucherId", authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), deleteVoucher);

// Cập nhật trạng thái voucher
router.patch("/voucher/:voucherId/status", authenticate, authorize("STORE_DIRECTOR", "MANAGER_STAFF"), toggleVoucherStatus);

module.exports = router;
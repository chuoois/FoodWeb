const bcrypt = require("bcryptjs");
const Shop = require("../../models/shop.model");
const Account = require("../../models/accout.model");
const Staff = require("../../models/staff.model");
const Role = require("../../models/role.model");

/**
 *  Tạo shop (giữ nguyên code của bạn)
 */
const createShop = async (req, res) => {
  try {
    const {
      name,
      description,
      address, // { street, ward, district, city, province }
      gps,     // { coordinates: [lng, lat] }
      phone,
      logoUrl,
      coverUrl,
      type,
      managers = [] // danh sách manager
    } = req.body;

    const owner = req.user.accountId;

    // ===== VALIDATION =====
    if (!name || !phone) {
      return res.status(400).json({ message: "Tên cửa hàng và số điện thoại là bắt buộc" });
    }

    if (!gps || !gps.coordinates || gps.coordinates.length !== 2) {
      return res.status(400).json({ message: "Tọa độ GPS không hợp lệ. Cần định dạng [lng, lat]" });
    }

    // ===== KIỂM TRA MANAGER ĐÃ CÓ SHOP KHÁC =====
    if (managers.length > 0) {
      const existingShops = await Shop.find({
        managers: { $in: managers },
      }).lean();

      if (existingShops.length > 0) {
        const conflictManagers = new Set();
        existingShops.forEach((shop) => {
          shop.managers.forEach((m) => {
            if (managers.includes(m.toString())) conflictManagers.add(m.toString());
          });
        });

        return res.status(400).json({
          message: "Một hoặc nhiều quản lý đã thuộc về cửa hàng khác",
          conflictManagers: Array.from(conflictManagers),
        });
      }
    }

    // ===== TẠO SHOP MỚI =====
    const newShop = new Shop({
      owner,
      managers,
      name,
      description,
      address,
      gps: {
        type: "Point",
        coordinates: gps.coordinates,
      },
      phone,
      logoUrl,
      coverUrl,
      type,
      status: "PENDING_APPROVAL",
      isFavorite: false,
      rating: 0,
    });

    const savedShop = await newShop.save();

    // ===== CẬP NHẬT TRẠNG THÁI MANAGER =====
    if (managers.length > 0) {
      await Staff.updateMany(
        { _id: { $in: managers } },
        { $set: { isAssigned: true } }
      );
    }

    return res.status(201).json({
      message: "Tạo cửa hàng thành công",
      shop: savedShop,
    });
  } catch (err) {
    console.error("Lỗi khi tạo shop:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 *  Lấy shop theo owner
 */
const getShopByOwnerID = async (req, res) => {
  try {
    const { accountId } = req.user;
    const { status, search } = req.query;
    const filter = { owner: accountId };

    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: "i" };

    const shops = await Shop.find(filter).populate("managers", "full_name");
    return res.status(200).json(shops);
  } catch (err) {
    console.error(" Lỗi khi tìm kiếm cửa hàng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};



module.exports = { createShop, getShopByOwerID };

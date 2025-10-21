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
      managers
    } = req.body;

    const owner = req.user.accountId;

    if (!name || !phone) {
      return res.status(400).json({ message: "Tên cửa hàng và số điện thoại là bắt buộc" });
    }

    if (!gps || !gps.coordinates || gps.coordinates.length !== 2) {
      return res.status(400).json({ message: "Tọa độ GPS không hợp lệ. Cần định dạng [lng, lat]" });
    }

    const newShop = new Shop({
      owner,
      managers,
      name,
      description,
      address,
      gps: {
        type: "Point",
        coordinates: gps.coordinates
      },
      phone,
      logoUrl,
      coverUrl,
      type,
      status: "PENDING_APPROVAL",
      isFavorite: false,
      rating: 0
    });

    const savedShop = await newShop.save();
    return res.status(201).json({
      message: "Tạo cửa hàng thành công",
      shop: savedShop
    });
  } catch (err) {
    console.error("❌ Lỗi khi tạo shop:", err);
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
    console.error("❌ Lỗi khi tìm kiếm cửa hàng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 *  Cập nhật danh sách managers của shop
 */
const updateManager = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { managers } = req.body;
    const { accountId } = req.user;

    if (!Array.isArray(managers)) {
      return res.status(400).json({ message: "Managers phải là một mảng ID người dùng" });
    }

    // Kiểm tra shop có tồn tại và thuộc quyền của owner
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }

    if (shop.owner.toString() !== accountId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa cửa hàng này" });
    }

    // Cập nhật managers
    shop.managers = managers;
    const updatedShop = await shop.save();

    const populatedShop = await updatedShop.populate("managers", "full_name");

    return res.status(200).json({
      message: "Cập nhật danh sách quản lý thành công",
      shop: populatedShop
    });
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật managers:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 *  Xóa shop theo ID
 */
const deleteShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { accountId } = req.user;

    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }

    if (shop.owner.toString() !== accountId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa cửa hàng này" });
    }

    await Shop.findByIdAndDelete(shopId);
    return res.status(200).json({ message: "Xóa cửa hàng thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa shop:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 *  Lấy tất cả nhân viên quản lý (MANAGER_STAFF)
 */
const getAllManagerStaffNames = async (req, res) => {
  try {
    const role = await Role.findOne({ name: "MANAGER_STAFF" });
    if (!role) {
      return res.status(404).json({ message: "Role MANAGER_STAFF not found" });
    }

    const accounts = await Account.find({ role_id: role._id }).select("_id").lean();

    const managerStaff = await Staff.find({
      account_id: { $in: accounts.map(acc => acc._id) },
    }).select("_id full_name").lean();

    return res.status(200).json({
      message: "Get all manager staff successfully",
      count: managerStaff.length,
      data: managerStaff.filter(u => u.full_name),
    });
  } catch (error) {
    console.error("Error in getAllManagerStaffNames:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/**
 *  Tạo nhân viên mới
 */
const createShopStaff = async (req, res) => {
  try {
    const { email, password, confirmPassword, roleName, full_name } = req.body;
    const reqUserId = req.user.accountId;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu xác nhận không khớp" });
    }

    const existingAccount = await Account.findOne({ email });
    if (existingAccount) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = await Role.findOne({ name: roleName });

    const newAccount = new Account({
      email,
      password_hash: hashedPassword,
      provider: "local",
      status: "ACTIVE",
      email_verified: false,
      role_id: role ? role._id : null,
    });
    await newAccount.save();

    const staff = new Staff({
      account_id: newAccount._id,
      full_name,
      phone: null,
      avatar_url: null,
      date_of_birth: null,
      gender: null,
      created_by: reqUserId
    });
    await staff.save();

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 *  Lấy danh sách nhân viên do người dùng tạo
 */
const listStaffByCreator = async (req, res) => {
  try {
    const { accountId } = req.user; // từ middleware xác thực
    const { search, status, page = 1, limit = 10 } = req.query;

    // Bộ lọc
    const filter = { created_by: accountId };
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { full_name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    // Tính tổng
    const totalCount = await Staff.countDocuments(filter);

    // Phân trang
    const staffList = await Staff.find(filter)
      .populate("account_id", "email role")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      message: "Lấy danh sách nhân viên thành công",
      totalCount,
      currentPage: Number(page),
      totalPages: Math.ceil(totalCount / limit),
      data: staffList,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhân viên:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi lấy danh sách nhân viên",
      error: error.message,
    });
  }
};

/**
 *  Cập nhật nhân viên
 */

const updateStaff = async (req, res) => {
  try {
    const { accountId } = req.user;
    const { id } = req.params;
    const updateData = req.body;

    // Kiểm tra tồn tại
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Chỉ cho phép người tạo sửa nhân viên
    if (staff.created_by.toString() !== accountId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền cập nhật nhân viên này" });
    }

    // Cập nhật hợp lệ
    const allowedFields = [
      "full_name",
      "phone",
      "avatar_url",
      "date_of_birth",
      "gender"
    ];

    for (let key in updateData) {
      if (allowedFields.includes(key)) {
        staff[key] = updateData[key];
      }
    }

    const updatedStaff = await staff.save();

    res.status(200).json({
      message: "Cập nhật nhân viên thành công",
      data: updatedStaff,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi cập nhật nhân viên",
      error: error.message,
    });
  }
};

/**
 *  Xóa nhân viên và tài khoản liên kết
 */
const deleteStaff = async (req, res) => {
  try {
    const { accountId } = req.user; // ID người đang đăng nhập
    const { id } = req.params; // ID của staff cần xóa

    // Tìm nhân viên
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: "Không tìm thấy nhân viên" });
    }

    // Chỉ người tạo mới được xóa
    if (staff.created_by.toString() !== accountId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa nhân viên này" });
    }

    // Xóa account liên kết nếu có
    if (staff.account_id) {
      await Account.findByIdAndDelete(staff.account_id);
    }

    // Xóa staff
    await Staff.findByIdAndDelete(id);

    return res.status(200).json({ message: "Xóa nhân viên và tài khoản thành công" });
  } catch (error) {
    console.error("❌ Lỗi khi xóa nhân viên:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa nhân viên",
      error: error.message,
    });
  }
};

module.exports = {
  createShop,
  getShopByOwnerID,
  getAllManagerStaffNames,
  createShopStaff,
  updateManager,
  deleteShop,
  listStaffByCreator,
  updateStaff,
  deleteStaff
};
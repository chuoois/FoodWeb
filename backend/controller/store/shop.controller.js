const bcrypt = require("bcryptjs");
const Shop = require("../../models/shop.model");
const Account = require("../../models/accout.model");
const Staff = require("../../models/staff.model");
const Role = require("../../models/role.model");
const User = require("../../models/user.model");

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

    // lấy shops dưới dạng plain objects
    const shops = await Shop.find(filter).lean();

    // thu tất cả id trong trường managers (có thể là staff._id hoặc account_id)
    const managerIdSet = new Set();
    shops.forEach((s) => {
      if (Array.isArray(s.managers)) {
        s.managers.forEach((m) => {
          if (m) managerIdSet.add(m.toString());
        });
      }
    });

    let staffList = [];
    if (managerIdSet.size > 0) {
      const ids = Array.from(managerIdSet);
      // tìm staff bằng _id hoặc account_id
      staffList = await Staff.find({
        $or: [{ _id: { $in: ids } }, { account_id: { $in: ids } }],
      })
        .select("_id account_id full_name phone")
        .lean();
    }

    // map nhanh: key có thể là _id hoặc account_id (string)
    const staffMap = {};
    staffList.forEach((st) => {
      if (st._id) staffMap[st._id.toString()] = st;
      if (st.account_id) staffMap[st.account_id.toString()] = st;
    });

    // đính kèm chi tiết managers vào mỗi shop
    const shopsWithManagers = shops.map((s) => {
      const managersDetail = (s.managers || []).map((m) => {
        const key = m ? m.toString() : null;
        const st = staffMap[key];
        return st ? { id: key, full_name: st.full_name, phone: st.phone } : { id: key, full_name: null };
      });
      return { ...s, managers: managersDetail };
    });

    return res.status(200).json(shopsWithManagers);
  } catch (err) {
    console.error(" Lỗi khi tìm kiếm cửa hàng:", err);
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

    // ===== TÌM SHOP =====
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }

    // ===== KIỂM TRA QUYỀN CỦA OWNER =====
    if (shop.owner.toString() !== accountId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa cửa hàng này" });
    }

    // ===== XÁC ĐỊNH CÁC MANAGER CŨ & MỚI =====
    const oldManagers = shop.managers.map((m) => m.toString());
    const newManagers = managers.map((m) => m.toString());

    // Những manager bị gỡ bỏ
    const removedManagers = oldManagers.filter((m) => !newManagers.includes(m));
    // Những manager được thêm mới
    const addedManagers = newManagers.filter((m) => !oldManagers.includes(m));

    // ===== CẬP NHẬT TRẠNG THÁI isAssigned =====
    if (removedManagers.length > 0) {
      await Staff.updateMany(
        { account_id: { $in: removedManagers } },
        { $set: { isAssigned: false } }
      );
    }

    if (addedManagers.length > 0) {
      // Kiểm tra xem manager mới có đang được gán ở shop khác không
      const conflictShops = await Shop.find({
        _id: { $ne: shopId },
        managers: { $in: addedManagers },
      }).lean();

      if (conflictShops.length > 0) {
        const conflictManagers = new Set();
        conflictShops.forEach((s) => {
          s.managers.forEach((m) => {
            if (addedManagers.includes(m.toString())) conflictManagers.add(m.toString());
          });
        });

        return res.status(400).json({
          message: "Một hoặc nhiều quản lý đã thuộc về cửa hàng khác",
          conflictManagers: Array.from(conflictManagers),
        });
      }

      await Staff.updateMany(
        { _id: { $in: addedManagers } },
        { $set: { isAssigned: true } }
      );
    }

    // ===== CẬP NHẬT DANH SÁCH MANAGERS TRONG SHOP =====
    shop.managers = newManagers;
    const updatedShop = await shop.save();

    const populatedShop = await updatedShop.populate("managers", "full_name");

    return res.status(200).json({
      message: "Cập nhật danh sách quản lý thành công",
      shop: populatedShop,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật managers:", error);
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

    // ===== TÌM SHOP =====
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }

    // ===== KIỂM TRA QUYỀN XOÁ =====
    if (shop.owner.toString() !== accountId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa cửa hàng này" });
    }

    // ===== CẬP NHẬT TRẠNG THÁI MANAGER TRƯỚC KHI XOÁ SHOP =====
    if (shop.managers && shop.managers.length > 0) {
      await Staff.updateMany(
        { account_id: { $in: shop.managers } },
        { $set: { isAssigned: false } }
      );
    }

    // ===== XOÁ SHOP =====
    await Shop.findByIdAndDelete(shopId);

    return res.status(200).json({ message: "Xóa cửa hàng thành công và đã giải phóng các quản lý" });
  } catch (error) {
    console.error("Lỗi khi xóa shop:", error);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

/**
 *  Lấy tất cả nhân viên quản lý (MANAGER_STAFF)
 */
const getAllManagerStaffNames = async (req, res) => {
  try {
    // lây accountId cua nguoi dung
    const { accountId } = req.user;

    // Tìm role MANAGER_STAFF
    const role = await Role.findOne({ name: "MANAGER_STAFF" });
    if (!role) {
      return res.status(404).json({ message: "Role MANAGER_STAFF not found" });
    }

    // Lấy tất cả account có role MANAGER_STAFF
    const accounts = await Account.find({ role_id: role._id })
      .select("_id")
      .lean();

    // Lấy danh sách staff tương ứng (chưa được gán)
    const managerStaff = await Staff.find({
      account_id: { $in: accounts.map(acc => acc._id) },
      isAssigned: false,
      created_by: { $in: accountId } // Lấy những staff do người dùng hiện tại tạo
    })
      .select("_id full_name account_id")
      .lean();

    // Trả kết quả
    return res.status(200).json({
      message: "Get all available manager staff successfully",
      count: managerStaff.length,
      data: managerStaff.filter(u => u.full_name), // chỉ trả staff có tên
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
    const { email, password, confirmPassword, roleName, full_name, phone } = req.body;
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
      email_verified: true,
      role_id: role ? role._id : null,
    });
    await newAccount.save();

    const staff = new Staff({
      account_id: newAccount._id,
      full_name,
      phone: phone || null,
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
    console.error(" Lỗi khi xóa nhân viên:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi khi xóa nhân viên",
      error: error.message,
    });
  }
};

/**
 *  Lấy shop detail theo ID 
 */

const getShopDetailByID = async (req, res) => {
  try {
    const { shopId } = req.params;
    // lấy shop dạng plain object để tiện xử lý
    const shop = await Shop.findById(shopId).lean();
    if (!shop) {
      return res.status(404).json({ message: "Không tìm thấy cửa hàng" });
    }

    // ===== resolve owner (có thể là staff._id hoặc account_id) =====
    let ownerDetail = null;
    if (shop.owner) {
      const ownerKey = shop.owner.toString();
      // tìm trong Staff theo _id hoặc account_id
      ownerDetail = await User.findOne({
        $or: [{ _id: ownerKey }, { account_id: ownerKey }],
      })
        .select("full_name phone")
        .lean();

      // nếu không phải Staff thì thử lấy từ Account (ví dụ owner là account)
      if (!ownerDetail) {
        const acc = await Account.findById(ownerKey).select("_id email").lean();
        if (acc) ownerDetail = { id: acc._id.toString(), email: acc.email };
      }
    }

    // ===== resolve managers (mảng có thể chứa staff._id hoặc account_id) =====
    const managersDetail = [];
    if (Array.isArray(shop.managers) && shop.managers.length > 0) {
      const ids = shop.managers.map((m) => m && m.toString()).filter(Boolean);
      // tìm tất cả Staff khớp _id hoặc account_id
      const staffList = await Staff.find({
        $or: [{ _id: { $in: ids } }, { account_id: { $in: ids } }],
      })
        .select("_id account_id full_name phone")
        .lean();

      const staffMap = {};
      staffList.forEach((st) => {
        if (st._id) staffMap[st._id.toString()] = st;
        if (st.account_id) staffMap[st.account_id.toString()] = st;
      });

      shop.managers.forEach((m) => {
        const key = m ? m.toString() : null;
        const st = key ? staffMap[key] : null;
        if (st) {
          managersDetail.push({ id: key, full_name: st.full_name, phone: st.phone });
        } else {
          // không tìm thấy staff tương ứng -> trả về id (frontend có thể hiển thị "Không có tên")
          managersDetail.push({ id: key, full_name: null, phone: null });
        }
      });
    }

    // trả về shop với owner/managers đã resolve
    return res.status(200).json({
      ...shop,
      owner: ownerDetail || null,
      managers: managersDetail,
    });
  } catch (err) {
    console.error(" Lỗi khi lấy chi tiết cửa hàng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

module.exports = {
  createShop,
  getShopByOwnerID,
  getAllManagerStaffNames,
  getShopDetailByID,
  createShopStaff,
  updateManager,
  deleteShop,
  listStaffByCreator,
  updateStaff,
  deleteStaff
};
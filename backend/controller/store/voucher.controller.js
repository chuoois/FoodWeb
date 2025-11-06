const Voucher = require("../../models/voucher.model");
const Shop = require("../../models/shop.model");
const Staff = require("../../models/staff.model");
const User = require("../../models/user.model");

const mongoose = require("mongoose");

// Helper function: Lấy shop_id từ staff/owner
const getShopIdByStaff = async (accountId) => {
  const staff = await Staff.findOne({account_id:accountId}).select("_id");
  
  const shop = await Shop.findOne(
      { managers: staff._id }

  );
  return shop ? shop._id : null;
};

// Helper function: Kiểm tra quyền truy cập shop
const checkShopAccess = async (accountId, shopId) => {
  const shop = await Shop.findById(shopId);
  if (!shop) {
    throw new Error("Shop not found");
  }

  // ✅ phải có await ở đây
  const manage = await Staff.findOne({ account_id: accountId }).select("_id");
  if (!manage) {
    throw new Error("Staff not found for this account");
  }

  const mnId = manage._id;
  console.log("Staff ID:", mnId);

  // ✅ xác định chủ shop (nếu có trường owner)
  const isOwner = shop.owner_id?.toString() === accountId.toString();

  const isManager = shop.managers.some(
    (managerId) => managerId.toString() === mnId.toString()
  );
  console.log("isManager:", isManager);

  if (!isOwner && !isManager) {
    throw new Error("Access denied. You are not authorized to manage this shop");
  }

  return shop;
};


// Tạo voucher mới
const createVoucher = async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_discount, start_date, end_date, usage_limit } = req.body;
    const { accountId } = req.user;

    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    // Kiểm tra shop có tồn tại và ACTIVE không
    const shop = await Shop.findById(shop_id);
    if (!shop) {
      return res.status(404).json({ message: "Cửa hàng không tồn tại" });
    }

    if (shop.status !== "ACTIVE") {
      return res.status(400).json({ message: "Cửa hàng không hoạt động" });
    }

    // Kiểm tra code voucher đã tồn tại chưa
    const existingVoucher = await Voucher.findOne({ 
      code: code.toUpperCase(),
      shop_id 
    });
    if (existingVoucher) {
      return res.status(400).json({
        message: "Mã voucher đã tồn tại trong cửa hàng này",
      });
    }

    // Validate discount_value
    if (discount_type === "PERCENT" && discount_value > 100) {
      return res.status(400).json({
        message: "Phần trăm giảm giá không được vượt quá 100%",
      });
    }

    if (discount_value <= 0) {
      return res.status(400).json({
        message: "Giá trị giảm giá phải lớn hơn 0",
      });
    }

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    const voucher = await Voucher.create({
      shop_id,
      code: code.toUpperCase(),
      description: description || "",
      discount_type,
      discount_value,
      min_order_amount: min_order_amount || 0,
      max_discount: max_discount || null,
      start_date,
      end_date,
      usage_limit: usage_limit || 0,
    });

    return res.status(201).json({
      message: "Tạo voucher thành công",
      data: voucher,
    });
  } catch (error) {
    console.error("Lỗi khi tạo voucher:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy tất cả voucher của shop
const getVouchersByShop = async (req, res) => {
  try {
    const { accountId } = req.user;
    const { is_active, page = 1, limit = 10 } = req.query;

    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    const filter = { shop_id };
    if (is_active !== undefined) {
      filter.is_active = is_active === "true";
    }

    const skip = (page - 1) * limit;

    const vouchers = await Voucher.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Voucher.countDocuments(filter);

    return res.status(200).json({
      message: "Lấy danh sách voucher thành công",
      data: {
        vouchers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy chi tiết một voucher
const getVoucherById = async (req, res) => {
  try {
    const { voucher_id } = req.params;
    const { accountId } = req.user;

    const voucher = await Voucher.findById(voucher_id);
    if (!voucher) {
      return res.status(404).json({
        message: "Voucher không tồn tại",
      });
    }

    // Kiểm tra quyền truy cập
    await checkShopAccess(accountId, voucher.shop_id);

    return res.status(200).json({
      message: "Lấy thông tin voucher thành công",
      data: voucher,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin voucher:", error);
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Cập nhật voucher
const updateVoucher = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { accountId } = req.user;
    const updateData = req.body;

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        message: "Voucher không tồn tại",
      });
    }

    // Kiểm tra quyền truy cập
    await checkShopAccess(accountId, voucher.shop_id);

    // Không cho phép thay đổi shop_id
    delete updateData.shop_id;

    // Validate nếu cập nhật code
    if (updateData.code && updateData.code !== voucher.code) {
      const existingVoucher = await Voucher.findOne({ 
        code: updateData.code.toUpperCase(),
        shop_id: voucher.shop_id,
        _id: { $ne: voucherId }
      });
      if (existingVoucher) {
        return res.status(400).json({
          message: "Mã voucher đã tồn tại trong cửa hàng này",
        });
      }
      updateData.code = updateData.code.toUpperCase();
    }

    // Validate discount_value
    if (updateData.discount_type === "PERCENT" && updateData.discount_value > 100) {
      return res.status(400).json({
        message: "Phần trăm giảm giá không được vượt quá 100%",
      });
    }

    if (updateData.discount_value !== undefined && updateData.discount_value <= 0) {
      return res.status(400).json({
        message: "Giá trị giảm giá phải lớn hơn 0",
      });
    }

    // Validate dates
    const startDate = updateData.start_date ? new Date(updateData.start_date) : voucher.start_date;
    const endDate = updateData.end_date ? new Date(updateData.end_date) : voucher.end_date;
    
    if (startDate >= endDate) {
      return res.status(400).json({
        message: "Ngày kết thúc phải sau ngày bắt đầu",
      });
    }

    const updatedVoucher = await Voucher.findByIdAndUpdate(
      voucherId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Cập nhật voucher thành công",
      data: updatedVoucher,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật voucher:", error);
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Xóa voucher
const deleteVoucher = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { accountId } = req.user;

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        message: "Voucher không tồn tại",
      });
    }

    // Kiểm tra quyền truy cập
    await checkShopAccess(accountId, voucher.shop_id);

    await Voucher.findByIdAndDelete(voucherId);

    return res.status(200).json({
      message: "Xóa voucher thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa voucher:", error);
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Kích hoạt/vô hiệu hóa voucher
const toggleVoucherStatus = async (req, res) => {
  try {
    const { voucherId } = req.params;
    const { accountId } = req.user;
 

    const voucher = await Voucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({
        message: "Voucher không tồn tại",
      });
    }

    // Kiểm tra quyền truy cập
    await checkShopAccess(accountId, voucher.shop_id);
console.log(voucher.is_active)
    voucher.is_active = !voucher.is_active;
    await voucher.save();

  return res.status(200).json({
  message: `${voucher.is_active ? "Kích hoạt" : "Vô hiệu hóa"} voucher thành công`,
  data: voucher,
});
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái voucher:", error);
    if (error.message.includes("Access denied")) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy thống kê voucher của shop
const getVoucherStatistics = async (req, res) => {
  try {
    const { accountId } = req.user;

    const shop_id = await getShopIdByStaff(accountId);
    if (!shop_id) {
      return res.status(404).json({ message: "Shop not found for this staff" });
    }

    const now = new Date();

    const statistics = await Voucher.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shop_id) } },
      {
        $facet: {
          total: [{ $count: "count" }],
          active: [
            { $match: { is_active: true } },
            { $count: "count" }
          ],
          expired: [
            { $match: { end_date: { $lt: now } } },
            { $count: "count" }
          ],
          ongoing: [
            {
              $match: {
                is_active: true,
                start_date: { $lte: now },
                end_date: { $gte: now }
              }
            },
            { $count: "count" }
          ],
          totalUsage: [
            { $group: { _id: null, total: { $sum: "$used_count" } } }
          ]
        }
      }
    ]);

    const stats = {
      total: statistics[0].total[0]?.count || 0,
      active: statistics[0].active[0]?.count || 0,
      expired: statistics[0].expired[0]?.count || 0,
      ongoing: statistics[0].ongoing[0]?.count || 0,
      totalUsage: statistics[0].totalUsage[0]?.total || 0,
    };

    return res.status(200).json({
      message: "Lấy thống kê voucher thành công",
      data: stats,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê voucher:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Validate voucher (cho user khi áp dụng)
const validateVoucher = async (req, res) => {
  try {
    const { code, shop_id, order_amount } = req.body;

    if (!code || !shop_id || !order_amount) {
      return res.status(400).json({
        message: "Vui lòng cung cấp đầy đủ thông tin: code, shop_id, order_amount",
      });
    }

    const voucher = await Voucher.findOne({ 
      code: code.toUpperCase(), 
      shop_id 
    });

    if (!voucher) {
      return res.status(404).json({
        message: "Mã voucher không tồn tại",
      });
    }

    const now = new Date();
    const errors = [];

    // Kiểm tra các điều kiện
    if (!voucher.is_active) {
      errors.push("Voucher chưa được kích hoạt");
    }

    if (voucher.start_date > now) {
      errors.push("Voucher chưa đến thời gian sử dụng");
    }

    if (voucher.end_date < now) {
      errors.push("Voucher đã hết hạn");
    }

    if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
      errors.push("Voucher đã hết lượt sử dụng");
    }

    if (order_amount < voucher.min_order_amount) {
      errors.push(`Giá trị đơn hàng tối thiểu là ${voucher.min_order_amount.toLocaleString('vi-VN')}đ`);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Voucher không hợp lệ",
        errors,
      });
    }

    // Tính toán giá trị giảm giá
    let discountAmount = 0;
    if (voucher.discount_type === "PERCENT") {
      discountAmount = (order_amount * voucher.discount_value) / 100;
      if (voucher.max_discount && discountAmount > voucher.max_discount) {
        discountAmount = voucher.max_discount;
      }
    } else {
      discountAmount = voucher.discount_value;
    }

    return res.status(200).json({
      message: "Voucher hợp lệ",
      data: {
        voucher,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        finalAmount: parseFloat((order_amount - discountAmount).toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Lỗi khi validate voucher:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Áp dụng voucher (tăng used_count)
const applyVoucher = async (req, res) => {
  try {
    const { voucher_id } = req.params;

    const voucher = await Voucher.findById(voucher_id);
    if (!voucher) {
      return res.status(404).json({
        message: "Voucher không tồn tại",
      });
    }

    // Kiểm tra usage limit
    if (voucher.usage_limit > 0 && voucher.used_count >= voucher.usage_limit) {
      return res.status(400).json({
        message: "Voucher đã hết lượt sử dụng",
      });
    }

    voucher.used_count += 1;
    await voucher.save();

    return res.status(200).json({
      message: "Áp dụng voucher thành công",
      data: voucher,
    });
  } catch (error) {
    console.error("Lỗi khi áp dụng voucher:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// Lấy danh sách voucher công khai của shop (cho user xem)
const getPublicVouchers = async (req, res) => {
  try {
    const { shop_id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const shop = await Shop.findById(shop_id);
    if (!shop) {
      return res.status(404).json({ message: "Cửa hàng không tồn tại" });
    }

    const now = new Date();
    const filter = {
      shop_id,
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now }
    };

    const skip = (page - 1) * limit;

    const vouchers = await Voucher.find(filter)
      .select('-used_count -usage_limit') // Ẩn thông tin nhạy cảm
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Voucher.countDocuments(filter);

    return res.status(200).json({
      message: "Lấy danh sách voucher thành công",
      data: {
        vouchers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách voucher công khai:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = {
  createVoucher,
  getVouchersByShop,
  getVoucherById,
  updateVoucher,
  deleteVoucher,
  toggleVoucherStatus,
  getVoucherStatistics,
  validateVoucher,
  applyVoucher,
  getPublicVouchers
};
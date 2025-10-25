const Account = require("../models/accout.model");
const Role = require("../models/role.model");

const listAccounts = async (req, res) => {
  try {
    const { search, role, status, page = 1 } = req.query;
    const limit = 8;
    const skip = (page - 1) * limit;

    const query = {};

    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    if (role) {
      query.role_id = role;
    }

    if (status) {
      query.status = status;
    }

    const accounts = await Account.find(query)
      .populate("role_id", "name description")
      .select("email status email_verified role_id createdAt provider")
      .skip(skip)
      .limit(limit);

    const total = await Account.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // 🔹 Lấy thêm danh sách role để gửi về frontend
    const roles = await Role.find({}, "_id name description");

    return res.json({
      accounts,
      roles,           // ✅ thêm dòng này
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



const updateAccountStatus = async (req, res) => {
  try {
    const { accountId } = req.params;
    if (!accountId) {
      return res.status(400).json({ message: "Thiếu account_id" });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    if (account.status === "PENDING") {
      return res.status(400).json({ message: "Không thể cập nhật trạng thái từ PENDING" });
    }

    const newStatus = account.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { status: newStatus },
      { new: true }
    ).populate("role_id", "name description");

    return res.json({ message: "Cập nhật trạng thái thành công", account: updatedAccount });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const updateAccountRole = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { role_id } = req.body;

    if (!accountId || !role_id) {
      return res.status(400).json({ message: "Thiếu accountId hoặc role_id" });
    }

    const account = await Account.findById(accountId);
    if (!account) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    // Cập nhật role
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { role_id },
      { new: true }
    ).populate("role_id", "name description");

    return res.json({
      message: "Cập nhật vai trò thành công",
      account: updatedAccount
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listAccounts, updateAccountStatus, updateAccountRole };
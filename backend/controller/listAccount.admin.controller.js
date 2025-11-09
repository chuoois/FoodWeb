const Account = require("../models/accout.model");
const Role = require("../models/role.model");

const listAccounts = async (req, res) => {
  try {
    const { search, role, status, page = 1 } = req.query;
    const limit = 8;
    const skip = (page - 1) * limit;

    const query = {
      status: { $ne: "PENDING" } // 🔹 loại bỏ tài khoản pending
    };

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

    const roles = await Role.find({}, "_id name description");

    return res.json({
      accounts,
      roles,
      totalPages,
      currentPage: parseInt(page),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


const listPendingAccounts = async (req, res) => {
  try {
    const { search, page = 1 } = req.query;
    const limit = 8;
    const skip = (page - 1) * limit;

    const query = { status: "PENDING" }; // 🔹 chỉ lấy tài khoản pending

    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    const accounts = await Account.find(query)
      .populate("role_id", "name description")
      .select("email status email_verified role_id createdAt provider")
      .skip(skip)
      .limit(limit);

    const total = await Account.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return res.json({
      accounts,
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

    // Chuyển trạng thái: ACTIVE <-> INACTIVE
    // Nếu đang PENDING, có thể đổi thành ACTIVE luôn
    let newStatus;
    if (account.status === "ACTIVE") {
      newStatus = "INACTIVE";
    } else {
      newStatus = "ACTIVE";
    }

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

module.exports = { listAccounts, listPendingAccounts, updateAccountStatus, updateAccountRole };
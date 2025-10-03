const Account = require("../models/accout.model");
const Role = require("../models/role.model");

const listAccounts = async (req, res) => {
  try {
    const accounts = await Account.find()
      .populate("role_id", "name description")
      .select("email status email_verified role_id createdAt");
    return res.json({ accounts });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listAccounts };
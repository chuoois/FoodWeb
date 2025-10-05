const User = require("../models/user.model");

const getProfile = async (req, res) => {
  try {
    const accountId = req.params.account_id;
    if (!accountId) {
      return res.status(400).json({ message: "Thiếu account_id" });
    }
    const user = await User.findOne({ account_id: accountId })
      .select("full_name phone avatar_url date_of_birth gender")
      
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const accountId = req.params.account_id;
    if (!accountId) {
      return res.status(400).json({ message: "Thiếu account_id" });
    }
    const { full_name, phone, date_of_birth, gender, avatar_url } = req.body;
    const updates = {};

    if (full_name !== undefined) updates.full_name = full_name;

    if (phone !== undefined) {
      const phoneOwner = await User.findOne({ phone });
      if (phoneOwner && phoneOwner.account_id.toString() !== accountId.toString()) {
        return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
      }
      updates.phone = phone;
    }

    if (date_of_birth !== undefined) {
      const d = new Date(date_of_birth);
      if (isNaN(d.getTime())) return res.status(400).json({ message: "Ngày sinh không hợp lệ" });
      updates.date_of_birth = d;
    }

    if (gender !== undefined) {
      const allowed = ["MALE", "FEMALE", "OTHER"];
      if (!allowed.includes(gender)) {
        return res.status(400).json({ message: "Giới tính không hợp lệ" });
      }
      updates.gender = gender;
    }

    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url;
    }

    const updatedUser = await User.findOneAndUpdate(
      { account_id: accountId },
      { $set: updates },
      { new: true }
    )

    if (!updatedUser) return res.status(404).json({ message: "Không tìm thấy user" });

    return res.json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };
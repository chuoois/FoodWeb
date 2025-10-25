const User = require("../models/user.model");

const getProfile = async (req, res) => {
  try {
    const accountId = req.params.account_id;
    if (!accountId) {
      return res.status(400).json({ message: "Thiếu account_id" });
    }

    const user = await User.findOne({ account_id: accountId })
      .select("full_name phone avatar_url date_of_birth gender");

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

    // --- FULL NAME ---
    if (full_name !== undefined) {
      if (full_name.trim().length < 2) {
        return res.status(400).json({ message: "Tên phải có ít nhất 2 ký tự" });
      }
      updates.full_name = full_name.trim();
    }

    // --- PHONE VALIDATION ---
    if (phone !== undefined) {
      const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-9])[0-9]{7}$/;
      if (!vnPhoneRegex.test(phone)) {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ (theo định dạng Việt Nam)" });
      }

      const phoneOwner = await User.findOne({ phone });
      if (phoneOwner && phoneOwner.account_id.toString() !== accountId.toString()) {
        return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
      }
      updates.phone = phone;
    }

    // --- DATE OF BIRTH VALIDATION (string YYYY-MM-DD) ---
    if (date_of_birth !== undefined) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date_of_birth)) {
        return res.status(400).json({ message: "Định dạng ngày sinh phải là YYYY-MM-DD" });
      }

      const dob = new Date(date_of_birth);
      if (isNaN(dob.getTime())) {
        return res.status(400).json({ message: "Ngày sinh không hợp lệ" });
      }

      const today = new Date();
      if (dob > today) {
        return res.status(400).json({ message: "Ngày sinh không được ở tương lai" });
      }

      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      const dayDiff = today.getDate() - dob.getDate();
      const isUnder10 = age < 10 || (age === 10 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)));

      if (isUnder10) {
        return res.status(400).json({ message: "Tuổi phải từ 10 trở lên" });
      }

      updates.date_of_birth = date_of_birth; // lưu nguyên dạng "YYYY-MM-DD"
    }

    // --- GENDER VALIDATION ---
    if (gender !== undefined) {
      const allowed = ["MALE", "FEMALE", "OTHER"];
      if (!allowed.includes(gender)) {
        return res.status(400).json({ message: "Giới tính không hợp lệ" });
      }
      updates.gender = gender;
    }

    // --- AVATAR URL ---
    if (avatar_url !== undefined) {
      updates.avatar_url = avatar_url.trim();
    }

    // --- UPDATE USER ---
    const updatedUser = await User.findOneAndUpdate(
      { account_id: accountId },
      { $set: updates },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    return res.json({ message: "Cập nhật thành công", user: updatedUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile };

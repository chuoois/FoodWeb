const mongoose = require("mongoose");
const User = require("../models/user.model");
const UserAddress = require("../models/userAddress.model");

// GET PROFILE + ADDRESSES
const getProfile = async (req, res) => {
  try {
    const accountId = req.params.account_id;
    if (!accountId) return res.status(400).json({ message: "Thiếu account_id" });

    const user = await User.findOne({ account_id: accountId })
      .select("full_name phone avatar_url date_of_birth gender");

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const addresses = await UserAddress.find({ user: user._id })
      .select("address gps isDefault")
      .sort({ isDefault: -1, createdAt: -1 });

    return res.json({ user, addresses });
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};

// UPDATE PROFILE + MANAGE ADDRESSES
const updateProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const accountId = req.params.account_id;
    if (!accountId) return res.status(400).json({ message: "Thiếu account_id" });

    const { full_name, phone, date_of_birth, gender, avatar_url, addresses } = req.body;
    const updates = {};

    // === VALIDATE USER FIELDS (giữ nguyên như cũ) ===
    if (full_name !== undefined) {
      if (full_name.trim().length < 2)
        return res.status(400).json({ message: "Tên phải có ít nhất 2 ký tự" });
      updates.full_name = full_name.trim();
    }

    if (phone !== undefined) {
      const vnPhoneRegex = /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5|8|9]|9[0-9])[0-9]{7}$/;
      if (!vnPhoneRegex.test(phone))
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });

      const phoneOwner = await User.findOne({ phone });
      if (phoneOwner && phoneOwner.account_id.toString() !== accountId)
        return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });

      updates.phone = phone;
    }

    if (date_of_birth !== undefined) {
      const regex = /^\d{4}-\d{2}-\d{2}$/;
      if (!regex.test(date_of_birth))
        return res.status(400).json({ message: "Định dạng ngày sinh phải là YYYY-MM-DD" });

      const dob = new Date(date_of_birth);
      if (isNaN(dob.getTime()))
        return res.status(400).json({ message: "Ngày sinh không hợp lệ" });

      const today = new Date();
      if (dob > today) return res.status(400).json({ message: "Ngày sinh không được ở tương lai" });

      const age = today.getFullYear() - dob.getFullYear();
      const isUnder10 = age < 10 || (age === 10 && (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())));
      if (isUnder10) return res.status(400).json({ message: "Tuổi phải từ 10 trở lên" });

      updates.date_of_birth = date_of_birth;
    }

    if (gender !== undefined && !["MALE", "FEMALE", "OTHER"].includes(gender))
      return res.status(400).json({ message: "Giới tính không hợp lệ" });

    if (gender) updates.gender = gender;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url.trim();

    // === XỬ LÝ ĐỊA CHỈ ===
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    if (Array.isArray(addresses)) {
      // Kiểm tra tối đa 3 địa chỉ
      if (addresses.length > 3)
        return res.status(400).json({ message: "Chỉ được lưu tối đa 3 địa chỉ" });

      // Đếm số địa chỉ mặc định
      const defaultCount = addresses.filter(a => a.isDefault).length;
      if (defaultCount > 1)
        return res.status(400).json({ message: "Chỉ được chọn 1 địa chỉ mặc định" });

      // Xóa tất cả địa chỉ cũ
      await UserAddress.deleteMany({ user: user._id }, { session });

      // Thêm địa chỉ mới
      const addressDocs = addresses.map(addr => ({
        user: user._id,
        address: {
          street: addr.address?.street?.trim(),
          ward: addr.address?.ward?.trim(),
          district: addr.address?.district?.trim(),
          city: addr.address?.city?.trim(),
          province: addr.address?.province?.trim(),
        },
        gps: {
          type: "Point",
          coordinates: [parseFloat(addr.gps?.lng), parseFloat(addr.gps?.lat)]
        },
        isDefault: !!addr.isDefault
      })).filter(a => a.address.street && a.gps.coordinates.every(c => !isNaN(c)));

      if (addressDocs.length > 0) {
        await UserAddress.insertMany(addressDocs, { session });
      }
    }

    // === CẬP NHẬT USER ===
    const updatedUser = await User.findOneAndUpdate(
      { account_id: accountId },
      { $set: updates },
      { new: true, session }
    );

    await session.commitTransaction();
    return res.json({ message: "Cập nhật thành công", user: updatedUser });

  } catch (error) {
    await session.abortTransaction();
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = { getProfile, updateProfile };
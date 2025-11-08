// controllers/profile.controller.js
const User = require("../models/user.model");
const UserAddress = require("../models/userAddress.model");
const Account = require("../models/accout.model");


const getProfile = async (req, res) => {
  try {
    const accountId = req.user.accountId;

    const user = await User.findOne({ account_id: accountId })
      .select("full_name phone avatar_url date_of_birth gender");

    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const account = await Account.findById(accountId)
      .select("email provider");

    if (!account) return res.status(404).json({ message: "Không tìm thấy tài khoản" });

    return res.json({
      user: {
        ...user.toObject(),
        email: account.email,
        provider: account.provider,
        // username = email → không cần thêm field
      }
    });
  } catch (error) {
    console.error("Lỗi getProfile:", error);
    return res.status(500).json({ message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const { full_name, phone, date_of_birth, gender, avatar_url } = req.body;
    const updates = {};

    // === VALIDATE (giữ nguyên như cũ) ===
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
      const isUnder10 = age < 10 || (age === 10 && (today.getMonth() < dob.getMonth() || 
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())));
      if (isUnder10) return res.status(400).json({ message: "Tuổi phải từ 10 trở lên" });

      updates.date_of_birth = date_of_birth;
    }

    if (gender !== undefined && !["MALE", "FEMALE", "OTHER"].includes(gender))
      return res.status(400).json({ message: "Giới tính không hợp lệ" });

    if (gender) updates.gender = gender;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url.trim();

    const updatedUser = await User.findOneAndUpdate(
      { account_id: accountId },
      { $set: updates },
      { new: true }
    ).select("full_name phone avatar_url date_of_birth gender");

    return res.json({ message: "Cập nhật hồ sơ thành công", user: updatedUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: error.message });
  }
};

const getAddresses = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const addresses = await UserAddress.find({ user: user._id })
      .select("address gps isDefault")
      .sort({ isDefault: -1, createdAt: -1 });

    return res.json({ addresses });
  } catch (error) {
    console.error("Lỗi getAddresses:", error);
    return res.status(500).json({ message: error.message });
  }
};

const createAddress = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const { address, gps, isDefault } = req.body;

    const count = await UserAddress.countDocuments({ user: user._id });
    if (count >= 3) return res.status(400).json({ message: "Chỉ được lưu tối đa 3 địa chỉ" });

    if (isDefault) {
      await UserAddress.updateMany({ user: user._id }, { isDefault: false });
    }

    const newAddress = await UserAddress.create({
      user: user._id,
      address: {
        street: address?.street?.trim(),
        ward: address?.ward?.trim(),
        district: address?.district?.trim(),
        city: address?.city?.trim(),
        province: address?.province?.trim(),
      },
      gps: {
        type: "Point",
        coordinates: [parseFloat(gps?.lng), parseFloat(gps?.lat)]
      },
      isDefault: !!isDefault
    });

    return res.status(201).json({ message: "Thêm địa chỉ thành công", address: newAddress });
  } catch (error) {
    console.error("Lỗi createAddress:", error);
    return res.status(500).json({ message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const { addrId } = req.params;
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const { address, gps, isDefault } = req.body;

    const updateData = {
      "address.street": address?.street?.trim(),
      "address.ward": address?.ward?.trim(),
      "address.district": address?.district?.trim(),
      "address.city": address?.city?.trim(),
      "address.province": address?.province?.trim(),
      "gps.coordinates": [parseFloat(gps?.lng), parseFloat(gps?.lat)],
    };

    if (isDefault !== undefined) {
      if (isDefault) {
        await UserAddress.updateMany({ user: user._id }, { isDefault: false });
      }
      updateData.isDefault = !!isDefault;
    }

    const updated = await UserAddress.findOneAndUpdate(
      { _id: addrId, user: user._id },
      { $set: updateData },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

    return res.json({ message: "Cập nhật thành công", address: updated });
  } catch (error) {
    console.error("Lỗi updateAddress:", error);
    return res.status(500).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const { addrId } = req.params;
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const deleted = await UserAddress.findOneAndDelete({ _id: addrId, user: user._id });
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy địa chỉ" });

    if (deleted.isDefault) {
      const first = await UserAddress.findOne({ user: user._id }).sort({ createdAt: 1 });
      if (first) await UserAddress.updateOne({ _id: first._id }, { isDefault: true });
    }

    return res.json({ message: "Xóa thành công" });
  } catch (error) {
    console.error("Lỗi deleteAddress:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { getProfile, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress };
const Shop = require("../../models/shop.model");

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
      type
    } = req.body;

    // Lấy owner từ token (được middleware auth thêm vào)
    const owner = req.user.accountId;

    // Kiểm tra thông tin cơ bản
    if (!name || !phone) {
      return res.status(400).json({ message: "Tên cửa hàng và số điện thoại là bắt buộc" });
    }

    if (!gps || !gps.coordinates || gps.coordinates.length !== 2) {
      return res.status(400).json({ message: "Tọa độ GPS không hợp lệ. Cần định dạng [lng, lat]" });
    }

    // Tạo mới cửa hàng
    const newShop = new Shop({
      owner,
      name,
      description,
      address: {
        street: address?.street,
        ward: address?.ward,
        district: address?.district,
        city: address?.city,
        province: address?.province
      },
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
      // Lỗi trùng phone
      return res.status(400).json({ message: "Số điện thoại đã được sử dụng" });
    }

    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

const getShopByOwerID = async (req, res) => {
  try {
    const { accountId } = req.user;
    const shop = await Shop.findOne({ owner: accountId });
    return res.status(200).json(shop);
  } catch (err) {
    console.error("Lỗi khi tìm kiếm cửa hàng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};



module.exports = { createShop, getShopByOwerID };
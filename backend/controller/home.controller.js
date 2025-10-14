const { findNearbyShops, searchByKeyword } = require("../services/shop.service");
const Shop = require("../models/shop.model");
// Định nghĩa vị trí mặc định (ĐH FPT Hà Nội) bằng biến môi trường
const DEFAULT_LOCATION = {
    lat: parseFloat(process.env.DEFAULT_LAT || '21.0135'),
    lng: parseFloat(process.env.DEFAULT_LNG || '105.5262')
};

const getNearbyShopsByCoords = async (req, res) => {
  try {
    const limit = 20;
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: "Missing lat/lng" });
    }

    const shops = await findNearbyShops(parseFloat(lat), parseFloat(lng)).limit(limit);
   
    res.json({ success: true, shops });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const searchHome = async (req, res) => {
    try {
        const { q, lat, lng, limit, page } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, message: "Từ khóa tìm kiếm quán/món ăn là bắt buộc." });
        }

        const options = {
            limit: parseInt(limit) || 10,
            page: parseInt(page) || 1
        };

        let locationToSearch;

        if (lat && lng) {
            // Nếu người dùng cung cấp vị trí, dùng vị trí đó
            locationToSearch = { lat: parseFloat(lat), lng: parseFloat(lng) };
        } else {
            // Nếu không, dùng vị trí mặc định
            locationToSearch = DEFAULT_LOCATION;
        }

        // Luôn gọi hàm tìm kiếm và tính toán mới
        const result = await searchByKeyword(q, locationToSearch, options);

        res.json({ success: true, data: result });
    } catch (err) {
        console.error("Search Error:", err);
        res.status(500).json({ success: false, message: "Đã có lỗi xảy ra." });
    }
};

const getShopsByRate = async (req, res) => {
    try {
        const shops = await Shop.find().sort({ rating: -1 }).limit(8);
        res.json({ success: true, shops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getNearbyShopsByCoords, searchHome,getShopsByRate };



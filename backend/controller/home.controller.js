const { findNearbyShops, searchByKeyword,getShopDetailsWithMenu } = require("../services/shop.service");
const Shop = require("../models/shop.model");
const Food = require("../models/food.model");
const FoodCategory = require("../models/foodCategory.model");
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

    const shops = await findNearbyShops(parseFloat(lat), parseFloat(lng));
   
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

const getShopsByType = async (req, res) => {
    try {
        const {type,lat,lng } = req.query;
        let newLat, newLng ;
        if (!type) {
            console.log('Type param:', type);
            return res.status(400).json({ success: false, message: "Loại quán là bắt buộc." });
        }
        if (!lat || !lng) {
            newLat = DEFAULT_LOCATION.lat;
            newLng = DEFAULT_LOCATION.lng;
        } else {
            newLat = parseFloat(lat);
            newLng = parseFloat(lng);
        }
    // Pass `type` to service so DB filters before expensive OSRM matrix call
    const shops = await findNearbyShops(parseFloat(newLat), parseFloat(newLng), 5000, 20, type);
    res.json({ success: true, shopsByType: shops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getShopsByRate = async (req, res) => {
    try {
        const shops = await Shop.find({ status: 'ACTIVE' }).sort({ rating: -1 }).limit(20).lean();
        res.json({ success: true, shops });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

const getShopsById = async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await getShopDetailsWithMenu(shopId);
        res.json({ success: true, shop });
    } catch (err) {
        // Lỗi "Không tìm thấy" từ service cũng sẽ được bắt ở đây
        res.status(404).json({ success: false, message: err.message });
    }
};

const getShopWithFoods = async (req, res) => {
  try {
    const { id } = req.params;

    const shop = await Shop.findById(id)
      .populate("owner", "name email")
      .populate("managers", "name phone")
      .populate("reviews.user", "name avatar")
      .lean();

    if (!shop) return res.status(404).json({ message: "Không tìm thấy quán" });

    const [foods, categories] = await Promise.all([
      Food.find({ shop_id: id, is_available: true })
        .populate("category_id", "name")
        .sort({ created_at: -1 })
        .lean(),
      FoodCategory.find({ shop_id: id }).lean(),
    ]);

    res.status(200).json({ shop, foods, categories });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin quán:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


const listCategoryByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;

    // Kiểm tra shop có tồn tại không (nếu cần)
    const shopExists = await Shop.exists({ _id: shopId });
    if (!shopExists) {
      return res.status(404).json({ message: "Không tìm thấy quán" });
    }

    // Lấy tất cả danh mục thuộc quán đó
    const categories = await FoodCategory.find({ shop_id: shopId })
      .sort({ createdAt: -1 })
      .lean();

    if (categories.length === 0) {
      return res.status(404).json({ message: "Quán chưa có danh mục nào" });
    }

    return res.status(200).json({
      message: "Danh sách danh mục món ăn",
      categories,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh mục:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

module.exports = { getNearbyShopsByCoords, searchHome,getShopsByRate,getShopsByType,getShopsById,getShopWithFoods, listCategoryByShopId };



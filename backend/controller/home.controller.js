const mongoose = require("mongoose");
const { findNearbyShops, searchByKeyword, getShopDetailsWithMenu } = require("../services/shop.service");
const Shop = require("../models/shop.model");
const Food = require("../models/food.model");
const FoodCategory = require("../models/foodCategory.model");
const User = require("../models/user.model");
const Favorite = require("../models/favorite.model");


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

    // 1️⃣ Lấy danh sách shop gần vị trí
    const shops = await findNearbyShops(parseFloat(lat), parseFloat(lng), 5000, limit);

    // 2️⃣ Xác định user theo accountId
    let favoriteShopIds = [];
    if (req.user && req.user.accountId) {
      const accountId = req.user.accountId;
      const user = await User.findOne({ account_id: accountId });

      if (user) {
        // 3️⃣ Lấy danh sách shop yêu thích
        const favorites = await Favorite.find({ user: user._id }).select("shop").lean();
        favoriteShopIds = favorites.map(f => f.shop.toString());
      }
    }

    // 4️⃣ Gắn thêm cờ isFavorite vào từng shop
    const shopsWithFavorite = shops.map(shop => ({
      ...shop,
      isFavorite: favoriteShopIds.includes(shop._id.toString()),
    }));

    // 5️⃣ Trả về kết quả
    res.json({
      success: true,
      count: shopsWithFavorite.length,
      shops: shopsWithFavorite,
    });
  } catch (err) {
    console.error("getNearbyShopsByCoords error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
const getShopsByRate = async (req, res) => {
  try {
    // 1️⃣ Lấy danh sách shop active, sort theo rating giảm dần
    const shops = await Shop.find({ status: "ACTIVE" })
      .sort({ rating: -1 })
      .limit(20)
      .lean();

    // 2️⃣ Xác định user từ accountId
    let favoriteShopIds = [];
    if (req.user && req.user.accountId) {
      const accountId = req.user.accountId;
      const user = await User.findOne({ account_id: accountId });

      if (user) {
        // 3️⃣ Lấy danh sách shop yêu thích
        const favorites = await Favorite.find({ user: user._id })
          .select("shop")
          .lean();
        favoriteShopIds = favorites.map(f => f.shop.toString());
      }
    }

    // 4️⃣ Gắn thêm cờ isFavorite
    const shopsWithFavorite = shops.map(shop => ({
      ...shop,
      isFavorite: favoriteShopIds.includes(shop._id.toString()),
    }));

    // 5️⃣ Trả về kết quả
    res.json({
      success: true,
      count: shopsWithFavorite.length,
      shops: shopsWithFavorite,
    });
  } catch (err) {
    console.error("getShopsByRate error:", err);
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
        const { type, lat, lng } = req.query;
        if (!type) {
            return res.status(400).json({ success: false, message: "Loại quán là bắt buộc." });
        }
        if (!lat || !lng) {
            return res.status(400).json({ success: false, message: "Missing lat/lng" });
        }
        // Pass `type` to service so DB filters before expensive OSRM matrix call
        const shops = await findNearbyShops(parseFloat(lat), parseFloat(lng), 5000, 20, type);
        res.json({ success: true, shopsByType: shops });
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

    // 1️⃣ Lấy shop + populate
    const shop = await Shop.findById(id)
      .populate("owner", "name email")
      .populate("managers", "name phone")
      .populate("reviews.user", "name avatar")
      .lean();

    if (!shop)
      return res.status(404).json({ message: "Không tìm thấy quán" });

    // 2️⃣ Lấy danh sách món và danh mục
    const [foods, categories] = await Promise.all([
      Food.find({ shop_id: id, is_available: true })
        .populate("category_id", "name")
        .sort({ created_at: -1 })
        .lean(),
      FoodCategory.find({ shop_id: id }).lean(),
    ]);

    // 3️⃣ Xử lý yêu thích
    let isFavorite = null;

    if (req.user?.accountId) {
      const user = await User.findOne({ account_id: req.user.accountId }).lean();
      if (user) {
        const favorite = await Favorite.findOne({
          user: user._id,
          shop: shop._id,
        }).lean();
        isFavorite = !!favorite;
      } else {
        isFavorite = null;
      }
    }

    // 4️⃣ Trả về kết quả
    res.status(200).json({
      success: true,
      shop: { ...shop, isFavorite },
      foods,
      categories,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin quán:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: error.message });
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

const getRandomShops = async (req, res) => {
  try {
    // 1️⃣ Lấy ngẫu nhiên 4 shop đang hoạt động
    const shops = await Shop.aggregate([
      { $match: { status: "ACTIVE" } },
      { $sample: { size: 4 } },
    ]);

    // 2️⃣ Xác định user theo accountId
    let favoriteShopIds = [];
    if (req.user && req.user.accountId) {
      const accountId = req.user.accountId;
      const user = await User.findOne({ account_id: accountId });

      if (user) {
        // 3️⃣ Lấy danh sách shop yêu thích của user
        const favorites = await Favorite.find({ user: user._id }).select("shop").lean();
        favoriteShopIds = favorites.map(f => f.shop.toString());
      }
    }

    // 4️⃣ Gắn thêm cờ isFavorite vào từng shop
    const shopsWithFavorite = shops.map(shop => ({
      ...shop,
      isFavorite: favoriteShopIds.includes(shop._id.toString()),
    }));

    // 5️⃣ Trả về kết quả
    res.status(200).json({
      success: true,
      count: shopsWithFavorite.length,
      data: shopsWithFavorite,
    });
  } catch (err) {
    console.error("getRandomShops error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const searchShopsAndFoods = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query)
      return res.status(400).json({ success: false, message: "Thiếu từ khóa tìm kiếm" });

    // === TÌM SHOP THEO TÊN ===
    const shops = await Shop.find({
      name: { $regex: query, $options: "i" },
      status: "ACTIVE"
    })
      .select("name logoUrl coverUrl rating")
      .limit(5)
      .lean();

    const formattedShops = shops.map((s) => ({
      type: "shop",
      id: s._id,
      name: s.name,
      image: s.logoUrl || s.coverUrl || "/placeholder.svg",
      rating: s.rating ?? 0
    }));

    // === TÌM FOOD THEO TÊN HOẶC MÔ TẢ ===
    const foods = await Food.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ],
      is_available: true
    })
      .select("name image_url price discount shop_id")
      .populate("shop_id", "name")
      .limit(5)
      .lean();

    const formattedFoods = foods.map((f) => ({
      type: "food",
      id: f._id,
      name: f.name,
      image: f.image_url || "/placeholder.svg",
      price: f.price,
      discount: f.discount,
      shopName: f.shop_id?.name || "Không rõ",
      shopId: f.shop_id?._id,
    }));

    res.status(200).json({
      success: true,
      data: [...formattedShops, ...formattedFoods]
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


const addFavoriteShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const accountId = req.user.accountId;

    if (!shopId || !accountId)
      return res.status(400).json({ success: false, message: "Missing shopId or accountId" });

    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    // ✅ Tạo bản ghi favorite (nếu chưa tồn tại)
    const favorite = await Favorite.findOneAndUpdate(
      { user: user._id, shop: shop._id },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: "Added to favorites", favorite });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: "Already in favorites" });
    res.status(500).json({ success: false, message: err.message });
  }
};


const removeFavoriteShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const accountId = req.user.accountId;

    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const deleted = await Favorite.findOneAndDelete({ user: user._id, shop: shopId });

    if (!deleted)
      return res.status(404).json({ success: false, message: "Favorite not found" });

    res.json({ success: true, message: "Removed from favorites" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFavoriteShops = async (req, res) => {
  try {
    const accountId = req.user.accountId;
    const user = await User.findOne({ account_id: accountId });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Lấy danh sách favorite
    const favorites = await Favorite.find({ user: user._id })
      .populate({
        path: "shop",
        populate: [
          { path: "owner", select: "full_name avatar_url phone" },
          { path: "managers", select: "full_name phone" },
          { path: "reviews.user", select: "full_name avatar_url" }
        ]
      })
      .lean();

    // Lọc ra các shop
    const favoriteShops = favorites
      .map(f => f.shop)
      .filter(Boolean); // loại bỏ shop bị xóa

    res.json({
      success: true,
      count: favoriteShops.length,
      favorites: favoriteShops
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


module.exports = { searchShopsAndFoods, getNearbyShopsByCoords, searchHome,getShopsByRate,getShopsByType,getShopsById,getShopWithFoods, listCategoryByShopId, getRandomShops, addFavoriteShop, removeFavoriteShop, getFavoriteShops };